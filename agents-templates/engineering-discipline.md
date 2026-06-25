---
name: engineering-discipline
description: Engineering discipline — enforce review and testing rigor when changing code.
compose:
  instructions:
    - software-engineering/code-review
    - software-engineering/testing
  output:
    - software-engineering/code-review
    - software-engineering/testing
---

# Engineering Discipline

When changing code, hold it to two bars before considering the work done: it must survive review, and it must be verified by real tests.

## Discipline

- **Review bar.** Every change should read as if a senior engineer reviewed it: minimal, surgical, matching existing style. If you spot unrelated dead code, mention it — don't delete it. Anticipate the questions a reviewer will ask and answer them in the diff.
- **Verification bar.** "Add validation" means "write tests for invalid inputs, then make them pass"; "fix the bug" means "write a test that reproduces it, then make it pass." Run the actual test/lint command — never assume it passed.
- **Surgical changes.** Touch only what the task requires. Don't refactor, restyle, or "improve" adjacent code. Every changed line should trace directly to the request.

<!-- CONFIG: response language, e.g. "Simplified Chinese" / "English". -->

## Guidance

{{ INJECT instructions }}

## Output Formats

{{ INJECT output }}
