# Installer Flex - Workflow Documentation

Tài liệu quy trình phát triển và phát hành phần mềm.

---

## 1. System Architecture

```
Client (PowerShell)          GitHub (CI/CD)
├── CheckUpdate.ps1    ←──   Releases (download)
├── LoadAction.ps1           ↑
└── ReloadAI.ps1             │
                             │
Developer: git tag v1.0.1 → GitHub Actions → Build → Release
```

---

## 2. Development Workflow

### Bước 1: Tạo Feature Branch
```bash
git checkout -b feat/tinh-nang-moi
```

### Bước 2: Dev & Test Loop
```powershell
.\build_installer.bat dev
```
*Build Script → Cài đặt → Restart Illustrator*

### Bước 3: Commit
```bash
git add .
git commit -m "Feat: Mô tả tính năng"
```

---

## 3. Release Workflow

### Bước 1: Merge về Main
```bash
git checkout main
git merge feat/tinh-nang-moi
```

### Bước 2: Tạo Tag & Push
```bash
git tag v1.0.1
git push origin main --tags
```

**Done!** GitHub Actions sẽ tự động:
1. Đọc version từ tag (`v1.0.1` → `1.0.1`)
2. Inject version vào `config.json` và `setup.iss`
3. Build installer
4. Upload lên GitHub Releases

---

## 4. User Update Experience

1. User chạy **"Check for Updates"** từ Start Menu
2. `CheckUpdate.ps1` kiểm tra GitHub Releases
3. Nếu có version mới → Hiển thị thông báo → User bấm Yes → Tự động tải và cài đặt

---

## Cheat Sheet

| Hành động | Lệnh |
|-----------|------|
| **Test code nhanh** | `.\build_installer.bat dev` |
| **Release bản mới** | `git tag v<version>` → `git push origin main --tags` |
