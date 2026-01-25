# Auto Translate for Illustrator (Client App)

Đây là Client Script chạy trên Adobe Illustrator, kết nối với Python Backend để thực hiện dịch thuật tự động.

## Cấu Trúc Thư Mục
*   `src/`: Mã nguồn chính (theo Clean Architecture).
*   `scripts/`: Chứa `build.js` để đóng gói code.
*   `dist/`: Chứa file `.jsx` đã đóng gói (kết quả build).

## Hướng Dẫn Sử Dụng

### 1. Yêu Cầu
*   **Node.js**: Cần cài để chạy script build (không cần cho Illustrator).
*   **Python Backend**: Phải đang chạy (xem folder `../backend`).

### 2. Cách Build code
Mỗi khi bạn sửa code trong `src/`, bạn cần "build" lại thành một file `.jsx` duy nhất.

1.  Mở Terminal tại thư mục `app`.
2.  Chạy lệnh:
    ```bash
    node scripts/build.js
    ```
3.  Kết quả sẽ nằm tại: `dist/AutoCloneTranslate.jsx`.

### 3. Cách Chạy trên Illustrator
1.  Bật **Backend Server** trước (`backend/run.bat`).
2.  Mở Adobe Illustrator.
3.  Vẽ một vài Text Frames và **Chọn chúng (Select)**.
4.  Vào menu: `File` -> `Scripts` -> `Other Script...` (Ctrl+F12).
5.  Tìm và chọn file `app/dist/AutoCloneTranslate.jsx`.
6.  Giao diện sẽ hiện ra. Chọn ngôn ngữ và bấm **PROCEED**.

### 4. Debugging
*   Script sử dụng `curl` để gọi API. Đảm bảo Windows của bạn có thể chạy `curl` từ CMD.
*   Nếu không thấy UI hiện ra, kiểm tra xem bạn đã chọn Text nào chưa.

---
**Lưu ý**: Để tiện lợi, bạn nên tạo Action trong Illustrator để gán phím tắt cho việc chạy Script này.
