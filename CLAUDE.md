# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Adobe Illustrator client extension (ExtendScript / `.jsx`) that extracts text from selected text frames, sends it to a Python backend for translation, and clones the artwork with translated text. Pairs with a separate Python backend in `../backend` (not in this repo).

The Vietnamese-language `README.md` and `docs/` are authoritative for product behavior; comments and PR/commit-style notes are often Vietnamese — preserve language when editing.

## Common commands

```bash
# Bundle src/ into dist/AutoCloneTranslate.jsx (single concatenated script)
node scripts/build.js

# Full dev cycle: build JSX -> compile Inno Setup installer -> silent install -> reload Illustrator
node scripts/watch.js

# Same pipeline from a CMD prompt, with a menu
build_installer.bat            # interactive
build_installer.bat dev        # builds, kills Illustrator, runs installer with -KeepOpen
```

There are no tests, linter, or type checker. Verification is manual inside Illustrator: `File → Scripts → Other Script…` → pick `dist/AutoCloneTranslate.jsx`.

`scripts/watch.js` hardcodes `ISCC.exe` at `C:\Program Files (x86)\Inno Setup 6\ISCC.exe` and assumes `tools/ReloadAI.vbs` exists (the repo only has `tools/ReloadAI.ps1` — the watch script may need updating before it runs).

## Build model — important constraint

`src/` is **not** a module system. ExtendScript (Illustrator's JS engine) has no `require`, no ES6, no `let`/`const`/arrow functions. Every file declares a top-level global (e.g. `var FontService = { ... }`) and `scripts/build.js` concatenates files **in the explicit order listed in its `FILES` array** into one `.jsx`.

Implications when editing:
- New files must be added to the `FILES` array in `scripts/build.js`, in dependency order (utils first, then shared UI, then features bottom-up by layer: domain → infrastructure → application → presentation, then `MainAppCoordinator`, then `host_app.jsx` last).
- Cross-file references work via globals only — there is no import/export. Do not use ES6+ syntax; stick to ES3-style `var` and function expressions.
- `// #include` lines are stripped at build time (`build.js` rewrites them to `// included by build`). Don't rely on them.
- The bundle is prefixed with a UTF-8 BOM (`﻿`) — required by Illustrator.

## Architecture

Feature-based Clean Architecture. Each feature under `src/features/<name>/` has the four standard layers:

```
domain/          pure data + interfaces (e.g. CloneConfig, TranslationTarget, ILayerRepository)
application/    use cases (orchestration), exposed as singletons with .init(deps)
infrastructure/ adapters that touch Illustrator DOM, HTTP (curl), or external services
presentation/   UI dialogs and views (ScriptUI)
```

Features:
- `extractor` — reads selected `TextFrame`s from the Illustrator document.
- `font` — discovers system fonts and provides selection UI.
- `translator` — talks to the Python backend (`PythonBackendAdapter` via `curl`), Google Sheets (`GoogleSheetAdapter`), or a mock.
- `cloner` — duplicates artboards/layers and applies translations to cloned text frames.
- `app` — `MainAppCoordinator` is the top-level flow controller.

Wiring lives in `src/host_app.jsx` (the entry point). It is the only place that calls each module's `.init(...)` to inject dependencies, then calls `MainAppCoordinator.start()`. There is no DI container — composition is manual and explicit.

`shared/presentation/ui/` holds reusable ScriptUI widgets (`WizardDialog`, `VirtualSlotGrid`).

`src/utils/json2.js` is the Crockford JSON polyfill — Illustrator's older JS engine lacks native `JSON`. Keep it first in the `FILES` array.

## Distribution

This project ships as a Windows installer:
- `setup.iss` — Inno Setup script. Detects installed Illustrator versions under `Program Files\Adobe\Adobe Illustrator *`, lets the user pick which to install into, then copies `AutoCloneTranslate.jsx` into each version's `Presets\<locale>\Scripts\` directory.
- `tools/` — PowerShell helpers installed alongside the script: `CheckUpdate.ps1`, `LoadAction.ps1` (loads the bundled `.aia` Action), `ConfigEditor.ps1` (edits API key / backend URL), `ReloadAI.ps1`, `SafeSaveIllustrator.ps1`.
- `assets/actions/Auto_Clone_Translation.aia` — the Illustrator Action that maps a hotkey to the script.
- Runtime config lives at `%APPDATA%\Auto Clone Translation\api_config.json` (`apiKey`, `backendUrl`). The installer creates it on first install and preserves it on upgrade.

When changing the installer flow, both `setup.iss` (`[Code]` Pascal section) and the relevant `tools/*.ps1` usually need to move together.

## Notes on the `ai-clean-architecture/` folder

`ai-clean-architecture/SKILLS.md` is a Python/FastAPI Clean Architecture spec written in Vietnamese. It is **not** the architecture of this app — this app is ExtendScript, not Python — but the layer-naming convention (domain/application/infrastructure/presentation) is borrowed from it. Don't apply its Python-specific rules (uv, pydantic, FastAPI `Depends`) here.
