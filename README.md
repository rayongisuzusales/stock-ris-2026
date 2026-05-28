# ระบบตัดสต๊อครถยนต์ — ระยองอีซูซุเซลส์

> Web App สำหรับจัดการสต๊อกรถยนต์อีซูซุ เชื่อมต่อกับ Google Sheet "Stock RIS 2026" โดยตรง

## ฟีเจอร์หลัก

| หน้า | รายละเอียด |
|------|-----------|
| **ภาพรวม** | KPI, กราฟยอดรายเดือน, ตารางแยกสาขา |
| **สต๊อกปัจจุบัน** | รถ MY26 ว่างอยู่ พร้อมค้นหาและกรอง |
| **รายงานรายเดือน** | ยอด P-UP + Mu-X ม.ค.–ปัจจุบัน |
| **ประวัติการขาย** | ค้นหาด้วยเลขเอกสาร/เลขเครื่อง/ชื่อ SC |
| **ตั้งค่า** | เชื่อมต่อ Google Sheets API |

---

## วิธี Deploy บน GitHub Pages

### ขั้นตอนที่ 1 — เตรียม Google Sheets API

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. สร้างโปรเจกต์ใหม่ (หรือใช้โปรเจกต์เดิม)
3. ค้นหา **Google Sheets API** แล้วกด **Enable**
4. ไปที่ **APIs & Services > Credentials > Create Credentials > API Key**
5. คัดลอก API Key ที่ได้
6. (แนะนำ) จำกัดการใช้งาน API Key ให้ใช้ได้เฉพาะ Google Sheets API และ referrer ของ GitHub Pages

### ขั้นตอนที่ 2 — หา Sheet ID

จาก URL ของ Google Sheet:
```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
```
คัดลอก `[SHEET_ID]` ส่วนนั้น

### ขั้นตอนที่ 3 — Push ขึ้น GitHub

```bash
# สร้าง repo ใหม่บน GitHub.com ก่อน แล้วรัน:
git init
git add .
git commit -m "Initial commit — Stock RIS 2026"
git branch -M main
git remote add origin https://github.com/[your-username]/[repo-name].git
git push -u origin main
```

### ขั้นตอนที่ 4 — ตั้งค่า Secrets

ไปที่ **GitHub repo > Settings > Secrets and variables > Actions > New repository secret**

| Secret Name | ค่า |
|-------------|-----|
| `VITE_SHEET_ID` | Sheet ID จากขั้นตอนที่ 2 |
| `VITE_API_KEY` | API Key จากขั้นตอนที่ 1 |

### ขั้นตอนที่ 5 — เปิด GitHub Pages

ไปที่ **repo Settings > Pages > Build and deployment**
- Source: **GitHub Actions**

### ขั้นตอนที่ 6 — Deploy

Push commit ใหม่ หรือไปที่ **Actions > Deploy to GitHub Pages > Run workflow**

เว็บจะ Deploy ที่:
```
https://[your-username].github.io/[repo-name]/
```

---

## พัฒนาในเครื่องก่อน Deploy

```bash
# สร้างไฟล์ .env.local
echo "VITE_SHEET_ID=your_sheet_id_here" > .env.local
echo "VITE_API_KEY=your_api_key_here"  >> .env.local

# ติดตั้ง dependencies
npm install

# รัน dev server
npm run dev
```

เปิด http://localhost:5173

---

## โครงสร้างโปรเจกต์

```
stock-ris/
├── .github/workflows/deploy.yml   # Auto-deploy to GitHub Pages
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx            # Navigation
│   │   ├── PageHeader.jsx         # Header + Sync button
│   │   ├── KpiCard.jsx            # KPI metric card
│   │   └── StatusBadge.jsx        # Status pill
│   ├── pages/
│   │   ├── Dashboard.jsx          # หน้าภาพรวม
│   │   ├── CurrentStock.jsx       # หน้าสต๊อกปัจจุบัน
│   │   ├── Monthly.jsx            # หน้ารายงานรายเดือน
│   │   ├── History.jsx            # หน้าประวัติการขาย
│   │   └── Settings.jsx           # หน้าตั้งค่า
│   ├── utils/
│   │   └── sheetsApi.js           # Google Sheets API + Mock data
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

---

## เทคโนโลยีที่ใช้

- **React 18** + **Vite** — framework หลัก
- **Recharts** — กราฟและชาร์ต
- **Lucide React** — ไอคอน
- **Google Sheets API v4** — อ่านข้อมูลจาก Sheet โดยตรง
- **GitHub Actions** — CI/CD auto deploy
- **GitHub Pages** — hosting ฟรี

---

## หมายเหตุ

- หากยังไม่ได้ใส่ API Key ระบบจะแสดง **Mock Data** จากข้อมูลจริงที่ดึงมาจาก Sheet เพื่อให้เห็นภาพก่อน
- Sheet ต้องตั้งค่าให้ **"Anyone with the link can view"** หรือ share กับ Service Account ถ้าต้องการความปลอดภัยสูงขึ้น
- สำหรับการแก้ไขข้อมูลในอนาคต แนะนำเพิ่ม Google Apps Script ทำ backend เพิ่มเติม
