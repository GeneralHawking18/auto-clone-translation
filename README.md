HƯỚNG DẪN TẠO SETUP (BẢN LINH HOẠT)
======================================

Thư mục này chứa bộ source để đóng gói installer có tính năng update linh hoạt.
C:\Users\Gener\Documents\scripts\Installer_Flex

CÁC BƯỚC THỰC HIỆN:
-------------------

BƯỚC 1: CHUẨN BỊ FILE CÒN THIẾU
1. Copy file Action "Auto Clone From Sheet.aia" vào đây.
   (Lấy từ Illustrator > Save Actions...)

CƠ CHẾ HOẠT ĐỘNG:
1. Installer copy Script và Action vào máy.
2. Tự động chạy script Load Action.
3. Hiện thông báo yêu cầu người dùng khởi động lại Illustrator.

LƯU Ý: 
- Người dùng cần khởi động lại Illustrator 1 lần để Menu Script được cập nhật.
- Sau khi khởi động lại, phím tắt sẽ hoạt động bình thường.
- Đây là cách cài đặt an toàn nhất, không làm mất dữ liệu của người dùng.

BƯỚC 2: BUILD SETUP.EXE
1. Mở file "setup.iss" bằng Inno Setup.
2. Bấm nút BUILD (tam giác xanh).
3. Xong! File "AutoFillSetup.exe" sẽ xuất hiện.

---

TÍNH NĂNG:
- Khi cài xong, Script sẽ TỰ ĐỘNG mở Illustrator lên để load Action vào.
- Bạn sẽ thấy thông báo "Action loaded successfully".
- Sau đó hiện thông báo "Cài đặt thành công".

LƯU Ý QUAN TRỌNG:
- Lúc cài đặt, nếu Illustrator đang tắt --> Nó sẽ tự bật lên.
- Nếu Illustrator đang bật --> Nó sẽ tự dùng luôn.
- Đây là tính năng tự động giúp khách hàng không phải load tay thủ công.

CÁCH CẤU HÌNH UPDATE SAU NÀY:
- Bạn không cần build lại setup.exe.
- Sau khi cài, file "config.ini" nằm trong: 
  "C:\Program Files (x86)\AutoFill For Illustrator" (hoặc Program Files)
- Bạn chỉ cần bảo người dùng mở file đó ra, sửa dòng "UpdateURL" là xong.
