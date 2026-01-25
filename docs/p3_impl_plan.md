# Kế Hoạch Triển Khai Giai Đoạn 2 (Phase 2 Implementation Plan)

**Mục Tiêu:** Hoàn thiện tích hợp Font Manager, xây dựng Backend Service và kết nối End-to-End.

## 1. Backend Service (Python/FastAPI)
Hiện tại Backend chưa được triển khai. Cần xây dựng service tại thư mục `../backend` (hoặc `backend` nếu nằm cùng cấp).

### A. Setup Environment
*   Framework: FastAPI, Uvicorn.
*   Port: `8888` (như đã định nghĩa trong `PythonBackendAdapter`).

### B. API Design
*   **POST** `/api/translate`
    *   **Request Payload**:
        ```json
        {
          "source_lang": "auto",
          "target_lang": "vi",
          "target_font": "Arial",
          "items": [
            { "id": "uuid-1", "text": "Hello", "layer_name": "Layer 1" }
          ]
        }
        ```
    *   **Response Payload**:
        ```json
        {
          "status": "success",
          "data": [
            { "id": "uuid-1", "translated_text": "Xin chào" }
          ]
        }
        ```

### C. Logic Dịch Thuật (Mock/Real)
*   Bước đầu: Implement Mock Translator (trả về text mẫu hoặc append " [Translated]") để test luồng data.
*   Bước sau: Tích hợp Google Translate API (free tier) hoặc OpenAI API.

## 2. Client Side Updates (Illustrator Script)

### A. Font Manager Integration (Đang thiếu sót)
*   **Vấn đề**: `MainTranslatorDialog.js` đang hardcode danh sách font. `scripts/build.js` chưa bundle `font_discovery_use_case.js`. `host_app.jsx` chưa khởi tạo module này.
*   **Action Items**:
    1.  Cập nhật `scripts/build.js`: Thêm `features/font_manager/application/font_discovery_use_case.js` vào danh sách bundle.
    2.  Cập nhật `host_app.jsx`:
        *   Khởi tạo `FontService` và `FontDiscoveryUseCase`.
        *   Truyền danh sách font vào `MainTranslatorDialog.show()`.
    3.  Cập nhật `MainTranslatorDialog.js`:
        *   Nhận tham số `fontList` trong hàm `show`.
        *   Thay thế hardcoded array bằng `fontList`.

### B. Backend Adapter Refinement
*   **Vấn đề**: `PythonBackendAdapter.js` dùng `eval()` để parse JSON.
*   **Action Items**:
    *   Chuyển sang dùng `JSON.parse()` (vì `json2.js` đã được bundle).
    *   Thêm timeout handling tốt hơn cho vòng lặp `while`.

## 3. Quy Trình Build & Test
1.  Chạy `node scripts/build.js` để tạo `dist/AutoCloneTranslate.jsx`.
2.  Start Python Backend server.
3.  Chạy script `.jsx` trong Illustrator.
4.  Verify: Text được extract -> Chọn Font thật từ hệ thống -> Gửi request -> Backend trả về -> Illustrator clone và replace text.
êng? h