import argparse
import importlib.util
import json
import os
from pathlib import Path
import re
import tempfile
import unittest
from unittest.mock import patch

MODULE_PATH = Path(__file__).resolve().parents[2] / 'scripts' / 'run_tasks.py'
spec = importlib.util.spec_from_file_location('run_tasks', MODULE_PATH)
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)


class RunnerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        runner.git(self.root, 'init')
        runner.git(self.root, 'config', 'user.name', 'Runner test')
        runner.git(self.root, 'config', 'user.email', 'runner@example.invalid')
        self.tasks = ['tasks/one.md', 'tasks/two.md']
        (self.root / 'tasks').mkdir()
        for task in self.tasks:
            (self.root / task).write_text('Status: Planned\n')
        (self.root / 'CURRENT.md').write_text(self.tasks[0])
        self.plan = self.root / 'plan.json'
        self.plan.write_text(json.dumps({'tasks': self.tasks, 'checks': [['check']]}))
        runner.git(self.root, 'add', '.')
        runner.git(self.root, 'commit', '-m', 'baseline')
        self.head = runner.git(self.root, 'rev-parse', 'HEAD')
        self.args = argparse.Namespace(run=True, provider='fake', model='fake', thinking='max',
                                       timeout=2, check_timeout=2)
        self.calls = []

    def fake_command(self, command, root, log, timeout):
        self.calls.append(command[0])
        if command[0] != 'pi':
            return
        prompt = command[-1]
        task = re.search(r'Task: ([^\n]+)', prompt).group(1)
        report = Path(re.search(r'Always write JSON report to (.+) with this exact schema:', prompt).group(1))
        if 'Independently REVIEW' not in prompt:
            (root / task).write_text('Status: Done\n')
            (root / f'{Path(task).stem}.txt').write_text('implemented')
            index = self.tasks.index(task)
            (root / 'CURRENT.md').write_text(self.tasks[index + 1] if index + 1 < len(self.tasks) else 'none')
        report.write_text(json.dumps({'task': task, 'status': 'complete', 'issues': [], 'questions': []}))

    def test_two_tasks_get_separate_commits_after_checks_and_review(self):
        with patch.object(runner, 'run_command', self.fake_command):
            runner.execute(self.root, self.plan, self.args)
        self.assertEqual(self.calls, ['pi', 'check', 'pi', 'pi', 'check', 'pi'])
        self.assertEqual(runner.git(self.root, 'rev-list', '--count', 'HEAD').strip(), '3')
        runner.require_clean(self.root)

    def test_dirty_tree_stops_before_agent(self):
        (self.root / 'unrelated.txt').write_text('user edit')
        with patch.object(runner, 'run_command') as command:
            with self.assertRaisesRegex(runner.Stop, 'dirty'):
                runner.execute(self.root, self.plan, self.args)
            command.assert_not_called()
        self.assertEqual(runner.git(self.root, 'rev-parse', 'HEAD'), self.head)

    def test_failed_check_does_not_commit_or_start_next_task(self):
        def fail(command, *args):
            if command[0] == 'check':
                raise runner.Stop('test failed')
            self.fake_command(command, *args)
        with patch.object(runner, 'run_command', fail):
            with self.assertRaisesRegex(runner.Stop, 'test failed'):
                runner.execute(self.root, self.plan, self.args)
        self.assertEqual(runner.git(self.root, 'rev-parse', 'HEAD'), self.head)
        self.assertEqual(runner.task_status(self.root / self.tasks[1]), 'Planned')

    def test_reviewer_edit_to_untracked_file_is_detected(self):
        def mutate(command, *args):
            self.fake_command(command, *args)
            if command[0] == 'pi' and 'Independently REVIEW' in command[-1]:
                (self.root / 'one.txt').write_text('reviewer changed implementation')
        with patch.object(runner, 'run_command', mutate):
            with self.assertRaisesRegex(runner.Stop, 'Reviewer modified'):
                runner.execute(self.root, self.plan, self.args)
        self.assertEqual(runner.git(self.root, 'rev-parse', 'HEAD'), self.head)

    def test_blocked_report_is_not_success(self):
        report = self.root / 'report.json'
        report.write_text(json.dumps({'task': self.tasks[0], 'status': 'blocked',
                                      'issues': [], 'questions': ['Choose a boundary']}))
        with self.assertRaisesRegex(runner.Stop, 'Agent stopped'):
            runner.read_report(report, self.tasks[0])

    def test_missing_report_and_path_escape_stop(self):
        with self.assertRaises(runner.Stop):
            runner.read_report(self.root / 'absent.json', self.tasks[0])
        with self.assertRaises(runner.Stop):
            runner.local_path(self.root, '../outside.md')

    def test_timeout_stops_process(self):
        with self.assertRaisesRegex(runner.Stop, 'timed out'):
            runner.run_command(['python3', '-c', 'import time; time.sleep(30)'],
                               self.root, self.root / 'timeout.log', 0.1)

    def test_dry_run_does_not_call_agent_or_commit(self):
        self.args.run = False
        with patch.object(runner, 'run_command') as command:
            runner.execute(self.root, self.plan, self.args)
            command.assert_not_called()
        self.assertEqual(runner.git(self.root, 'rev-parse', 'HEAD'), self.head)


if __name__ == '__main__':
    unittest.main()
