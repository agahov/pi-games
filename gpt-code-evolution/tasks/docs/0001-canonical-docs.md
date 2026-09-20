# Canonical docs and skills

Status: Done

- **Scope.** User-requested documentation cleanup; no runtime/test changes.
- **Removed.** Unused square-architecture redirect, duplicated intent summary, and plain skills/*.md checklists.
- **Canonical.** doc/workflow.md owns roles; doc/documentation.md owns document rules; doc/ecs-checklist.md owns ECS checks. RULES.md only links them.
- **Skills.** Six `.pi/skills/<name>/SKILL.md` entry points use name/description frontmatter and relative doc references; existing grill-me remains unchanged.
- **Indexes.** Root README owns setup; task READMEs retain ordering/history. Project navigation moved to doc/map.md.
- **Validation.** Python local-link/frontmatter scan passed for 38 Markdown files and six new skills before this evidence record. Static validation only; discovery not tested in a new pi session.
- **Checks.** `python3 -m unittest discover -s tests/runner -v` (8 tests), `npm run test:unit` (14), `npm run test:e2e` (2), `npm run typecheck`, `npm run build` passed.
- **Handoff.** Feature 001 remains Test; 0015 review is still next.
