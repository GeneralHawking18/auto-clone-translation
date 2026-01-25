# Yêu Cầu Tính Năng: Auto-Detect Text & Translate

## 1. Tổng Quan
Tính năng tự động phát hiện văn bản trong các đối tượng được chọn trên Adobe Illustrator, cho phép người dùng xem trước, lựa chọn ngôn ngữ và font chữ đích, sau đó tự động dịch và tạo bản sao (clone) với nội dung đã được bản địa hóa.

## 2. Quy Trình Nghiệp Vụ (User Workflow)
1.  **Bước 1: Chọn Đối Tượng (Selection)**
    *   Người dùng sử dụng công cụ Selection Tool (V) để chọn một hoặc nhiều đối tượng (Group, TextFrame, Shape...) trên Artboard.
2.  **Bước 2: Kích Hoạt (Activation)**
    *   Người dùng bấm phím tắt (Shortcut) đã được cấu hình (thông qua Illustrator Action).
3.  **Bước 3: Xem Trước & Cấu Hình (Review & Configuration)**
    *   Hệ thống tự động quét (Scan) các đối tượng được chọn để tìm TextFrame.
    *   Hiển thị giao diện **Translation Panel** gồm:
        *   **Danh sách Text**: Liệt kê các nội dung văn bản tìm thấy. Người dùng có thể bỏ chọn các mục không muốn dịch.
        *   **Source Language**: Tự động phát hiện (Auto).
        *   **Target Language**: Dropdown chọn ngôn ngữ đích (Ví dụ: Tiếng Việt, Tiếng Anh, Tiếng Nhật...).
        *   **Target Font**: Dropdown chọn Font chữ sẽ áp dụng cho văn bản dịch (lấy từ font hệ thống).
4.  **Bước 4: Xử Lý (Processing)**
    *   Người dùng bấm nút **"PROCEED"**.
    *   Client gửi dữ liệu sang **Python Backend Service** để thực hiện dịch thuật (sử dụng AI/API).
5.  **Bước 5: Tạo Kết Quả (Cloning & Replacement)**
    *   Hệ thống nhận kết quả dịch.
    *   Tự động **Clone** (sao chép) nhóm đối tượng ban đầu.
    *   Thay thế văn bản gốc bằng văn bản dịch.
    *   Áp dụng Font chữ mới đã chọn.
    *   (Tùy chọn) Tự động sắp xếp vị trí bản sao mới để không đè lên bản gốc.

## 3. Yêu Cầu Kỹ Thuật (Architecture)
Hệ thống hoạt động theo mô hình **Client-Server** để đảm bảo hiệu năng và khả năng mở rộng:

### A. Client App (Illustrator)
*   Chạy trên môi trường Adobe Illustrator (ExtendScript/CEP).
*   **Trách nhiệm**:
    *   Giao diện người dùng (UI).
    *   Thao tác với DOM của Illustrator (Scan, Clone, Replace Text).
    *   Giao tiếp với Backend.

### B. Backend App (Python)
*   Chạy như một dịch vụ độc lập (Standalone Service), sử dụng FastAPI.
*   **Trách nhiệm**:
    *   Kết nối với các dịch vụ AI Translation (Google Translate, OpenAI...).
    *   Xử lý logic ngôn ngữ phức tạp.
    *   Quản lý cấu hình Font Mapping thông minh.