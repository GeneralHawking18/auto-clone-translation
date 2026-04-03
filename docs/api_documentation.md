# Tài Liệu Giao Tiếp API Dịch (Illustrator ↔ Backend Python)

Dưới đây là tài liệu chuẩn về cấu trúc dữ liệu mà ExtendScript sẽ bắn lên server Python khi chạy tính năng **Import & Dịch Song Song**. Việc nâng cấp thành "chạy ngầm song song" (start /B) về cơ bản là công cụ sẽ tống lên một lúc N request (tương ứng N mã ngôn ngữ) chứ **cấu trúc dữ liệu Payload không đổi**, chỉ là gửi đồng thời.

---

## 1. Endpoint & Phương Thức (Method)

*   **Endpoint Mặc Định:** `POST http://<server_ip>:<port>/api/translate`
*   **Endpoint Có Kèm Context (ưu tiên khi có Context URL đính kèm):** `POST http://<server_ip>:<port>/api/v1/translate/with-context`
*   **Method:** `POST`
*   **Headers:**
    *   `Content-Type: application/json`
    *   `X-API-Key: <your_api_key>` (Nếu có cấu hình trong lúc cài đặt Plugin)

---

## 2. Request Payload (JSON) Gửi Lên

Khi bạn bấm Import CSV gồm nhiều ngôn ngữ, Illustrator sẽ **gửi GỘP 1 Request duy nhất** chứa toàn bộ hệ thống ngôn ngữ (Batch Request) lên Server. Cấu trúc của Request như sau:

```json
{
  "source_lang": "auto",
  "target_langs": [
    { "code": "VI", "name": "Vietnamese" },
    { "code": "HK", "name": "Traditional Chinese (Hong Kong)" }
  ],
  "context_url": "https://docs.google.com/spreadsheets/d/your-google-sheet-id...",
  "items": [
    {
      "id": "item_12345",
      "text": "Xả kho đón Tết",
      "layer_name": "Headline Text",
      "is_button": false
    },
    {
      "id": "item_67890",
      "text": "MUA NGAY",
      "layer_name": "btn_buy",
      "is_button": true
    }
  ]
}
```

### Giải nghĩa tham số Gửi Lên:
*   `source_lang`: Mặc định hệ thống luôn truyền dạng chuỗi `"auto"`.
*   `context_url` *(optional)*: Bị bỏ trống hoặc không có param này nếu không gắn Link Context URL Google Sheet trên giao diện Tool trước khi bấm Import.
*   `target_langs`: Mảng đồ sộ chứa danh sách các ngôn ngữ cần dịch. Tool ExtendScript gửi lên một mảng các Object có chứa `code` (Mã ID ngôn ngữ) và `name` (Tên đầy đủ của ngôn ngữ đó).
    *   *Mục đích của Backend:* Backend gửi `name` cho Prompt AI để AI hiểu rõ cần dịch ra tiếng gì, và Backend bắt buộc dùng `code` làm Key khi trả về bản JSON dịch.
*   `is_button` *(boolean, nằm trong từng item)*: Cờ cho biết cụm text này có thuộc layer nút bấm (button) hay không. Backend nên dựa vào thuộc tính này để điều chỉnh prompt dịch (VD: yêu cầu AI dịch cực ngắn gọn) nhằm tránh phá vỡ layout UI.

> [!TIP]
> Backend Engineer nên tối ưu tốc độ bằng cách nhận array `target_langs` này, bóc tách nó để gọi Async xử lý song song, hoặc mạnh hơn là truyền vào gộp thành 1 Prompt của ChatGPT/Claude để dịch 1 phát ăn trọn 10 ngôn ngữ nhằm tối ưu chi phí Token.

---

## 3. Response Dữ Liệu Trả Về (Từ Backend Về App)

Khi Backend đã chạy dịch xong toàn bộ các nhánh trong mảng Request trên, Backend **bắt buộc** phải trả về một JSON gom nhóm thành **Dictionary/Map**, root vẫn là `translations` và các Key bên trong là cái cấu trúc `code` hồi nãy:

```json
{
  "translations": {
    "VI": [
      {
        "id": "item_12345",
        "text": "Xả kho đón Tết"
      },
      {
        "id": "item_67890",
        "text": "MUA NGAY"
      }
    ],
    "HK": [
      {
        "id": "item_12345",
        "text": "年終清倉"
      },
      {
        "id": "item_67890",
        "text": "立即購買"
      }
    ]
  }
}
```

> [!IMPORTANT]
> - Nếu có 1 nhánh ngôn ngữ bị lỗi (từ chối dịch, timeout), Backend vẫn trả Response bình thường cho các thứ tiếng còn lại. Nếu tiếng Hồng Kông Fail, Backend chỉ đơn giảm trả về nhánh rỗng `"HK": []` hoặc bỏ thẳng Key `"HK"`. Tool Client sẽ tự hiểu.
> - **Tuyệt đối không được thiếu** thuộc tính `"id"`, Illustrator Extension hoàn toàn bám vào id này để trổ lại vào bảng UI.

### Xử lý Ngoại lệ tại Backend (Errors Response)
Nếu Request hỏng toàn tập ngay từ đầu (Ví dụ: Server mất file config, sai API Key, Backend sập Database), cần trả về format `detail.code` riêng biệt để Illustrator Extension bắn Alert Popup cho User:

```json
{
  "detail": {
    "code": "MISSING_API_KEY",
    "message": "You haven't provided a valid API Key."
  }
}
```
