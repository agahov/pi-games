#!/usr/bin/env python3
"""Run one clean, verified, independently reviewed, committed task per Luna session."""
from __future__ import annotations

import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]


class Stop(RuntimeError):
    pass


def task_status(path: Path) -> str:
    match = re.search(r'^Status:\s*(.+)$', path.read_text(), re.MULTILINE)
    if not match:
        raise Stop(f'Missing Status in {path}')
    return match.group(1).replace('**', '').strip()


def local_path(root: Path, value: str) -> Path:
    path = (root / value).resolve()
    if not path.is_relative_to(root.resolve()):
        raise Stop(f'Path escapes project: {value}')
    return path


def load_plan(root: Path, path: Path) -> dict:
    plan = json.loads(path.read_text())
    tasks = plan.get('tasks')
    checks = plan.get('checks')
    if not isinstance(tasks, list) or not tasks or len(set(tasks)) != len(tasks):
        raise Stop('Plan needs a nonempty unique tasks list')
    for task in tasks:
        if not local_path(root, task).is_file():
            raise Stop(f'Task does not exist: {task}')
    if not isinstance(checks, list) or not checks or any(
        not isinstance(cmd, list) or not cmd or
        any(not isinstance(arg, str) or not arg for arg in cmd) for cmd in checks
    ):
        raise Stop('Plan needs nonempty checks as command argument arrays')
    return plan


def pending_tasks(root: Path, plan: dict) -> list[str]:
    pending = []
    for task in plan['tasks']:
        status = task_status(local_path(root, task))
        if status == 'Done':
            if pending:
                raise Stop(f'Out-of-order Done task: {task}')
        elif status in ('Planned', 'In progress', 'Test', 'Review'):
            pending.append(task)
        else:
            raise Stop(f'{task} has unsupported/blocking status: {status}')
    return pending


def git(root: Path, *args: str) -> str:
    result = subprocess.run(['git', '-C', str(root), *args], capture_output=True, text=True)
    if result.returncode:
        raise Stop(result.stderr.strip() or f'git {args} failed')
    return result.stdout


def require_clean(root: Path) -> None:
    # Whole repository, including sibling projects: never mix someone else's edits.
    top = Path(git(root, 'rev-parse', '--show-toplevel').strip())
    if git(top, 'status', '--porcelain', '--untracked-files=all'):
        raise Stop('Git tree is dirty. Review and commit/stash existing changes yourself, then rerun.')


def run_command(args: list[str], root: Path, log: Path, timeout: int) -> None:
    with log.open('w') as output:
        process = subprocess.Popen(args, cwd=root, stdout=output, stderr=subprocess.STDOUT,
                                   start_new_session=True)
        try:
            code = process.wait(timeout=timeout)
        except (subprocess.TimeoutExpired, KeyboardInterrupt):
            os.killpg(process.pid, signal.SIGTERM)
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGKILL)
                process.wait()
            raise Stop(f'Cancelled or timed out: {args[0]}; log: {log}')
    if code:
        raise Stop(f'Command exited {code}: {args}; log: {log}')


def read_report(path: Path, task: str) -> dict:
    if not path.is_file():
        raise Stop(f'Agent produced no structured report: {path}')
    report = json.loads(path.read_text())
    if report.get('task') != task or report.get('status') != 'complete':
        raise Stop(f'Agent stopped: {json.dumps(report, ensure_ascii=False)}')
    for field in ('issues', 'questions'):
        if report.get(field) != []:
            raise Stop(f'Agent reports {field}: {report.get(field)!r}')
    return report


def snapshot(root: Path) -> tuple[str, tuple]:
    names = git(root, 'ls-files', '-z', '--cached', '--others', '--exclude-standard').split('\0')
    hashes = []
    for name in sorted(set(filter(None, names))):
        path = root / name
        digest = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else 'missing'
        hashes.append((name, digest))
    return git(root, 'status', '--porcelain'), tuple(hashes)


def check_worker_scope(root: Path, head: str) -> None:
    if git(root, 'rev-parse', 'HEAD').strip() != head:
        raise Stop('Agent changed Git HEAD; refusing to continue or commit.')
    top = Path(git(root, 'rev-parse', '--show-toplevel').strip())
    changed = git(top, 'diff', '--name-only', '-z', 'HEAD').split('\0')
    changed += git(top, 'ls-files', '--others', '--exclude-standard', '-z').split('\0')
    for name in filter(None, changed):
        if not (top / name).resolve().is_relative_to(root.resolve()):
            raise Stop(f'Agent changed a file outside the project: {name}')


def agent_prompt(task: str, report: Path, review: bool) -> str:
    assignment = (
        'Independently REVIEW only this task and its current uncommitted implementation. '
        'Inspect git diff and actual code/tests for correctness, architecture, scope and credible evidence. '
        'Do not modify project files, fix issues, or start another task. Report any blocking findings.'
        if review else
        'Execute ONLY this task, following its role/checklist and prerequisites. '
        'Read AGENTS.md, CURRENT.md, RULES.md, the feature/task and linked shared docs. '
        'Set this task In progress; run its acceptance checks. Record evidence and mark Done only if passing. '
        'Update CURRENT.md and feature status according to its handoff, but do NOT start the next task. '
        'If this is a review task, perform independent review/demo/reflection rather than implementation.'
    )
    return (
        f'{assignment}\nTask: {task}\n'
        'Stop for a failed check, blocker, consequential unresolved decision, or out-of-scope work. '
        'Do not silently weaken acceptance criteria or change the runner/plan/workflow to bypass gates. '
        'Do not commit, stage, stash, reset, switch branches, push, change global configuration, '
        'or recursively delegate. Only modify this project (except the report path below). '
        'Already documented dependency advisories are known follow-ups, not permission to fix unrelated dependencies. '
        'Read the available browser skill before browser work. '
        f'Always write JSON report to {report} with this exact schema:\n'
        + json.dumps({'task': task, 'status': 'complete OR blocked', 'issues': [],
                      'questions': [], 'summary': 'What changed or what prevents completion'})
        + '\nUse status complete only when there are no unresolved issues/questions and checks passed. '
        'Never claim evidence you did not observe. Then stop.'
    )


def execute(root: Path, plan_path: Path, args: argparse.Namespace) -> None:
    plan = load_plan(root, plan_path)
    pending = pending_tasks(root, plan)
    if not args.run:
        print('Pending tasks (dry run):\n' + '\n'.join(pending or ['None']))
        return
    require_clean(root)
    if not pending:
        print('All listed tasks are Done. Nothing to run.')
        return
    # Logs/reports are outside the repo and are never part of an implementation commit.
    logs = Path(tempfile.mkdtemp(prefix='pi-task-runner-'))
    print(f'Logs: {logs}', flush=True)
    original_plan = plan_path.read_bytes()
    for number, task in enumerate(pending, 1):
        require_clean(root)
        head = git(root, 'rev-parse', 'HEAD').strip()
        task_path = local_path(root, task)
        before = {other: task_status(local_path(root, other)) for other in plan['tasks'] if other != task}
        if task not in (root / 'CURRENT.md').read_text():
            raise Stop(f'CURRENT.md does not point to next listed task: {task}')
        folder = logs / f'{number:02d}-{task_path.stem}'
        folder.mkdir()
        print(f'Running {task} with {args.provider}/{args.model}, effort {args.thinking}', flush=True)
        for phase in ('implement', 'review'):
            report = folder / f'{phase}.json'
            before_review = snapshot(root) if phase == 'review' else None
            run_command([
                'pi', '--provider', args.provider, '--model', args.model,
                '--thinking', args.thinking, '--no-session', '--no-extensions',
                '--no-skills', '--no-prompt-templates', '-p',
                agent_prompt(task, report, phase == 'review'),
            ], root, folder / f'{phase}.log', args.timeout)
            check_worker_scope(root, head)
            read_report(report, task)
            if before_review is not None and snapshot(root) != before_review:
                raise Stop('Reviewer modified project files; inspect before continuing.')
            if task_status(task_path) != 'Done':
                raise Stop(f'Agent did not mark {task} Done')
            if plan_path.read_bytes() != original_plan:
                raise Stop('Agent changed the task runner plan')
            if any(task_status(local_path(root, other)) != state for other, state in before.items()):
                raise Stop('Agent changed another task status')
            if phase == 'implement':
                for i, command in enumerate(plan['checks'], 1):
                    print(f'Checking: {command}', flush=True)
                    run_command(command, root, folder / f'check-{i}.log', args.check_timeout)
        check_worker_scope(root, head)
        if not git(root, 'status', '--porcelain'):
            raise Stop('Task reports completion but produced no changes to commit')
        git(root, 'diff', '--check')
        git(root, 'add', '-A', '--', str(root))
        git(root, 'commit', '-m', f'task: complete {task_path.stem}', '--only', '--', str(root))
        require_clean(root)
        print(f'Committed {git(root, "rev-parse", "--short", "HEAD").strip()}: {task}', flush=True)
    print('All listed tasks completed, checked, reviewed, and committed.')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan', default='tasks/001-square/runner.json')
    parser.add_argument('--run', action='store_true', help='Execute; default is dry run')
    parser.add_argument('--provider', default='openai-codex')
    parser.add_argument('--model', default='gpt-5.6-luna')
    parser.add_argument('--thinking', default='max', choices=['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'])
    parser.add_argument('--timeout', type=int, default=1800, help='Seconds per agent phase')
    parser.add_argument('--check-timeout', type=int, default=300)
    args = parser.parse_args()
    try:
        if args.timeout <= 0 or args.check_timeout <= 0:
            raise Stop('Timeouts must be positive')
        plan_path = local_path(ROOT, args.plan)
        if args.run:
            lock_path = Path(git(ROOT, 'rev-parse', '--git-path', 'pi-task-runner.lock').strip())
            if not lock_path.is_absolute():
                lock_path = ROOT / lock_path
            with lock_path.open('w') as lock:
                try:
                    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                except BlockingIOError:
                    raise Stop('Another task runner already holds the repository lock')
                execute(ROOT, plan_path, args)
        else:
            execute(ROOT, plan_path, args)
        return 0
    except (Stop, OSError, ValueError, KeyError, TypeError) as error:
        print(f'STOP — user attention required: {error}', file=sys.stderr)
        print('No automatic retry or reset. Inspect logs and working tree before rerunning.', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
