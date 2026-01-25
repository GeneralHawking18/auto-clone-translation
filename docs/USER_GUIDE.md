# Hướng Dẫn Sử Dụng - AutoCloneTranslate cho Illustrator

Công cụ này giúp bạn tự động **Clone (Sao chép)** các Text Frame đã chọn trong Adobe Illustrator, sau đó **Dịch (Translate)** nội dung sang ngôn ngữ đích mà giữ nguyên định dạng.

---

## 1. Yêu Cầu Hệ Thống

*   **Adobe Illustrator**: Phiên bản 2024, 2025 hoặc 2026.
*   **Python Backend**: Server AI dịch thuật phải đang chạy (xem hướng dẫn phần Backend).
*   **Kết nối Internet**: Để gọi API dịch thuật (nếu backend dùng API online).

---

## 2. Cài Đặt

1.  Chạy file bộ cài `AutoCloneTranslationSetup.exe`.
2.  Làm theo hướng dẫn trên màn hình (Next > Install > Finish).
3.  Sau khi cài xong, một bảng thông báo sẽ hiện ra xác nhận **"Action đã được tự động nạp"**.

---

## 3. Cách Sử Dụng

### Bước 1: Khởi động Backend
Đảm bảo bạn đã chạy server Python.
*   Chạy file `backend/run.bat`.
*   Cửa sổ đen (Console) hiện lên báo `Uvicorn running on http://127.0.0.1:8000` là thành công.

### Bước 2: Thao tác trong Illustrator
1.  Mở file thiết kế `.ai` của bạn.
2.  Dùng công cụ **Selection Tool (V)** để chọn các Text Frame bạn muốn dịch.
    *   *Lưu ý: Bạn có thể chọn nhiều Text Frame cùng lúc.*

### Bước 3: Chạy Tool
Có 2 cách để chạy tool:

**Cách A: Dùng Action (Nhanh nhất)**
1.  Mở bảng Actions (`Window` > `Actions`).
2.  Tìm bộ Action tên **"Auto_Clone_Translation"** (nếu chưa thấy, hãy thử khởi động lại Illustrator).
3.  Bấm nút **Play** (hình tam giác) hoặc dùng phím tắt (nếu đã gán, thường là `F5` hoặc `Shift+F5`).

**Cách B: Dùng Menu Scripts**
1.  Vào menu `File` > `Scripts` > `AutoCloneTranslate`.

### Bước 4: Chọn Ngôn Ngữ
1.  Một hộp thoại sẽ hiện ra, liệt kê các đoạn văn bản bạn đã chọn.
2.  Chọn **Ngôn Ngữ Đích (Target Language)** từ danh sách (ví dụ: Vietnamese, English, Chinese...).
3.  (Tùy chọn) Chọn **Font Chữ** nếu bạn muốn đổi font cho bản dịch.
4.  Bấm nút **PROCEED**.
5.  Chờ trong giây lát, tool sẽ tự động Clone, Dịch và điền văn bản mới.

---

## 4. Dành Cho Nhà Phát Triển (Developer)

Nếu bạn muốn chỉnh sửa code của tool này:

### Cấu Trúc
*   `src/`: Chứa source code gốc (chia thành các modules).
*   `scripts/build.js`: Script dùng để đóng gói code từ `src` thành 1 file `.jsx` (Chạy lệnh: `node scripts/build.js`).
*   `dist/`: Chứa file kết quả `AutoCloneTranslate.jsx`.

### Quy Trình Build Trang Bị (Mới)
Chúng tôi đã cung cấp script tự động để bạn không cần gõ lệnh thủ công.

**1. Trên Windows (CMD/PowerShell):**
Sử dụng file `build_installer.bat`.
*   **Chạy Menu:** Double-click file `build_installer.bat` (hoặc gõ `.\build_installer.bat` trong terminal) -> Chọn tùy chọn.
*   **Chạy nhanh Dev Mode:** Gõ lệnh `build_installer.bat dev`.
*   **Chạy nhanh Build Full:** Gõ lệnh `build_installer.bat` rồi chọn 2.

**2. Trên Git Bash (Windows):**
Sử dụng file `build.sh`.
*   **Build Full:** `./build.sh`
*   **Dev Mode:** `./build.sh --dev`

### Chế Độ Phát Triển (Dev Mode)
Chế độ này giúp bạn code nhanh hơn mà không cần thao tác lặp lại.
*   **Cách chạy:** Chọn "Dev Mode" từ menu hoặc dùng tham số `dev`.
*   **Tính năng:**
    1.  Tự động **theo dõi (watch)** các file trong `src/`.
    2.  Khi bạn lưu file (Ctrl+S), nó sẽ **Build lại ngay lập tức**.
    3.  Tự động **TẮT và KHỞI ĐỘNG LẠI (Restart)** Adobe Illustrator.
    4.  Tự động **Chạy Script** mới nhất để bạn kiểm tra kết quả.

*Lưu ý: Hãy Save file thiết kế AI của bạn trước khi sửa code, vì Illustrator sẽ bị tắt đột ngột.*

### Đóng Gói Installer (Thủ công - Nếu cần)
Script trên đã bao gồm bước này (Full Build). Tuy nhiên nếu muốn chạy tay:
1.  Cài phần mềm **Inno Setup Compiler**.
2.  Mở file `setup.iss`.
3.  Bấm nút **Run** (Play) trên thanh công cụ của Inno Setup.
