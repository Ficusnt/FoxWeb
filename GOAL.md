# Persistent Software Development Goal

## TASK

Your task is to port the python program living at FoxReloaded/ to a web app living at FoxWeb/
Analyze thoroughly and carefully each code-base and port every function.

The page is being hosted through Cloudflare and will deploy on github push (I'll take care of pushing commits)

## General Instructions

You are responsible for implementing the task above in the existing project.

Your objective is to deliver a working, tested implementation, not merely produce code or describe a solution.

### 1. Understand Before Changing
- Inspect the project structure and relevant source files.
- Understand the existing architecture, coding conventions, dependencies, and application behavior.
- Identify the exact components and functions affected by the requested changes.
- Inspect existing functionality before modifying it.
- Do not assume that a feature is missing without checking first.
- If requirements are ambiguous and the ambiguity could materially affect the implementation, ask for clarification.

### 2. Plan the Implementation
- Determine the smallest reasonable set of changes needed.
- Prefer modifying existing code over replacing entire components.
- Reuse existing functions, callbacks, classes, and utilities whenever appropriate.
- Identify potential side effects and regression risks.
- Keep the implementation consistent with the existing project.

### 3. Implement
- Make the necessary changes directly in the project files.
- Preserve existing functionality unless the task explicitly requires changing it.
- Avoid unrelated refactoring, redesigns, dependencies, and features.
- Do not leave placeholder implementations or nonfunctional controls.
- Handle errors and edge cases appropriately.
- Keep changes focused and maintainable.

### 4. Test
After implementation, test the actual result.

- Run appropriate syntax checks, static checks, and existing tests.
- Run the application or relevant components whenever possible.
- Exercise the newly implemented functionality.
- Test relevant edge cases.
- Check existing functionality that could have been affected.
- Inspect error messages, logs, and unexpected behavior.

A successful syntax check alone does NOT establish that a feature works.

### 5. Diagnose and Fix
If any test fails:
- Investigate the actual cause.
- Inspect the relevant source code and execution output.
- Correct the implementation.
- Repeat the affected tests.
- Check for additional regressions caused by the correction.

Do not stop after the first failed test or merely report that something is broken.

### 6. Verify Completion
Before declaring the task complete, establish that:

- The requested functionality is implemented.
- The application starts successfully, when applicable.
- The new functionality works as intended.
- Relevant existing functionality still works.
- No known errors introduced by your changes remain.
- All modified files are saved.

If a test cannot be performed, explicitly identify it and explain why.

Never claim that something was tested when it was not.

### 7. Change Safety
- Do not delete unrelated files or data.
- Do not overwrite user work unnecessarily.
- Do not introduce destructive database, configuration, or migration changes without approval.
- Preserve working changes when fixing problems.
- Do not conceal errors or silently work around broken functionality.
- Keep modifications within the scope of the task.

### 8. Persistent Execution
This is an ongoing objective, not a one-shot response.

Continue working across subsequent turns until the task is implemented and verified.

- Do not stop after producing a plan.
- Do not stop after writing the initial implementation.
- Do not consider the task complete merely because the code appears correct.
- Recover from ordinary implementation errors and continue.
- If interrupted by context limits or recoverable execution failures, resume from the current project state.
- If genuinely blocked by missing information, unavailable resources, or required user approval, explain the blocker clearly.

### 9. Final Report
Only declare the goal achieved after completing the verification process.

Report:
1. What was implemented.
2. Which files were modified.
3. Which tests were performed and their results.
4. Any limitations or unverified behavior.
5. Any remaining issues.

**Definition of DONE: The requested functionality works, relevant existing functionality remains intact, and the result has been verified to the extent technically possible.**