/**
 * Cấu hình chung của script
 * @type {Object}
 */
var CONFIG = {
    /** Khoảng cách giữa các bản clone (pixels) */
    SPACING: 30,

    /** Dấu phân cách mặc định (TAB tốt nhất cho design) */
    DEFAULT_SEPARATOR: "\t",

    /** So sánh có phân biệt hoa thường không */
    CASE_SENSITIVE: false,

    /** Số dòng tối thiểu trong file CSV (Header + Reference + Data) */
    MIN_CSV_LINES: 3,

    /** Tên cột chứa thông tin font */
    MASTER_FONT_KEY: "font",

    /** Tên file tạm khi tải từ internet */
    TEMP_FILENAME: "temp_data_illustrator.tsv",

    /** Số bản clone trước mỗi lần redraw */
    REDRAW_INTERVAL: 5,

    /** Độ trễ cho các thao tác async (ms) */
    DELAYS: {
        DOWNLOAD: 1000,
        CLIPBOARD_CHECK: 100,
        CLIPBOARD_TIMEOUT: 3000,
        REFRESH: 100,
        NUDGE: 50
    },

    /** Cấu hình giao diện */
    UI: {
        TITLE: "Tool Auto Fill: Sheet URL & Font",
        BTN_OK: "OK - CHẠY NGAY",
        BTN_CANCEL: "HỦY BỎ",
        BTN_EXPORT_FONT: "Lấy tên Font chuẩn",
        DIALOG_WIDTH: 550,
        DIALOG_HEIGHT: 320
    },

    /** Messages */
    MESSAGES: {
        NO_DOC: "Vui lòng mở file Illustrator.",
        NO_SELECTION: "⚠️ Bạn chưa chọn Group mẫu nào!",
        MULTI_SELECTION: "⚠️ Chỉ chọn 1 Group duy nhất.",
        NOT_GROUP: "⚠️ Đối tượng chọn phải là Group.",
        DOWNLOAD_ERROR: "Không thể tải file từ URL.\n1. Kiểm tra lại mạng.\n2. Đảm bảo Link Sheet đã bật 'Anyone with the link'.",
        ACCESS_ERROR: "LỖI QUYỀN TRUY CẬP!\nGoogle bắt đăng nhập.\nHãy chia sẻ Sheet ở chế độ: 'Anyone with the link' (Bất kỳ ai có đường dẫn).",
        MIN_LINES_ERROR: "File cần ít nhất 3 dòng: Header + Reference + Data."
    }
};
