# REVIEWER — Judge Prompt Template

Load this file during the **Judge** phase. The agent produces `judge.md` for the current feature.

## Instructions

1. Read `CRITERIA.md`.
2. For each criterion, assess the current feature's output and write one of:
   - `✓ met` — with a brief justification (< 1 sentence).
   - `✗ not met` — with reason and location.
   - `N/A` — with explanation of why it doesn't apply.
3. No scores. This is a gate, not a grade.
4. If any `✗` is found: write `reflection.md` in the feature folder proposing a fix to `RULES.md` or `CRITERIA.md`.
5. If no `✗`: no reflection needed.
6. Update `CURRENT.md` to mark the feature status as `done`.
7. If a rule or criterion changed, append an entry to `LOG.md`.

## Output Format — `judge.md`

```
# Judge: {feature-name}

Date: {date}
Feature: {feature-path}

## Structure
### One sentence per function
{verdict + reason}
### Systems are independent
...
## Documentation
...
## ECS / Game Design
...
## Process
...

## Summary
{count of ✓ / ✗ / N/A}
{if any ✗: list them and point to reflection.md}
