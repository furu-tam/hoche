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

1. Push lên nhánh `main`
2. Vào **Settings → Pages → Source: GitHub Actions**
3. URL: `https://furu-tam.github.io/hoche/`

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Zustand
