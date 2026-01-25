# Hướng Dẫn Git Workflow & Commit Convention

Tài liệu này hướng dẫn cách quản lý branch và viết commit message chuẩn cho dự án.

---

## Mục Lục

1. [Branch Strategy](#1-branch-strategy)
2. [Commit Convention](#2-commit-convention)
3. [Quy Trình Làm Việc Hàng Ngày](#3-quy-trình-làm-việc-hàng-ngày)
4. [Quy Trình Release](#4-quy-trình-release)
5. [Xử Lý Tình Huống Đặc Biệt](#5-xử-lý-tình-huống-đặc-biệt)
6. [Lệnh Git Thường Dùng](#6-lệnh-git-thường-dùng)

---

## 1. Branch Strategy

### 1.1 Mô Hình Đơn Giản (Solo Developer)

Vì dự án này chỉ có 1 developer, sử dụng mô hình đơn giản:

```
main ─────●─────●─────●─────●───── (production-ready code)
          │     │     │     │
        v1.0.0 v1.0.1 v1.1.0 v1.2.0  (release tags)
```

**Quy tắc:**
- `main` là branch duy nhất và luôn ở trạng thái stable
- Mỗi commit trên `main` đều có thể release
- Sử dụng tags để đánh dấu các phiên bản release

### 1.2 Khi Nào Cần Feature Branch (Tùy chọn)

Nếu muốn làm tính năng lớn mà không ảnh hưởng `main`:

```
main ─────●─────────────────●─────
           \               /
feature/xyz ●─────●─────●─┘
```

```bash
# Tạo feature branch
git checkout -b feature/ten-tinh-nang

# Làm việc trên feature branch
git add .
git commit -m "feat: thêm tính năng xyz"

# Khi hoàn tất, merge về main
git checkout main
git merge feature/ten-tinh-nang

# Xóa feature branch (không cần nữa)
git branch -d feature/ten-tinh-nang
```

### 1.3 Quy Tắc Đặt Tên Branch

| Loại | Format | Ví dụ |
|------|--------|-------|
| Tính năng mới | `feature/ten-tinh-nang` | `feature/dark-mode` |
| Sửa bug | `fix/mo-ta-bug` | `fix/font-crash` |
| Cải thiện | `improve/mo-ta` | `improve/performance` |
| Thử nghiệm | `experiment/mo-ta` | `experiment/new-api` |

---

## 2. Commit Convention

### 2.1 Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Ví dụ đơn giản:**
```
feat: thêm nút dark mode
```

**Ví dụ đầy đủ:**
```
feat(ui): thêm nút dark mode vào Settings

- Thêm toggle switch trong panel Settings
- Lưu preference vào localStorage
- Áp dụng theme ngay lập tức

Closes #123
```

### 2.2 Các Loại Commit (Type)

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| `feat` | Tính năng mới | `feat: thêm export PDF` |
| `fix` | Sửa bug | `fix: lỗi crash khi chọn font` |
| `docs` | Thay đổi documentation | `docs: cập nhật hướng dẫn cài đặt` |
| `style` | Format code (không đổi logic) | `style: format lại indentation` |
| `refactor` | Refactor code (không thêm feature/fix bug) | `refactor: tách function xử lý text` |
| `perf` | Cải thiện performance | `perf: tối ưu vòng lặp clone` |
| `test` | Thêm/sửa test | `test: thêm unit test cho FontService` |
| `chore` | Công việc maintenance | `chore: cập nhật dependencies` |
| `build` | Thay đổi build system | `build: cập nhật setup.iss` |
| `ci` | Thay đổi CI/CD | `ci: thêm step kiểm tra lint` |

### 2.3 Quy Tắc Viết Subject

**DO (Nên làm):**
- Viết ngắn gọn (dưới 50 ký tự)
- Bắt đầu bằng động từ: thêm, sửa, xóa, cập nhật
- Viết tiếng Việt hoặc tiếng Anh nhất quán
- Mô tả **what** (làm gì), không phải **how** (làm như thế nào)

**DON'T (Không nên):**
- ❌ `fix bug` (quá chung chung)
- ❌ `update code` (không rõ ràng)
- ❌ `WIP` (work in progress - không commit code dở)
- ❌ `asdfgh` (vô nghĩa)

### 2.4 Ví Dụ Commit Messages Tốt

```bash
# Tính năng mới
git commit -m "feat: thêm chức năng dịch tự động"
git commit -m "feat(font): hỗ trợ font tiếng Nhật"
git commit -m "feat(ui): thêm progress bar khi dịch"

# Sửa bug
git commit -m "fix: lỗi không load được action"
git commit -m "fix(installer): sửa đường dẫn Illustrator sai"
git commit -m "fix: crash khi chọn text rỗng"

# Documentation
git commit -m "docs: thêm hướng dẫn CI/CD"
git commit -m "docs: cập nhật README với screenshots"

# Build/CI
git commit -m "build: đổi tên installer thành AutoCloneTranslationSetup"
git commit -m "ci: thêm auto-update version trong workflow"

# Chore
git commit -m "chore: cập nhật .gitignore"
git commit -m "chore: xóa file không dùng"
```

### 2.5 Khi Nào Cần Body

Thêm body khi:
- Commit phức tạp cần giải thích
- Có nhiều thay đổi liên quan
- Cần ghi chú cho tương lai

```bash
git commit -m "feat: thêm hệ thống cache cho API" -m "
- Cache response trong 5 phút
- Tự động invalidate khi có lỗi
- Giảm số lượng API calls đáng kể

Lý do: API có rate limit 100 requests/phút
"
```

---

## 3. Quy Trình Làm Việc Hàng Ngày

### 3.1 Workflow Cơ Bản

```bash
# 1. Bắt đầu ngày làm việc - pull code mới nhất
git pull origin main

# 2. Làm việc và commit thường xuyên
git add src/features/translator/
git commit -m "feat: thêm hỗ trợ ngôn ngữ Hàn Quốc"

git add src/utils/
git commit -m "refactor: tách hàm xử lý text"

# 3. Cuối ngày - push code lên remote
git push origin main
```

### 3.2 Nguyên Tắc Commit

1. **Commit thường xuyên** - Mỗi thay đổi logic hoàn chỉnh = 1 commit
2. **Commit atomic** - Mỗi commit chỉ làm 1 việc
3. **Không commit code dở** - Code phải chạy được
4. **Review trước khi commit** - Dùng `git diff` để kiểm tra

### 3.3 Trước Khi Commit

```bash
# Xem những gì đã thay đổi
git status
git diff

# Chỉ add những file cần thiết (không add tất cả)
git add src/specific-file.js

# KHÔNG làm:
git add .  # Nguy hiểm - có thể add file không mong muốn
git add -A # Tương tự
```

---

## 4. Quy Trình Release

### 4.1 Checklist Trước Release

- [ ] Code đã test kỹ
- [ ] Build local thành công
- [ ] Không có `console.log` debug còn sót
- [ ] Documentation đã cập nhật (nếu cần)

### 4.2 Các Bước Release

```bash
# 1. Đảm bảo main branch sạch
git status  # Không có uncommitted changes

# 2. Pull code mới nhất
git pull origin main

# 3. Test build local
npm run build
.\build_installer.bat  # Chọn option 2

# 4. Tạo tag với version mới
git tag v1.0.1

# 5. Push code và tag
git push origin main --tags
```

### 4.3 Quy Tắc Version (Semantic Versioning)

Format: `vMAJOR.MINOR.PATCH`

| Thay đổi | Tăng | Ví dụ |
|----------|------|-------|
| Fix bug, patch nhỏ | PATCH | v1.0.0 → v1.0.1 |
| Thêm tính năng mới (backward compatible) | MINOR | v1.0.1 → v1.1.0 |
| Breaking changes (không tương thích ngược) | MAJOR | v1.1.0 → v2.0.0 |

**Ví dụ cụ thể:**

```bash
# Fix bug nhỏ
git tag v1.0.1  # Patch release

# Thêm tính năng mới
git tag v1.1.0  # Minor release

# Thay đổi lớn, cần user cài lại
git tag v2.0.0  # Major release
```

### 4.4 Viết Release Notes

Khi tạo release trên GitHub, viết notes theo format:

```markdown
## What's New
- Thêm hỗ trợ ngôn ngữ Hàn Quốc
- Cải thiện tốc độ dịch 30%

## Bug Fixes
- Sửa lỗi crash khi chọn font đặc biệt
- Sửa lỗi không nhận Illustrator 2026

## Installation
Download và chạy `AutoCloneTranslationSetup.exe`
```

---

## 5. Xử Lý Tình Huống Đặc Biệt

### 5.1 Sửa Commit Message Vừa Tạo

```bash
# Sửa message của commit cuối cùng (chưa push)
git commit --amend -m "feat: message mới đúng hơn"
```

### 5.2 Quên Add File Vào Commit

```bash
# Thêm file vào commit cuối (chưa push)
git add forgotten-file.js
git commit --amend --no-edit
```

### 5.3 Hủy Commit Cuối (Chưa Push)

```bash
# Giữ lại changes, chỉ hủy commit
git reset --soft HEAD~1

# Hủy hoàn toàn commit và changes
git reset --hard HEAD~1  # CẢNH BÁO: Mất code!
```

### 5.4 Tạo Tag Nhầm Version

```bash
# Xóa tag local
git tag -d v1.0.1

# Nếu đã push, xóa trên remote
git push origin --delete v1.0.1

# Tạo lại tag đúng
git tag v1.0.2
git push origin v1.0.2
```

### 5.5 Revert Một Commit Đã Push

```bash
# Tạo commit mới đảo ngược thay đổi (an toàn)
git revert <commit-hash>
git push origin main
```

### 5.6 Xem Lịch Sử Commit

```bash
# Xem log đẹp
git log --oneline -10

# Xem log với graph
git log --oneline --graph

# Xem chi tiết 1 commit
git show <commit-hash>
```

---

## 6. Lệnh Git Thường Dùng

### 6.1 Lệnh Hàng Ngày

```bash
# Status và diff
git status                  # Xem trạng thái
git diff                    # Xem thay đổi chưa stage
git diff --staged           # Xem thay đổi đã stage

# Add và commit
git add <file>              # Stage file cụ thể
git add -p                  # Stage từng phần (interactive)
git commit -m "message"     # Commit với message
git commit -am "message"    # Add all tracked + commit

# Push và pull
git pull origin main        # Lấy code mới
git push origin main        # Đẩy code lên
git push origin main --tags # Đẩy code + tags
```

### 6.2 Lệnh Branch

```bash
# Xem branches
git branch                  # Local branches
git branch -a               # Tất cả branches

# Tạo và switch
git checkout -b feature/xyz # Tạo + switch
git checkout main           # Switch về main

# Merge
git merge feature/xyz       # Merge branch vào current

# Xóa branch
git branch -d feature/xyz   # Xóa branch đã merge
git branch -D feature/xyz   # Force xóa
```

### 6.3 Lệnh Tag

```bash
# Xem tags
git tag                     # List tất cả tags
git describe --tags         # Tag gần nhất

# Tạo tag
git tag v1.0.0              # Tạo lightweight tag
git tag -a v1.0.0 -m "msg"  # Tạo annotated tag

# Push tags
git push origin v1.0.0      # Push 1 tag
git push origin --tags      # Push tất cả tags

# Xóa tag
git tag -d v1.0.0           # Xóa local
git push origin --delete v1.0.0  # Xóa remote
```

### 6.4 Lệnh Khác

```bash
# Stash (tạm cất code)
git stash                   # Cất changes
git stash pop               # Lấy lại changes
git stash list              # Xem danh sách stash

# Clean
git clean -fd               # Xóa untracked files

# Reset
git reset --soft HEAD~1     # Undo commit, giữ changes
git reset --hard HEAD~1     # Undo commit + changes

# Log
git log --oneline -20       # 20 commits gần nhất
git log --author="name"     # Filter by author
git log --since="2024-01-01"# Filter by date
```

---

## Tham Khảo

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Documentation](https://git-scm.com/doc)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                    COMMIT TYPES                         │
├─────────────────────────────────────────────────────────┤
│ feat:     Tính năng mới                                 │
│ fix:      Sửa bug                                       │
│ docs:     Documentation                                 │
│ style:    Format code                                   │
│ refactor: Refactor                                      │
│ perf:     Performance                                   │
│ test:     Testing                                       │
│ chore:    Maintenance                                   │
│ build:    Build system                                  │
│ ci:       CI/CD                                         │
├─────────────────────────────────────────────────────────┤
│                    VERSION BUMP                         │
├─────────────────────────────────────────────────────────┤
│ Bug fix        → PATCH  (1.0.0 → 1.0.1)                │
│ New feature    → MINOR  (1.0.1 → 1.1.0)                │
│ Breaking change→ MAJOR  (1.1.0 → 2.0.0)                │
├─────────────────────────────────────────────────────────┤
│                   DAILY WORKFLOW                        │
├─────────────────────────────────────────────────────────┤
│ git pull origin main                                    │
│ git add <files>                                         │
│ git commit -m "type: message"                           │
│ git push origin main                                    │
├─────────────────────────────────────────────────────────┤
│                   RELEASE WORKFLOW                      │
├─────────────────────────────────────────────────────────┤
│ git tag v1.x.x                                          │
│ git push origin main --tags                             │
└─────────────────────────────────────────────────────────┘
```
