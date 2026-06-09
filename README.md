# Học Hè (hoche)

App ôn luyện Toán hằng ngày cho học sinh tiểu học (lớp 1–5).

## Tính năng

- **10 câu trắc nghiệm/ngày** — tự generate theo lớp học
- **Module theo lớp** — cộng, trừ, nhân, chia, phân số, hình học, lời văn...
- **Adaptive difficulty** — tự điều chỉnh độ khó theo kết quả
- **Lộ trình cá nhân hóa** — ưu tiên chủ đề yếu nhất
- **Dashboard & phụ huynh** — theo dõi tiến độ (PIN mặc định: 1234)

## Chạy local

```bash
npm install
npm run dev
```

http://localhost:3000

## Routes

| Route | Màn hình |
|-------|----------|
| `/` | Trang chủ + đề ôn hôm nay |
| `/play` | Làm 10 câu trắc nghiệm |
| `/modules` | Chủ đề theo lớp |
| `/profiles` | Quản lý hồ sơ học sinh |
| `/dashboard` | Tiến độ theo chủ đề |
| `/parent` | Báo cáo phụ huynh |
| `/reward` | Hoàn thành đề |

## Deploy GitHub Pages

1. Vào **Settings → Pages → Build and deployment**
2. **Source** phải là **GitHub Actions** (không chọn "Deploy from a branch" / thư mục `/docs`)
3. Push lên nhánh `main` — workflow `.github/workflows/deploy-pages.yml` sẽ build và deploy
4. URL: `https://furu-tam.github.io/hoche/`

> Nếu thấy lỗi Jekyll `No such file or directory ... /docs`, nghĩa là Pages đang trỏ vào thư mục `/docs` thay vì GitHub Actions. Đổi lại Source như bước 2.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Zustand
