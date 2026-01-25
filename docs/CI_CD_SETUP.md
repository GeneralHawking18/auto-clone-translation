# Hướng Dẫn CI/CD Đầy Đủ cho Installer_Flex

Tài liệu này là hướng dẫn toàn diện về CI/CD (Continuous Integration / Continuous Deployment) cho dự án Installer_Flex - một Adobe Illustrator Extension với hệ thống phát hành tự động trên GitHub Actions.

---

## Mục Lục

- [Hướng Dẫn Nhanh (Quick Start)](#hướng-dẫn-nhanh-quick-start) ⭐
1. [Giới Thiệu Tổng Quan](#1-giới-thiệu-tổng-quan)
2. [Thiết Lập Từ Đầu](#2-thiết-lập-từ-đầu)
3. [Hiểu Về GitHub Actions Workflow](#3-hiểu-về-github-actions-workflow)
4. [Phát Triển Local](#4-phát-triển-local)
5. [Quản Lý Phiên Bản](#5-quản-lý-phiên-bản)
6. [Quy Trình Release](#6-quy-trình-release)
7. [Branch Strategy & Git Workflows](#7-branch-strategy--git-workflows)
8. [Hệ Thống Auto-Update](#8-hệ-thống-auto-update)
9. [Advanced Git Workflows](#9-advanced-git-workflows)
10. [Security & Best Practices](#10-security--best-practices)
11. [Phụ Lục](#11-phụ-lục)

---

## Hướng Dẫn Nhanh (Quick Start)

> Dành cho người đã setup xong và muốn chạy CI/CD nhanh.
> Nếu chưa setup, xem [Thiết Lập Từ Đầu](#2-thiết-lập-từ-đầu).

### Chạy Release Mới (3 bước)

```bash
# 1. Commit code của bạn
git add .
git commit -m "feat: mô tả thay đổi"

# 2. Tạo tag với version mới (theo Semantic Versioning)
git tag v1.0.1

# 3. Push cả code và tag lên GitHub
git push origin main --tags
```

**Kết quả:** GitHub Actions sẽ tự động:
- Build JSX script
- Build installer `AutoCloneTranslationSetup.exe`
- Tạo GitHub Release với file installer đính kèm

### Kiểm Tra Workflow

1. Vào GitHub repo → Tab **Actions**
2. Xem workflow đang chạy (màu vàng) hoặc đã hoàn tất (màu xanh)
3. Nếu lỗi (màu đỏ), click vào để xem logs

### Quy Tắc Đặt Version (Semantic Versioning)

| Loại thay đổi | Version | Ví dụ |
|---------------|---------|-------|
| Fix bug nhỏ | PATCH +1 | v1.0.0 → v1.0.1 |
| Thêm tính năng mới | MINOR +1 | v1.0.1 → v1.1.0 |
| Breaking changes | MAJOR +1 | v1.1.0 → v2.0.0 |

### Lệnh Thường Dùng

```bash
# Xem tất cả tags
git tag

# Xem version hiện tại
git describe --tags --abbrev=0

# Xóa tag local (nếu tạo nhầm)
git tag -d v1.0.1

# Xóa tag trên remote (nếu đã push nhầm)
git push origin --delete v1.0.1

# Build local để test trước khi release
npm run build              # Build JSX
.\build_installer.bat      # Build installer (chọn option 2)
```

### Checklist Trước Khi Release

- [ ] Code đã test và hoạt động đúng
- [ ] Build local thành công (`npm run build`)
- [ ] Version tag đúng format (`v1.x.x`)
- [ ] Commit message rõ ràng

### Troubleshooting Nhanh

| Vấn đề | Giải pháp |
|--------|-----------|
| Workflow không chạy | Kiểm tra tag đúng format `v*` (phải có chữ `v`) |
| Build JSX lỗi | Chạy `npm run build` local để xem lỗi chi tiết |
| Installer build lỗi | Kiểm tra Inno Setup cài đúng, chạy `.\build_installer.bat` local |
| Release không có file | Kiểm tra tên file trong workflow = `AutoCloneTranslationSetup.exe` |

---

## 1. Giới Thiệu Tổng Quan

### 1.1 CI/CD là gì?

**CI/CD** là viết tắt của **Continuous Integration** (Tích hợp liên tục) và **Continuous Deployment** (Triển khai liên tục):

- **Continuous Integration (CI):** Tự động build và test code mỗi khi có thay đổi
- **Continuous Deployment (CD):** Tự động phát hành phiên bản mới cho người dùng

**Lợi ích cho dự án này:**
- Tự động build installer mỗi khi release
- Đảm bảo version number nhất quán
- Phát hành nhanh chóng và đáng tin cậy
- Người dùng nhận update tự động qua CheckUpdate.ps1

### 1.2 Kiến Trúc Hệ Thống

```
┌─────────────────┐
│   Developer     │
│  (Làm việc      │
│   với code)     │
└────────┬────────┘
         │
         │ git commit & push
         ▼
┌─────────────────┐
│   Git Tag       │
│  (v1.0.0)       │  ◄─── Trigger cho CI/CD
└────────┬────────┘
         │
         │ triggers
         ▼
┌─────────────────────────────────────────────┐
│         GitHub Actions Workflow             │
│  ┌─────────────────────────────────────┐   │
│  │ 1. Extract version from tag         │   │
│  │ 2. Update config.json & setup.iss   │   │
│  │ 3. Build JSX (node scripts/build.js)│   │
│  │ 4. Build Installer (Inno Setup)     │   │
│  │ 5. Create GitHub Release            │   │
│  └─────────────────────────────────────┘   │
└────────┬────────────────────────────────────┘
         │
         │ produces
         ▼
┌─────────────────────────────┐
│ GitHub Release              │
│  AutoCloneTranslationSetup  │
│      .exe                   │
└────────┬────────────────────┘
         │
         │ downloads
         ▼
┌─────────────────┐
│   End Users     │
│ CheckUpdate.ps1 │
│  tự động check  │
└─────────────────┘
```

### 1.3 Luồng Phát Hành Tự Động

**Quy trình từ code → người dùng:**

1. Developer viết code và commit
2. Developer tạo git tag (ví dụ: `v1.2.0`)
3. Push tag lên GitHub → **Kích hoạt GitHub Actions**
4. GitHub Actions tự động:
   - Cập nhật version trong `tools/config.json`
   - Cập nhật version trong `setup.iss`
   - Build JSX từ source code
   - Build installer (.exe)
   - Tạo GitHub Release với file exe
5. Người dùng chạy "Check for Updates"
6. `CheckUpdate.ps1` phát hiện version mới
7. Tự động download và cài đặt

### 1.4 Các Thành Phần Chính

| Thành Phần | File Path | Chức Năng |
|-----------|-----------|-----------|
| **GitHub Workflow** | `.github/workflows/release.yml` | Định nghĩa CI/CD pipeline |
| **Build Script** | `scripts/build.js` | Bundle JSX từ src/ → dist/ |
| **Installer Config** | `setup.iss` | Cấu hình Inno Setup |
| **Version Config** | `tools/config.json` | Version hiện tại & GitHub repo |
| **Auto-Updater** | `tools/CheckUpdate.ps1` | Kiểm tra và tải update |
| **Dev Build Tool** | `build_installer.bat` | Build local cho development |
| **Watch Mode** | `scripts/watch.js` | Auto-rebuild khi file thay đổi |

---

## 2. Thiết Lập Từ Đầu

Phần này hướng dẫn chi tiết cách thiết lập CI/CD cho project từ đầu.

### 2.1 Yêu Cầu Hệ Thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

#### **Bắt buộc:**
- **Git for Windows** (v2.30+)
  - Download: https://git-scm.com/download/win
  - Trong quá trình cài: chọn "Git from the command line and also from 3rd-party software"

- **Node.js** (v20.x trở lên)
  - Download: https://nodejs.org/
  - Kiểm tra: `node --version` (phải hiện v20.0.0 hoặc cao hơn)
  - GitHub Actions sử dụng Node 20, nên local cũng nên dùng version này

- **GitHub Account**
  - Tạo tại: https://github.com/signup
  - Có quyền tạo public repositories

#### **Khuyên dùng:**
- **Visual Studio Code** - Text editor
- **PowerShell 5.1+** - Có sẵn trên Windows 10/11

#### **Kiểm tra cài đặt:**
```powershell
# Mở PowerShell và chạy:
git --version          # Phải hiện git version 2.x.x
node --version         # Phải hiện v20.x.x trở lên
npm --version          # Phải hiện 9.x.x trở lên
```

### 2.2 Khởi Tạo Git Repository

Mở PowerShell tại thư mục `app`:

```powershell
cd app
```

#### **Bước 1: Kiểm tra Git status**
```powershell
git status
```

**Nếu thấy output bình thường** (danh sách files):
- Repository đã được khởi tạo ✓
- Chuyển sang bước 2.3

**Nếu thấy lỗi "fatal: not a git repository":**
```powershell
# Khởi tạo Git repository
git init
```

#### **Bước 2: Hiểu về .gitignore**

File `.gitignore` chỉ định files/folders **KHÔNG** commit lên GitHub. File này giúp tránh commit các file không cần thiết hoặc nhạy cảm.

**Lưu ý:** File `.env` chứa secrets **KHÔNG BAO GIỜ** được commit!

#### **Bước 3: First Commit**

Nếu đây là lần đầu commit:

```powershell
# Add tất cả files (trừ những file trong .gitignore)
git add .

# Tạo commit đầu tiên
git commit -m "chore: initial project setup"
```

**Best practice cho commit message:**
- Dùng Conventional Commits format (xem section 7.2)
- Ví dụ: `chore: initial setup`, `feat: add dark mode`, `fix: resolve login bug`

### 2.3 Tạo Repository trên GitHub

#### **Bước 1: Tạo Repository mới**
1. Vào [GitHub New Repo](https://github.com/new)
2. Điền thông tin:
   - **Repository name:** `Installer_Flex` (hoặc tên bạn muốn)
   - **Description:** "Adobe Illustrator Auto Translation Extension"
   - **Visibility:** Public (hoặc Private nếu muốn)
   - **QUAN TRỌNG:** **KHÔNG** chọn các option:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   - Lý do: Repo phải **hoàn toàn trống** để push code hiện tại lên

3. Click **"Create repository"**

#### **Bước 2: Copy Remote URL**

Sau khi tạo, GitHub sẽ hiện màn hình hướng dẫn. Copy URL repo:

**HTTPS (khuyên dùng cho người mới):**
```
https://github.com/YourUsername/Installer_Flex.git
```

**SSH (cho advanced users đã setup SSH key):**
```
git@github.com:YourUsername/Installer_Flex.git
```

### 2.4 Kết Nối Local với Remote

#### **Bước 1: Thêm Remote Origin**

```powershell
# Thay YourUsername bằng username GitHub của bạn
git remote add origin https://github.com/YourUsername/Installer_Flex.git

# Đổi tên branch chính thành main (nếu đang là master)
git branch -M main
```

#### **Bước 2: Verify Connection**

```powershell
# Kiểm tra remote đã được add
git remote -v
```

**Output mong đợi:**
```
origin  https://github.com/YourUsername/Installer_Flex.git (fetch)
origin  https://github.com/YourUsername/Installer_Flex.git (push)
```

#### **Bước 3: Push Code lên GitHub**

```powershell
# Push lần đầu
git push -u origin main
```

**Lưu ý về Authentication:**
- Nếu dùng HTTPS: Sẽ được hỏi username & password
- **Password KHÔNG phải password GitHub!** Phải dùng **Personal Access Token (PAT)**
- Tạo PAT tại: https://github.com/settings/tokens → "Generate new token (classic)"
  - Scopes cần thiết: `repo` (full control of private repositories)

### 2.5 Cập Nhật Cấu Hình Project

Để tính năng **Auto-Update** hoạt động, bạn phải cập nhật GitHub repo trong config.

#### **Bước 1: Mở file config**

File: `tools/config.json`

```json
{
    "version": "1.0.0",
    "githubRepo": "YourUsername/Installer_Flex",
    "actionSetName": "Auto Clone Translation"
}
```

#### **Bước 2: Sửa `githubRepo`**

**Thay thế:**
- `YourUsername` → Username GitHub thực của bạn
- `Installer_Flex` → Tên repository bạn vừa tạo

**Ví dụ:**
```json
{
    "version": "1.0.0",
    "githubRepo": "johndoe/AutoCloneTranslation",
    "actionSetName": "Auto Clone Translation"
}
```

**Tại sao quan trọng?**
- `CheckUpdate.ps1` sử dụng field này để call GitHub API
- Format: `owner/repo` (KHÔNG bao gồm `https://github.com/`)

#### **Bước 3: Commit thay đổi**

```powershell
# Add file đã sửa
git add tools/config.json

# Commit theo chuẩn Conventional Commits
git commit -m "chore(config): update github repo url"

# Push lên GitHub
git push origin main
```

### 2.6 Kiểm Tra Thiết Lập

**Checklist trước khi release đầu tiên:**

- [ ] Git repository đã được init
- [ ] Đã commit tất cả files cần thiết
- [ ] Remote origin đã được add và verified
- [ ] Code đã được push lên GitHub (check trên web)
- [ ] `tools/config.json` có `githubRepo` chính xác
- [ ] GitHub Actions workflow file tồn tại: `.github/workflows/release.yml`

**Verify trên GitHub:**
1. Vào `https://github.com/YourUsername/Installer_Flex`
2. Kiểm tra:
   - Code đã hiện trong repo ✓
   - Có thư mục `.github/workflows/` ✓
   - File `release.yml` tồn tại ✓

**Nếu tất cả OK:** Bạn đã sẵn sàng tạo release đầu tiên! 🎉

---

## 3. Hiểu Về GitHub Actions Workflow

GitHub Actions là hệ thống CI/CD tích hợp sẵn của GitHub. Phần này giải thích chi tiết workflow tự động.

### 3.1 Cấu Trúc File Workflow

**File:** `.github/workflows/release.yml`

```yaml
name: Release          # Tên workflow (hiện trên Actions tab)

on:                    # Trigger events
  push:
    tags:
      - 'v*'          # Chỉ chạy khi push tag bắt đầu với 'v'

jobs:                  # Các công việc cần làm
  build-and-release:   # Job ID
    runs-on: windows-latest  # Chạy trên Windows runner

    steps:             # Danh sách các bước
      - name: ...
      - name: ...
```

**Anatomy của một Workflow:**
- **name:** Tên hiển thị
- **on:** Sự kiện trigger (push, pull_request, schedule, etc.)
- **jobs:** Một hoặc nhiều jobs (có thể chạy parallel)
- **steps:** Các bước trong job (chạy tuần tự)

### 3.2 Trigger Events - Tags Pattern Matching

```yaml
on:
  push:
    tags:
      - 'v*'
```

**Ý nghĩa:**
- Workflow chỉ chạy khi có **git tag** được push
- Tag phải match pattern `v*` (bắt đầu với chữ `v`)

**Tags sẽ trigger:**
- ✅ `v1.0.0` → Trigger
- ✅ `v2.5.3` → Trigger
- ✅ `v1.0.0-beta.1` → Trigger
- ❌ `1.0.0` (không có `v`) → KHÔNG trigger
- ❌ `release-1.0` (không bắt đầu `v`) → KHÔNG trigger

**Tại sao dùng tags thay vì commits?**
- Tags đánh dấu version cụ thể (immutable)
- Commits có thể thay đổi (force push)
- Tags rõ ràng hơn cho release management

### 3.3 Chi Tiết Từng Bước

Workflow gồm 9 bước chính:

**Step 1: Checkout code** - Clone repository về runner

**Step 2: Extract version** - Lấy version từ tag (v1.2.0 → 1.2.0)

**Step 3: Setup Node.js** - Cài đặt Node.js v20

**Step 4-5: Update versions** - Cập nhật `config.json` và `setup.iss`

**Step 6: Build JSX** - Chạy `node scripts/build.js`

**Step 7: Install Inno Setup** - Cài via Chocolatey

**Step 8: Build installer** - Compile `setup.iss` → `AutoCloneTranslationSetup.exe`

**Step 9: Create release** - Upload exe lên GitHub Releases

### 3.4 Xem Logs của Workflow

#### **Bước 1: Vào Actions Tab**

1. Vào GitHub repository
2. Click tab **"Actions"** (trên menu bar)
3. Thấy danh sách workflow runs

#### **Bước 2: Chọn Workflow Run**

- Click vào run tương ứng với tag vừa push
- Ví dụ: "Release" triggered by `v1.2.0`

#### **Bước 3: Xem Chi Tiết**

- Click vào job `build-and-release`
- Thấy tất cả steps với status:
  - ✅ Màu xanh = Success
  - ❌ Màu đỏ = Failed
  - ⏸️ Màu vàng = In progress

---

## 4. Phát Triển Local

Phần này hướng dẫn cách build và test project trên máy local trước khi release.

### 4.1 Cấu Trúc Source Code

```
app/
├── src/                              # Source code (modular)
│   ├── utils/                        # Utilities
│   ├── features/                     # Features (Clean Architecture)
│   │   ├── extractor/                # Text extraction
│   │   ├── font/                     # Font management
│   │   ├── cloner/                   # Layer cloning
│   │   └── translator/               # Translation API
│   └── host_app.jsx                  # Entry point
│
├── dist/                             # Build output
│   └── AutoCloneTranslate.jsx        # Final bundled file
│
├── scripts/
│   ├── build.js                      # Build script
│   └── watch.js                      # Watch mode
│
└── build_installer.bat               # Dev build tool
```

### 4.2 Build Script Hoạt Động Thế Nào

**File:** `scripts/build.js`

**Mục đích:** Bundle nhiều file JSX thành một file duy nhất

**Quá trình:**
1. Đọc tất cả files từ `src/` theo thứ tự định sẵn
2. Concatenate thành một file
3. Remove `#include` directives
4. Ghi vào `dist/AutoCloneTranslate.jsx`

**Tại sao thứ tự quan trọng?**
- JavaScript không có `import`/`export` trong ExtendScript
- File sau phụ thuộc vào functions/classes đã define trong file trước

### 4.3 Build Thủ Công

**Command:**
```powershell
cd app
node scripts/build.js
```

**Output:**
```
Bundling: utils/json2.js
Bundling: utils/AppUtils.js
...
Build Complete: dist\AutoCloneTranslate.jsx
```

### 4.4 Build Installer Locally

**Tool:** `build_installer.bat`

```powershell
.\build_installer.bat
```

**Menu:**
```
=== BUILD INSTALLER ===
1. Dev Mode (Build + Install + Reload AI)
2. Full Build (Build JSX + Installer only)
```

**Option 2** chỉ build, không cài đặt

### 4.5 Dev Mode - Workflow Nhanh

```powershell
.\build_installer.bat dev
```

**Dev Mode tự động:**
1. Build JSX
2. Build Installer
3. Run Installer (Silent)
4. Reload Illustrator
5. Load Action

**Lưu ý:** Save file Illustrator trước khi chạy!

### 4.6 Watch Mode

```powershell
node scripts/watch.js
```

Auto-rebuild khi file trong `src/` thay đổi

### 4.7 Testing Trước Khi Release

**Checklist:**
- [ ] Code compiles không lỗi
- [ ] `node scripts/build.js` thành công
- [ ] Installer được tạo
- [ ] Script chạy trong Illustrator
- [ ] Test chức năng chính

---

## 5. Quản Lý Phiên Bản

### 5.1 Semantic Versioning (SemVer)

**Format:** `MAJOR.MINOR.PATCH`

Ví dụ: `1.2.3`

| Phần | Khi nào tăng |
|------|--------------|
| **MAJOR** | Breaking changes |
| **MINOR** | Tính năng mới |
| **PATCH** | Bug fixes |

### 5.2 Version Numbers Trong Project

Version được lưu ở 3 nơi:

1. **`tools/config.json`** - Cho CheckUpdate.ps1
2. **`setup.iss`** - Cho installer
3. **Git Tags** - Source of truth

GitHub Actions tự động sync khi release.

### 5.3 Quy Tắc Đặt Tên Tag

**LUÔN bắt đầu với `v`:**

- ✅ `v1.0.0`
- ✅ `v2.5.3`
- ❌ `1.0.0` (missing v)

### 5.4 Pre-release Versions

```
v1.3.0-beta.1
v2.0.0-alpha.1
v1.5.0-rc.1
```

---

## 6. Quy Trình Release

### 6.1 Chuẩn Bị Release

**Checklist:**
- [ ] Code đã được review
- [ ] Đã test local
- [ ] Documentation updated
- [ ] Quyết định version number

### 6.2 Tạo Tag

```powershell
# Ensure clean state
git checkout main
git pull origin main

# Create tag
git tag v1.2.0

# Or annotated tag (recommended)
git tag -a v1.2.0 -m "Release version 1.2.0: Add batch translation"
```

### 6.3 Push Tag để Kích Hoạt CI/CD

```powershell
git push origin v1.2.0

# Or push all tags
git push origin --tags
```

### 6.4 Theo Dõi Build Process

1. Vào GitHub → Actions tab
2. Xem workflow progress
3. Check logs nếu có lỗi
4. Thời gian: ~5-10 phút

### 6.5 Verify Release

**Check:**
- [ ] Release hiển thị trên Releases page
- [ ] `AutoCloneTranslationSetup.exe` có trong assets
- [ ] Download link hoạt động
- [ ] Test installer

### 6.6 Viết Release Notes

Edit release để thêm release notes chi tiết:

```markdown
## 🎉 Version 1.3.0

### ✨ New Features
- Batch translation support
- Font preview

### 🐛 Bug Fixes
- Fixed font selector crash
- Fixed memory leak

### 📦 Installation
Download and run `AutoCloneTranslationSetup.exe`
```

---

## 7. Branch Strategy & Git Workflows

### 7.1 Git Flow

**Branches:**
- `main` - Production-ready
- `feat/feature-name` - Tính năng mới
- `fix/bug-name` - Sửa lỗi
- `hotfix/critical-fix` - Sửa lỗi gấp

### 7.2 Quy Tắc Commit Messages

**Conventional Commits:**

| Type | Khi nào dùng |
|------|--------------|
| `feat` | Tính năng mới |
| `fix` | Bug fixes |
| `docs` | Documentation |
| `chore` | Maintenance |
| `refactor` | Code refactoring |

**Examples:**
```bash
feat(cloner): add batch cloning
fix(font): resolve selector crash
docs: update setup guide
chore(ci): upgrade Node to 20
```

### 7.3 Kịch Bản Làm Việc

#### **Phát triển tính năng:**

```powershell
git checkout main
git pull origin main
git checkout -b feat/dark-mode

# Work & commit
git add .
git commit -m "feat(ui): add dark mode colors"

# More commits...
git commit -m "fix(ui): adjust contrast"

# Merge back
git checkout main
git merge feat/dark-mode
git push origin main
git branch -d feat/dark-mode
```

#### **Hotfix gấp:**

```powershell
git checkout main
git checkout -b fix/login-error

git add .
git commit -m "fix(auth): fix login timeout"

git checkout main
git merge fix/login-error
git push origin main
```

---

## 8. Hệ Thống Auto-Update

### 8.1 Kiến Trúc

```
User's Computer → CheckUpdate.ps1 → GitHub API → Compare Versions → Download → Install
```

### 8.2 CheckUpdate.ps1 Hoạt Động

**Bước 1:** Đọc `config.json` để lấy version hiện tại và repo

**Bước 2:** Call GitHub API:
```
GET https://api.github.com/repos/{owner}/{repo}/releases/latest
```

**Bước 3:** So sánh versions

**Bước 4:** Nếu có update → Hiện dialog → Download → Install

### 8.3 User Experience

**Start Menu:** "Check for Updates" shortcut

**User clicks** → Dialog hiển thị → Download nếu có update

### 8.4 Testing Locally

```powershell
# Simulate old version
cd "C:\Program Files\Auto Clone Translation"

# Edit config.json
$config = Get-Content config.json | ConvertFrom-Json
$config.version = "0.9.0"
$config | ConvertTo-Json | Set-Content config.json

# Run checker
powershell -ExecutionPolicy Bypass -File CheckUpdate.ps1
```

Expected: Hiện "New version available!"

---

## 9. Advanced Git Workflows

### 9.1 Pull Request Workflow

**For teams:**

1. Create feature branch
2. Push to GitHub
3. Create PR
4. Code review
5. Merge to main

### 9.2 Merge Strategies

**Squash and merge (Recommended):**
- Clean history
- Mỗi feature = 1 commit

**Merge commit:**
- Preserve full history

**Rebase:**
- Linear history

### 9.3 Hotfix Fast-track

**Timeline:** Bug reported → Fixed → Released trong 30-60 phút

```powershell
# Create hotfix
git checkout -b hotfix/crash-fix

# Fix & test
git commit -m "fix: prevent crash"

# Merge & release
git checkout main
git merge hotfix/crash-fix
git tag v1.3.1
git push origin v1.3.1
```

---

## 10. Security & Best Practices

### 10.1 Security

- ❌ Never commit secrets (.env, API keys)
- ✅ Use `.gitignore`
- ✅ Use GitHub Secrets for workflow secrets
- ✅ Consider code signing (future)

### 10.2 Monitoring

**Status badges:**
```markdown
![Release](https://github.com/USER/REPO/actions/workflows/release.yml/badge.svg)
```

**Download stats:**
```powershell
$release = Invoke-RestMethod "https://api.github.com/repos/USER/REPO/releases/latest"
$release.assets | Select name, download_count
```

### 10.3 Rollback Strategy

**Option 1:** Quick hotfix (preferred)

**Option 2:** Deprecate bad release, notify users

**Option 3:** Revert merge commit

---

## 11. Phụ Lục

### 11.1 Command Cheat Sheet

```powershell
# Development
node scripts/build.js              # Build JSX
.\build_installer.bat dev          # Dev mode
node scripts/watch.js              # Watch mode

# Git & Release
git tag v1.0.0                     # Create tag
git push origin --tags             # Push tags
git tag -d v1.0.0                  # Delete local tag

# Testing
powershell -ExecutionPolicy Bypass -File tools\CheckUpdate.ps1
```

### 11.2 Cấu Trúc Thư Mục

```
app/
├── .github/workflows/release.yml
├── src/
├── dist/
├── scripts/build.js
├── tools/config.json
└── build_installer.bat
```

### 11.3 FAQ

**Q: Có thể skip version không?**
A: Có thể, nhưng không khuyên dùng.

**Q: Nếu workflow fail?**
A: Xem logs, sửa lỗi, delete tag, tạo lại.

**Q: Test workflow locally?**
A: Dùng `build_installer.bat` để test build process.

---

## Kết Luận

Chúc mừng! Bạn đã nắm được CI/CD đầy đủ cho Installer_Flex. 🎉

**Next Steps:**
1. Thực hành tạo release đầu tiên
2. Setup branch protection
3. Tạo CHANGELOG.md

**Need Help?**
- GitHub Issues của project
- GitHub Discussions

---

**Document Version:** 2.0.0
**Last Updated:** 2025-01-24
**Author:** Claude Code AI Assistant
