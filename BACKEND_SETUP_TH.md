# การติดตั้ง Backend (ภาษาไทย)

## ภาพรวม

แอพนี้ใช้ **backend เดียว** (sabaidimai-backend) รองรับทั้ง:
- Admin dashboard (`/admin`)
- React Native app (`/api/app/*`)

## ขั้นตอนการติดตั้ง

### 1. ติดตั้ง backend

```bash
cd sabaidimai-backend
npm install
```

### 2. สร้าง admin account ครั้งแรก

```bash
node setup.js
```

หรือใช้ command line:
```bash
node setup.js --username admin --password mypassword --role superadmin
```

### 3. รัน backend

```bash
npm start
# หรือ dev mode (auto-restart)
npm run dev
```

Backend จะรันที่ `http://localhost:3001`

### 4. ตั้งค่า IP ในแอพ

แก้ไฟล์ `src/config/api.ts`:

```typescript
// Android Emulator
export const API_BASE_URL = 'http://10.0.2.2:3001/api/app';

// iOS Simulator
export const API_BASE_URL = 'http://localhost:3001/api/app';

// อุปกรณ์จริง (ใส่ IP LAN ของเครื่อง)
export const API_BASE_URL = 'http://192.168.1.x:3001/api/app';
```

### 5. รัน React Native app

```bash
cd sabaidimai-rn
npm install
npx expo start
```

## เข้าถึง Admin Dashboard

เปิดเบราว์เซอร์ไปที่: `http://localhost:3001/admin`

- ใส่ Backend URL: `http://localhost:3001`
- Login ด้วย admin account ที่สร้างไว้
