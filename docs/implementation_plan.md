# Kế Hoạch Triển Khai: Hệ Thống Dịch Thuật Client-Server

## 1. Kiến Trúc Tổng Quan
*   **Backend**: Python/FastAPI.
*   **Client**: Illustrator Script (Clean Architecture).

## 2. Cấu Trúc Dự Án (Folder Structure & Naming)

```
Repo_Root/
├── backend/                  # [PYTHON] Server App
│   └── ...
│
├── client/                   # [JS] Illustrator Script
│   ├── src/                  # Source Code
│   │   ├── features/
│   │   │   ├── extractor/        # [Feature 1] Trích xuất dữ liệu (Was Scanner)
│   │   │   │   ├── application/
│   │   │   │   │   └── ExtractSelectedTextUseCase.js
│   │   │   │   ├── domain/
│   │   │   │   │   ├── TextItem.js
│   │   │   │   │   └── ITextRepository.js
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── AdobeSelectionRepository.js
│   │   │   │   └── presentation/
│   │   │   │       └── TextListView.js
│   │   │   │
│   │   │   ├── translator/       # [Feature 2]
│   │   │   │   ├── application/
│   │   │   │   │   └── SubmitTranslationUseCase.js
│   │   │   │   ├── domain/
│   │   │   │   │   ├── TranslationJob.js
│   │   │   │   │   └── ITranslationService.js
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── PythonBackendAdapter.js
│   │   │   │   └── presentation/
│   │   │   │       └── MainTranslatorDialog.js
│   │   │   │
│   │   │   └── cloner/           # [Feature 3]
│   │   │       ├── application/
│   │   │       │   └── CloneAndReplaceUseCase.js
│   │   │       ├── infrastructure/
│   │   │       │   └── AdobeLayerService.js
│   │   │       └── presentation/
│   │   │           └── NotificationView.js
│   │   │
│   │   └── host_app.jsx          # Entry Point
│   │
│   └── scripts/              # Build & Utility Scripts
│       └── build.js          # Bundle Script
│
└── docs/
```

## 3. Chi Tiết Implementation

### Feature: Scanner
*   **Domain**: `TextItem` (id, content, layerName).
*   **Infrastructure**: `AdobeSelectionRepository` thực thi việc duyệt `app.activeDocument.selection`.

### Feature: Translator
*   **Domain**: `TranslationJob` (sourceLang, targetLang, items[]).
*   **Infrastructure**: `PythonBackendAdapter` dùng `curl` gọi API.
*   **Presentation**: `MainTranslatorDialog` là Window chính, import `TextListView` từ Scanner để hiển thị.

### Feature: Cloner
*   **Infrastructure**: `AdobeLayerService` thực thi `element.duplicate()`.
