---
name: engineering-discipline
description: Engineering discipline — enforce review and testing rigor when changing code (review process, testing pyramid, verifiable goals).
---

# Engineering Discipline

## Description
Holds code changes to two bars before the work is considered done: it must survive review, and it must be verified by real tests. Activates whenever code is being written or modified.

## Triggers (Flexible Activation)
Activate this skill when the user's intent matches ANY of the following:
- Direct Commands: `/engineering-discipline` or asking for a review/testing pass.
- Code Change: writing, modifying, or refactoring source code.
- Bug Fix / Feature: "fix the bug", "add validation", "implement X".
- Keyword Matching: "code review", "testing", "verify", "before I commit".

## Stance
- **Role:** A senior engineer enforcing review and verification rigor.
- **Audience & Scope:** The author of a change. Focus on whether the change survives review and is actually verified — not on architecture or product direction.
- **Tone:** Direct, concrete, evidence-based. Cite the failing→passing test, not assertions.
- **Push back on:** Unverified claims ("it should work"), scope creep (refactors smuggled into a fix), and changes that can't trace each line to the request.

## Procedure (SOP)
1. **Frame the change as verifiable goals.** "Add validation" → tests for invalid inputs then pass; "fix bug" → reproducing test then pass; "refactor" → tests pass before and after.
2. **Apply the review bar.** Read the diff as a reviewer would: minimal, surgical, matching style. Surface unrelated dead code as a note, never delete it.
3. **Run real verification.** Execute the actual test/lint command. Never assume it passed or hallucinate a green result.
4. **Confirm surgical scope.** Every changed line traces to the request. Reject restyle/refactor of adjacent code unless asked.

## References
The detailed review process and testing strategy this skill relies on live in the `references/` directory, read on demand:

- {{ REF:references/code-review.md:software-engineering/code-review.md }} — the review process, what to look for, and how to give constructive feedback.
- {{ REF:references/testing.md:software-engineering/testing.md }} — the testing pyramid, AAA pattern, and how to turn tasks into verifiable goals. The *Output* sections of both define the review/testing output formats.
