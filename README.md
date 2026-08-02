# School Attendance Web

เว็บแอปพลิเคชันสำหรับระบบเช็กชื่อและติดตามการเข้าเรียนของนักเรียน พัฒนาด้วย Next.js, React, TypeScript และ Tailwind CSS โดยทำงานร่วมกับ School Attendance API

## ความสามารถหลัก

- เข้าสู่ระบบและสมัครบัญชีนักเรียน
- นักเรียนเช็กอินและยื่นคำขอลา
- แสดงภาพรวมข้อมูลการเข้าเรียน
- จัดการข้อมูลนักเรียนและบัญชีนักเรียน
- บันทึกและตรวจสอบประวัติการเข้าเรียน
- อนุมัติหรือปฏิเสธคำขอลา
- แยกสิทธิ์การใช้งานตามบทบาท Admin, Teacher และ Student

## เทคโนโลยีที่ใช้

- Next.js 16 และ React 19
- TypeScript
- Tailwind CSS 4
- Radix UI และ Lucide React

## สิ่งที่ต้องติดตั้ง

- Node.js 20.9 ขึ้นไป
- npm
- School Attendance API ที่เปิดใช้งานอยู่

## การติดตั้งและเปิดใช้งาน

1. เข้าไปยังโฟลเดอร์โปรเจกต์

   ```powershell
   cd C:\Git\Attendance_School_UI
   ```

2. ติดตั้ง dependencies

   ```powershell
   npm install
   ```

3. สร้างไฟล์ `.env.local` เมื่อต้องการกำหนด URL ของ API เอง

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5134/api
   ```

   หากไม่กำหนด ระบบจะเรียก API ผ่าน hostname เดียวกับหน้าเว็บที่พอร์ต `5134`

4. เปิด development server

   ```powershell
   npm run dev
   ```

5. เปิด [http://localhost:3000](http://localhost:3000)

ควรเปิด Backend ก่อน Frontend เพื่อให้หน้าเว็บเรียกข้อมูลได้ตามปกติ

## คำสั่งที่ใช้บ่อย

| คำสั่ง | รายละเอียด |
| --- | --- |
| `npm run dev` | เปิด development server |
| `npm run build` | สร้าง production build |
| `npm run start` | เปิด production server หลัง build |
| `npm run lint` | ตรวจสอบโค้ดด้วย ESLint |

## หน้าหลักของระบบ

| URL | การใช้งาน |
| --- | --- |
| `/login` | เข้าสู่ระบบ |
| `/register` | สมัครบัญชีนักเรียน |
| `/check-in` | เช็กอินและส่งคำขอลาสำหรับนักเรียน |
| `/dashboard` | ภาพรวมข้อมูลการเข้าเรียน |
| `/students` | จัดการข้อมูลนักเรียน |
| `/student-accounts` | จัดการบัญชีนักเรียน |
| `/attendance` | บันทึกการเข้าเรียน |
| `/attendance-logs` | ตรวจสอบประวัติการเข้าเรียน |
| `/leave-requests` | จัดการคำขอลา |

## โครงสร้างโปรเจกต์

```text
app/          หน้าและ layout ของ Next.js App Router
components/   components และ UI components ที่ใช้ร่วมกัน
lib/          API client, types และ utility functions
proxy.ts      ตรวจสอบ session และสิทธิ์ก่อนเข้าหน้าเว็บ
database/     เครื่องมือและสคริปต์ช่วยแก้ไข schema
```

## การยืนยันตัวตน

หลังเข้าสู่ระบบ access token และข้อมูลผู้ใช้จะถูกเก็บใน browser storage และ cookie จากนั้น API client จะส่ง token ด้วย header `Authorization: Bearer <token>` โดยอัตโนมัติ หาก API ตอบกลับ `401` ระบบจะล้าง session และนำผู้ใช้กลับไปหน้าเข้าสู่ระบบ

## การใช้งาน Production

```powershell
npm run build
npm run start
```

กำหนด `NEXT_PUBLIC_API_URL` ให้เป็น URL ของ Backend ใน environment ที่ deploy และตรวจสอบว่า Backend อนุญาต origin ของ Frontend ผ่าน CORS แล้ว

สิ่งที่ตัดสินใจเองในการออกแบบ
- เพิ่มฟังชั่นในการแสดงพื้นที่เช็คอิน
- เพิ่มการโหลด Report CSV,PDF 
- เพิ่มการลงเวลาออกโดยอ้างอิงจากอพลงเวลาออกงาน
- เลือกใช้กราฟแท่งเพื่อดูข้อมูลรายเดือน
- เพิ่มการขอลงเวลา เมื่อนักเรียนไม่สามรถเช็คอินได้ หรือกดเช็คอินไม่ติด อินเตอร์เน็ตมีปัญหา 
