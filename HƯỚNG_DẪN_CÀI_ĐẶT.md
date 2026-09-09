# ProHire — Hướng dẫn cài đặt và chạy

Website tuyển dụng trực tuyến, đang phát triển thêm chức năng đánh giá năng lực ứng viên.

Hệ thống gồm **2 thành phần**:

| Thành phần | Port | Vai trò |
|---|---|---|
| `Database-main` | 5000 | Máy chủ dữ liệu (json-server + upload ảnh) |
| `recruitment-frontend` | 3005 | Giao diện web (React) |

> **Không cần MongoDB.** Thư mục `agora-backend` (phỏng vấn video) đã ngừng sử dụng và không nằm trong repo.

---

## 1. Yêu cầu

- **Node.js** >= 18 (đã kiểm thử trên v22)
- **npm** >= 9

Không cần cài thêm cơ sở dữ liệu nào — dữ liệu nằm trong `Database-main/database.json`.

## 2. Cài đặt

```bash
git clone <repository-url>
cd webtite-td

# Máy chủ dữ liệu
cd Database-main
npm install
cd ..

# Giao diện web
cd recruitment-frontend
npm install --legacy-peer-deps
cd ..
```

> Cần cờ `--legacy-peer-deps` vì package `react-facebook-login` khai báo yêu cầu React 16,
> trong khi dự án dùng React 18. Không có cờ này npm sẽ báo lỗi `ERESOLVE`.

## 3. Chạy

Mở **2 cửa sổ terminal**.

**Terminal 1 — máy chủ dữ liệu (chạy trước):**
```bash
cd Database-main
npm run server
```
Chạy tại http://localhost:5000

**Terminal 2 — giao diện web:**
```bash
cd recruitment-frontend
npm start
```
Chạy tại **http://localhost:3005**

Lần biên dịch đầu có thể mất 2–3 phút.

## 4. Tài khoản đăng nhập

| Email | Mật khẩu | Vai trò |
|---|---|---|
| `hung.ungvien@gmail.com` | `123456` | Ứng viên |
| `hung.tuyendung@gmail.com` | `123456` | Nhà tuyển dụng |
| `hung.admin@gmail.com` | `123456` | Quản trị viên |
| `admin@gmail.com` | `1` | Quản trị viên |

Đăng nhập được kiểm tra trực tiếp với `Database-main/database.json`
(xem `src/services/authService.js`). Tài khoản phải có trường `password`
và `status: "active"` mới đăng nhập được.

## 5. Kiểm tra hoạt động

```bash
curl http://localhost:5000/jobs          # danh sách tin tuyển dụng
curl http://localhost:5000/users         # danh sách người dùng
curl http://localhost:3005/              # giao diện web
```

---

## Cấu hình port

Port khai báo trong `recruitment-frontend/.env`:

```env
PORT=3005
REACT_APP_API_URL=http://localhost:5000
```

Sửa `.env` xong **phải khởi động lại** `npm start` — Create React App chỉ đọc
`.env` lúc khởi động, không nhận thay đổi khi đang chạy.

> **Không nên đổi port 5000.** Nó bị viết cứng trong
> `src/services/authService.js` và trong các URL ảnh đã lưu ở `database.json`.

---

## Những lỗi thường gặp

**Port đã bị chiếm**
```powershell
netstat -ano | findstr :3005
taskkill /PID <pid> /F
```

**Sửa `database.json` mà web không thấy thay đổi**
`json-server` đọc file **một lần lúc khởi động**. Phải khởi động lại
`npm run server` sau khi sửa file.

**`Error: Cannot find module 'json-server'`**
Phải dùng đúng phiên bản **0.17.4**. Bản `1.0.0-beta` là ESM-only, không dùng
được với `require()` trong `server-with-upload.js`:
```bash
cd Database-main
npm install json-server@0.17.4
```

**Lỗi CORS hoặc web không lấy được dữ liệu**
Kiểm tra `Database-main` đã chạy chưa (`curl http://localhost:5000/jobs`),
và `REACT_APP_API_URL` trong `.env` có đúng không.

**Đăng nhập báo sai mật khẩu dù nhập đúng**
Tài khoản trong `database.json` thiếu trường `password` (tài khoản chỉ đăng
nhập qua Google), hoặc `status` khác `"active"`.

---

## Cấu trúc dự án

```
webtite-td/
├── Database-main/               # Máy chủ dữ liệu (port 5000)
│   ├── database.json            # Toàn bộ dữ liệu hệ thống
│   ├── server-with-upload.js    # json-server + API upload ảnh
│   └── uploads/                 # Ảnh người dùng tải lên (không đưa lên git)
│
├── recruitment-frontend/        # Giao diện web (port 3005)
│   ├── public/image/            # Ảnh tĩnh: banner, logo, ảnh mặc định
│   └── src/
│       ├── styles/tokens.css    # Bảng màu và kích thước dùng chung
│       ├── theme/antdTheme.js   # Cấu hình theme Ant Design
│       ├── components/          # Component dùng lại
│       ├── layouts/             # Khung trang theo vai trò
│       ├── pages/               # Trang, chia theo vai trò
│       ├── routes/AppRoutes.js  # Khai báo đường dẫn
│       └── services/            # Gọi API
│
└── HƯỚNG_DẪN_CÀI_ĐẶT.md
```

## Công nghệ sử dụng

**Giao diện:** React 18, Redux Toolkit, React Router 7, Ant Design 5,
Bootstrap 5, Chart.js, Formik + Yup

**Máy chủ dữ liệu:** Node.js, Express, json-server 0.17.4, Multer

---

## Ghi chú cho người tiếp nhận

Vài điều không nhìn ra được từ code:

**Dữ liệu chưa dùng hệ quản trị CSDL.** Toàn bộ dữ liệu nghiệp vụ nằm trong
một file JSON, đọc/ghi qua `json-server`. Không có transaction, không có ràng
buộc khóa ngoại, không index. Hai request ghi cùng lúc có thể làm mất dữ liệu.
Đây là điểm cần chuyển sang MongoDB hoặc MySQL khi làm chức năng đánh giá
năng lực, vì thi trực tuyến sẽ có nhiều người nộp bài cùng lúc.

**Quy ước ID dễ gây nhầm.** Hai bảng dưới đây lưu `users.id`, **không phải**
id của bảng tương ứng:

```
jobs.employerId          = users.id     (không phải employers.id)
applications.candidateId = users.id     (không phải candidates.id)
```

Muốn lấy hồ sơ công ty từ một tin tuyển dụng thì phải gọi
`GET /employers?userId=<jobs.employerId>`, chứ không phải
`GET /employers/<jobs.employerId>`.

**Vài chỗ dùng `==` là có chủ đích.** Id trong `database.json` là chuỗi
(`"3929"`), còn một số chỗ so sánh với số. Đổi sang `===` sẽ làm mất chức năng.

**Còn một số file mồ côi** không được import ở đâu:
`ModernHomePage.js`, `SearchBar.js`, `JobDetail.backup.js`.
Có thể xóa nhưng nên kiểm tra lại trước.
