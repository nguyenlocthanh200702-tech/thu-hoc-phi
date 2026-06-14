# Kế Hoạch Triển Khai: Ứng Dụng Thu Học Phí

---

## 1. Database Schema (Supabase PostgreSQL)

### Bảng `classes`

```sql
CREATE TABLE classes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,               -- 'Lớp 6', 'Lớp 7', ...
  monthly_fee INTEGER NOT NULL,           -- đơn vị: VNĐ (ví dụ: 800000)
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng `students`

```sql
CREATE TABLE students (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  class_id   UUID REFERENCES classes(id) ON DELETE SET NULL,
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng `payments`

```sql
CREATE TABLE payments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  month      SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year       SMALLINT NOT NULL,
  paid       BOOLEAN DEFAULT FALSE,
  paid_at    TIMESTAMPTZ,
  UNIQUE (student_id, month, year)
);
```

---

## 2. Supabase SQL Setup (chạy toàn bộ trong SQL Editor)

```sql
-- Bật Row Level Security
ALTER TABLE classes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Chỉ cho phép người dùng đã đăng nhập (tài khoản duy nhất)
CREATE POLICY "auth_only" ON classes  FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_only" ON students FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_only" ON payments FOR ALL USING (auth.uid() IS NOT NULL);

-- Dữ liệu mẫu
INSERT INTO classes (name, monthly_fee) VALUES
  ('Lớp 6',  800000),
  ('Lớp 7',  850000),
  ('Lớp 8',  900000),
  ('Lớp 9',  950000),
  ('Lớp 10', 1000000);
```

---

## 3. Cấu Trúc Thư Mục

```
thu-hoc-phi/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # Icon PWA (192x192, 512x512)
├── src/
│   ├── main.jsx
│   ├── App.jsx                # Router + Auth gate
│   ├── supabase.js            # Supabase client
│   │
│   ├── components/
│   │   ├── BottomNav.jsx      # Thanh điều hướng dưới
│   │   ├── ConfirmModal.jsx   # Modal xác nhận
│   │   ├── LoadingSpinner.jsx
│   │   └── EmptyState.jsx
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx      # Màn hình đăng nhập
│   │   ├── TrangChu.jsx       # Tab 1: Trang chủ
│   │   ├── LopHoc.jsx         # Tab 2: Danh sách lớp
│   │   ├── ChiTietLop.jsx     # Chi tiết một lớp
│   │   ├── HocSinh.jsx        # Tab 3: Danh sách học sinh
│   │   ├── ChiTietHocSinh.jsx # Chi tiết + đánh dấu đóng tiền
│   │   ├── BaoCao.jsx         # Tab 4: Báo cáo
│   │   └── CaiDat.jsx         # Tab 5: Cài đặt
│   │
│   └── hooks/
│       ├── usePayments.js     # Fetch + mutate payments
│       ├── useClasses.js      # Fetch + mutate classes
│       └── useStudents.js     # Fetch + mutate students
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 4. Danh Sách Packages & Thư Viện

```json
{
  "dependencies": {
    "react": "^18.3",
    "react-dom": "^18.3",
    "react-router-dom": "^6.24",
    "@supabase/supabase-js": "^2.44",
    "@tanstack/react-query": "^5.51"
  },
  "devDependencies": {
    "vite": "^5.3",
    "@vitejs/plugin-react": "^4.3",
    "vite-plugin-pwa": "^0.20",
    "tailwindcss": "^3.4",
    "autoprefixer": "^10.4",
    "postcss": "^8.4"
  }
}
```

| Package | Mục đích |
|---|---|
| `react-router-dom` | Điều hướng giữa các màn hình |
| `@supabase/supabase-js` | Kết nối database + Auth |
| `@tanstack/react-query` | Cache & sync dữ liệu từ Supabase |
| `vite-plugin-pwa` | Tự động tạo service worker, manifest |

---

## 5. Cấu Trúc Component

```
App
└── AuthGate (kiểm tra đăng nhập)
    ├── LoginPage
    └── MainLayout
        ├── BottomNav (cố định dưới cùng)
        └── Routes
            ├── /                → TrangChu
            ├── /lop-hoc         → LopHoc
            ├── /lop-hoc/:id     → ChiTietLop
            ├── /hoc-sinh        → HocSinh
            ├── /hoc-sinh/:id    → ChiTietHocSinh
            ├── /bao-cao         → BaoCao
            └── /cai-dat         → CaiDat
```

---

## 6. Chi Tiết Từng Màn Hình

### Màn hình 1: Trang chủ (`/`)

**Hiển thị:**
- Tiêu đề: "Tháng 6/2026" (tự động lấy tháng hiện tại)
- 6 thẻ thống kê: Tổng học sinh / Đã đóng / Chưa đóng / Tổng dự kiến / Đã thu / Còn thiếu
- Danh sách lớp với thanh tiến độ

**Logic:**
```js
// Tính từ dữ liệu payments tháng hiện tại
const totalStudents  = students.filter(s => s.active).length
const paidStudents   = payments.filter(p => p.month === currentMonth && p.paid).length
const unpaidStudents = totalStudents - paidStudents
const totalExpected  = classes.reduce((sum, c) => sum + c.monthly_fee * studentCount(c), 0)
const totalCollected = paidPayments.reduce((sum, p) => sum + p.student.class.monthly_fee, 0)
```

---

### Màn hình 2: Lớp học (`/lop-hoc`)

**Hiển thị:** Danh sách tất cả lớp đang hoạt động

**Mỗi thẻ lớp:**
- Tên lớp
- Số học sinh đang học
- Học phí tháng
- Tiến độ đóng tiền tháng này

**Hành động:**
- Nhấn thẻ → vào Chi tiết lớp
- Nút "+ Thêm lớp" (modal form)
- Nút chỉnh sửa / lưu trữ từng lớp

---

### Màn hình 3: Chi tiết lớp (`/lop-hoc/:id`)

**Hiển thị:**
- Header: tên lớp, tổng học sinh, học phí
- 2 thẻ: số đã đóng / chưa đóng
- Bộ lọc: Tất cả | Đã đóng | Chưa đóng
- Danh sách học sinh với chấm màu (🟢/🔴)

**Hành động:**
- Nhấn tên học sinh → vào Chi tiết học sinh

---

### Màn hình 4: Học sinh (`/hoc-sinh`)

**Hiển thị:**
- Ô tìm kiếm theo tên
- Danh sách học sinh (tên + tên lớp)

**Hành động:**
- Tìm kiếm theo tên
- Nút "+ Thêm học sinh" (modal: tên, chọn lớp)
- Nhấn học sinh → Chi tiết học sinh

---

### Màn hình 5: Chi tiết học sinh (`/hoc-sinh/:id`)

**Hiển thị:**
- Header: tên, lớp, học phí
- Lưới lịch sử thanh toán 12 tháng (✓ xanh / ✗ đỏ)

**Nút chính:**
- "Đánh dấu đã đóng tháng [X]" (chỉ hiện khi chưa đóng)
- Nhấn → modal xác nhận → lưu vào DB → cập nhật UI

**Luồng tối ưu (3 bước):**
```
Trang chủ → nhấn lớp → nhấn học sinh chưa đóng → nhấn nút → xác nhận
```

---

### Màn hình 6: Báo cáo (`/bao-cao`)

**Hiển thị:**
- 4 thẻ tổng hợp tài chính
- Danh sách học sinh chưa đóng, gom theo lớp
- Nút "Xuất CSV"

**CSV export:**
```js
const csvRows = [
  ['Tên', 'Lớp', 'Học phí', 'Tháng', 'Năm', 'Trạng thái', 'Ngày đóng'],
  ...payments.map(p => [
    p.student.name, p.student.class.name, p.student.class.monthly_fee,
    p.month, p.year, p.paid ? 'Đã đóng' : 'Chưa đóng',
    p.paid_at ? formatDate(p.paid_at) : ''
  ])
]
const blob = new Blob(['\uFEFF' + csvRows.map(r => r.join(',')).join('\n')], 
  { type: 'text/csv;charset=utf-8' })
```

---

### Màn hình 7: Cài đặt (`/cai-dat`)

- Nút "Đổi mật khẩu" → gọi `supabase.auth.updateUser()`
- Nút "Đăng xuất" → gọi `supabase.auth.signOut()`
- Section "Thông báo" (sắp ra mắt, disabled)

---

## 7. Luồng Quan Trọng Nhất

```
[Trang chủ]
    │ nhấn "Lớp 8 (3 chưa đóng)"
    ▼
[Chi tiết lớp 8] — lọc "Chưa đóng"
    │ nhấn tên "Bình"
    ▼
[Chi tiết học sinh: Bình]
    │ nhấn "Đánh dấu đã đóng tháng 6"
    ▼
[Modal xác nhận] "Xác nhận Bình đã đóng học phí tháng 6?"
    │ nhấn "Xác nhận"
    ▼
[Cập nhật thành công] ← quay lại danh sách lớp
```

**Tổng: 4 bước, 4 lần chạm.**

---

## 8. Cấu Hình PWA (`vite.config.js`)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Thu Học Phí',
        short_name: 'Học Phí',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#10B981',
        lang: 'vi',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
```

---

## 9. Supabase Client (`src/supabase.js`)

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**File `.env`:**
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 10. Custom Hook Mẫu (`src/hooks/usePayments.js`)

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'

export function useMonthlyPayments(month, year) {
  return useQuery({
    queryKey: ['payments', month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, student:students(name, class:classes(name, monthly_fee))')
        .eq('month', month)
        .eq('year', year)
      if (error) throw error
      return data
    }
  })
}

export function useMarkPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ studentId, month, year }) => {
      const { error } = await supabase
        .from('payments')
        .upsert({
          student_id: studentId,
          month,
          year,
          paid: true,
          paid_at: new Date().toISOString()
        }, { onConflict: 'student_id,month,year' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    }
  })
}
```

---

## 11. Triển Khai Netlify

**Lệnh build:**
```bash
npm run build
```

**Cấu hình Netlify (`netlify.toml`):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Biến môi trường trên Netlify:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 12. Kế Hoạch Triển Khai (Theo Giai Đoạn)

### Giai đoạn 1 — Nền tảng (1–2 ngày)
- [ ] Tạo project Vite + React + Tailwind
- [ ] Cấu hình Supabase, chạy SQL schema
- [ ] Trang đăng nhập (email/password)
- [ ] Bottom navigation bar
- [ ] Routing cơ bản

### Giai đoạn 2 — Lõi nghiệp vụ (2–3 ngày)
- [ ] Trang chủ với thống kê tháng hiện tại
- [ ] Danh sách & chi tiết lớp
- [ ] Danh sách & chi tiết học sinh
- [ ] Luồng "Đánh dấu đã đóng" + modal xác nhận

### Giai đoạn 3 — Báo cáo & Hoàn thiện (1–2 ngày)
- [ ] Trang báo cáo + xuất CSV
- [ ] Thêm/sửa/lưu trữ lớp học
- [ ] Thêm/sửa/lưu trữ học sinh
- [ ] Trang cài đặt (đổi mật khẩu, đăng xuất)

### Giai đoạn 4 — PWA & Deploy (1 ngày)
- [ ] Cấu hình vite-plugin-pwa
- [ ] Tạo icons PWA
- [ ] Deploy lên Netlify
- [ ] Kiểm thử trên điện thoại thật

---

## 13. Yêu Cầu Thiết Kế

| Yếu tố | Quy định |
|---|---|
| Màu chủ đạo | `#10B981` (xanh lá — emerald) |
| Màu đã đóng | `#10B981` / nền `#D1FAE5` |
| Màu chưa đóng | `#EF4444` / nền `#FEE2E2` |
| Kích thước nút tối thiểu | 48px chiều cao |
| Font | Hệ thống (sans-serif) |
| Layout | Mobile-first, max-width 430px |
| Ngôn ngữ | 100% Tiếng Việt |

---

## 14. Tóm Tắt

| Hạng mục | Chi tiết |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| State | TanStack Query (cache + sync) |
| PWA | vite-plugin-pwa |
| Deploy | Netlify |
| Ngôn ngữ UI | Tiếng Việt 100% |
| Tài khoản | 1 tài khoản chia sẻ duy nhất |
| Thời gian ước tính | 5–7 ngày làm việc |
