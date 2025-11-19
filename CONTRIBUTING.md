# Contributing to RLD+

Thank you for your interest in contributing to RLD+! We welcome contributions from both human developers and AI agents. Please follow these guidelines to ensure a smooth collaboration and high-quality codebase.

## Development Workflow

1.  **Fork and Clone:** Fork the repository and clone it locally.
2.  **Branching:** Create a new branch for your feature or fix (e.g., `feature/new-timer-logic` or `fix/popup-layout`).
3.  **Code Style:**
    - Adhere to industry best practices for JavaScript, HTML, and CSS.
    - Keep code modular and readable.
    - Use meaningful variable and function names.
    - Ensure proper indentation and formatting (Prettier is recommended).
    - Avoid global variables where possible; use modules or closures.

4.  **Testing:**
    - Run `npm test` before submitting your changes to ensure all tests pass.
    - If you add new utility functions or core logic, write corresponding tests in the `tests/` directory.
    - Follow the existing test structure using Vitest.
    - Aim for clear, descriptive test names that explain what is being tested.


## Documentation & Versioning

We strictly adhere to **Semantic Versioning** (MAJOR.MINOR.PATCH).

### When making changes:

1.  **Update CHANGELOG.md:**
    - Add a new entry under `[Unreleased]` or the new version number.
    - Categorize changes under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, or `Security`.
    - Be concise but descriptive.

2.  **Update README.md:**
    - If you add a new feature, update the **Features** list.
    - If the usage changes, update the **How to Use** section.
    - Ensure screenshots are up-to-date if the UI changes significantly.

3.  **Prepare Store Descriptions (for Releases):**
    - If your changes warrant a new release (minor or major), create a new text file in `docs/descriptions/` named `rld-plus-vX.Y.Z.txt`.
    - Copy the format from previous versions.
    - Highlight the new features and improvements.
    - This file is used to copy-paste into the Chrome Web Store submission form.

4.  **Update ARCHITECTURE.md:**
    - If you modify the core architecture (e.g., adding new components, changing data flow, or altering the storage schema), update `ARCHITECTURE.md` to reflect these changes.
    - Keep the documentation accurate so future contributors can quickly understand the system.

## For AI Agents & LLMs

If you are an AI agent working on this codebase, please follow these additional protocols:

1.  **Context First:** Start by reading `src/manifest.json` to understand the extension's permissions and entry points (`background.js`, `popup.html`, `content.js`).
2.  **Task Tracking:** If a `task.md` exists in your memory or workspace, keep it updated. Break down complex requests into granular tasks.
3.  **Verification:**
    - Since automated tests may not cover everything, explicitly plan your manual verification steps.
    - Use the `walkthrough.md` artifact to document how to verify your changes.
4.  **Minimal Changes:** Avoid rewriting entire files if a targeted edit suffices. This preserves comments and structure.
5.  **Communication:** When you encounter ambiguity, ask the user for clarification rather than making assumptions.

## Release Process

1.  Run `./deploy.sh` (with appropriate flags like `--minor` or `--patch`) to package the extension. This script automatically updates the version in `manifest.json`.
2.  Upload the generated `.zip` file to the Chrome Web Store.
3.  Use the corresponding `docs/descriptions/rld-plus-vX.Y.Z.txt` file to copy-paste the description into the Chrome Web Store submission form.
