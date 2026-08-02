# AI Usage

## ใช้ AI Tool อะไรบ้าง?

โปรเจกต์นี้ใช้ **OpenAI Codex** เป็น AI coding assistant สำหรับช่วยตรวจสอบ แก้ไข และทดสอบโค้ดภายใน repository

ระหว่างการปรับปรุงส่วนติดต่อผู้ใช้ มีการใช้แนวทางจาก skill **Impeccable** ภายใน Codex เพื่อช่วยตรวจความสม่ำเสมอของ UI, UX และ design system ของโปรเจกต์

## ใช้ AI ช่วยเรื่องใด?

AI ถูกใช้ช่วยงานต่อไปนี้

- สำรวจโครงสร้างโปรเจกต์และค้นหาจุดที่เกี่ยวข้องกับแต่ละความต้องการ
- แก้ไขพฤติกรรมการโหลดและรีเฟรชข้อมูลในหน้า Dashboard และรายชื่อนักเรียน
- ปรับการดาวน์โหลดรายงาน PDF ให้ดาวน์โหลดเข้าเครื่องโดยตรง
- แก้ปัญหาการแสดงสี `lab()` ขณะสร้าง PDF
- ปรับการแบ่งหน้า PDF เพื่อหลีกเลี่ยงการตัดกลางแถวตาราง
- ซ่อนเมนูและปุ่มที่ไม่ต้องการ เช่น หน้าบันทึกการเข้าเรียนและปุ่มลบนักเรียนทั้งหมด
- เพิ่ม SignalR realtime alert และ badge สำหรับคำขอลาและคำขอลงเวลา
- ตรวจสอบ TypeScript ด้วย `npx tsc --noEmit`
- ตรวจสอบความพร้อมใช้งานด้วย ESLint, TypeScript, production build และ HTTP status ของทุก route
- ตรวจสอบ Frontend ด้าน accessibility, performance, responsive design, theming และความสอดคล้องกับ design system ด้วย Impeccable audit
- วิเคราะห์ API endpoints และโครงสร้างฐานข้อมูลจาก source code และเอกสารที่มีอยู่
- วิเคราะห์ปัญหาการเชื่อมต่อระหว่าง Frontend, Backend และ PostgreSQL จาก process, port, Swagger, connection string และ log
- แก้ PostgreSQL authentication error `28P01` ในเครื่องมือ SchemaFix โดยปรับ username ให้ตรงกับ Backend และรองรับ connection string ผ่าน environment variable
- ทดสอบ SchemaFix กับฐานข้อมูลจริงจนแสดงผล `Attendance schema updated successfully.` และยืนยันว่า Backend ตอบกลับ HTTP `200`
- จัดทำและปรับปรุงเอกสาร `README.md`, `DESIGN.md`, `AI_USAGE.md` และ `BACKEND_ATTENDANCE_REQUIREMENTS.md`

AI ไม่ได้ถูกใช้ตัดสินผลการเข้าเรียนหรือผลการอนุมัติคำขอ ข้อมูลและการตัดสินใจจริงยังมาจากผู้ใช้และ Backend ของระบบ

## ลำดับการใช้ AI ตั้งแต่เริ่มต้นโปรเจกต์จนถึงปัจจุบัน

### 1. เริ่มต้นโครงสร้างระบบ

- ช่วยวางโครงสร้าง Frontend ด้วย Next.js App Router, React, TypeScript และ Tailwind CSS
- แยกโฟลเดอร์ `app`, `components`, `lib` และ `database` ตามความรับผิดชอบ
- สร้าง API client, shared types, utility functions และ proxy สำหรับตรวจ session/สิทธิ์
- กำหนด route เริ่มต้น ได้แก่ login, register, check-in, dashboard, students, student accounts, attendance และ attendance logs

### 2. Authentication และการแบ่งสิทธิ์

- ช่วยพัฒนาหน้าเข้าสู่ระบบและสมัครบัญชีนักเรียน
- เชื่อม access token กับ API ผ่าน `Authorization: Bearer <token>`
- จัดการ session ใน browser storage/cookie และ redirect เมื่อได้รับ `401`
- แยกการเข้าถึงตามบทบาท Admin, Teacher และ Student

### 3. ฟังก์ชันการเข้าเรียนและจัดการนักเรียน

- พัฒนาการเช็กอิน แสดงตำแหน่ง/พื้นที่เช็กอิน และการลงเวลาออก
- สร้าง Dashboard สรุปสถานะการเข้าเรียนและข้อมูลรายเดือน
- พัฒนาหน้าจัดการนักเรียน บัญชีนักเรียน การบันทึก attendance และประวัติ attendance
- ปรับ loading, refresh, filter, pagination, status badge และ error state ของแต่ละหน้า

### 4. Workflow คำขอ

- เพิ่มการส่งและพิจารณาคำขอลา
- เพิ่มคำขอลงเวลาสำหรับกรณีเช็กอินไม่สำเร็จหรือมีปัญหาการเชื่อมต่อ
- เพิ่มหน้ารายการคำขอลงเวลา การอนุมัติ/ปฏิเสธ และ pending count
- วิเคราะห์ข้อจำกัดระหว่าง UI, API, DTO และ Database ก่อนเพิ่ม field วันที่หรือเวลา

### 5. Realtime notification

- เพิ่ม SignalR client สำหรับรับเหตุการณ์คำขอลาและคำขอลงเวลา
- เพิ่ม badge แสดงจำนวนงานค้างในเมนู
- ปรับการ reconnect และ refresh ข้อมูลเมื่อได้รับ realtime event

### 6. รายงาน CSV และ PDF

- เพิ่มการดาวน์โหลดรายงาน CSV/PDF ลงเครื่อง
- แก้ปัญหา `html2canvas` ไม่รองรับค่าสี `lab()` โดยเปลี่ยนเป็น `html2canvas-pro`
- ปรับการแบ่งหน้า PDF ตามขอบ `<tr>` เพื่อไม่ตัดกลางแถวตาราง
- ตรวจรูปแบบรายงานหลายหน้าและความถูกต้องของข้อความภาษาไทย

### 7. UI/UX และ Design System

- ใช้ Impeccable ช่วยกำหนด PRODUCT.md และ DESIGN.md
- ปรับ navigation, dashboard, form, table, responsive layout, focus state และ touch target
- กำหนดสี typography spacing และแนวทางแสดงสถานะที่ไม่พึ่งสีเพียงอย่างเดียว
- ตรวจ implementation drift เช่นสีหรือขนาดตัวอักษรที่อยู่นอก design tokens

### 8. เอกสารและการเตรียมส่งงาน

- จัดทำ `README.md` สำหรับติดตั้ง รันระบบ โครงสร้าง route และ Production
- จัดทำ `DESIGN.md` อธิบาย framework, database design, alternatives, future improvements และการรองรับผู้ใช้ 1 ล้านคน
- จัดทำ `BACKEND_ATTENDANCE_REQUIREMENTS.md` เพื่อระบุ contract และสิ่งที่ Backend ต้องรองรับ
- จัดทำและอัปเดต `AI_USAGE.md` ให้บันทึกเครื่องมือ งาน Prompt ข้อผิดพลาด และวิธีตรวจสอบ

### 9. การตรวจสอบระบบและแก้ฐานข้อมูลล่าสุด

- รัน TypeScript check และ production build ซึ่งผ่านสำเร็จ
- ตรวจ HTTP routes พบว่า public pages ตอบ `200` และ protected pages redirect `307` ไป login ตามที่ออกแบบ
- ตรวจพบว่า ESLint 9 ยังขาด `eslint.config.js/mjs` จึงแยกเป็นปัญหา tooling ไม่ใช่ปัญหา runtime
- ตรวจ process, port, Backend Swagger และ PostgreSQL เพื่อวิเคราะห์ปัญหาการเชื่อมต่อ
- ยืนยัน error `28P01` ว่า SchemaFix ใช้ username ผิดจาก `school_attendance_db` เป็น `postgres`
- แก้ SchemaFix ให้รองรับ `ConnectionStrings__DefaultConnection` และทดสอบอัปเดต schema สำเร็จ
## Prompt หรือแนวคิดที่มีประโยชน์ที่สุดคืออะไร?

แนวคิดที่มีประโยชน์ที่สุดคือการระบุผลลัพธ์ที่ต้องการอย่างตรงไปตรงมา พร้อมบอกตำแหน่งของหน้าที่ต้องแก้ เช่น

> "เมื่อกดดาวน์โหลด PDF ให้ดาวน์โหลดเข้าเครื่องทันทีเหมือนไฟล์ CSV และห้ามตัดข้อมูลกลางแถวตาราง"

Prompt ลักษณะนี้มีประโยชน์เพราะระบุครบทั้ง

1. จุดที่ต้องแก้ — ปุ่มดาวน์โหลด PDF
2. พฤติกรรมที่ต้องการ — ดาวน์โหลดเข้าเครื่องทันที
3. ตัวอย่างอ้างอิง — ทำงานเหมือน CSV
4. เงื่อนไขคุณภาพ — ห้ามตัดกลางแถวตาราง

อีกแนวคิดที่ใช้ได้ดีคือการแบ่งงานเป็นชั้น ได้แก่ UI, API, Database และ Realtime แล้วตรวจสอบว่าแต่ละชั้นมี source code อยู่ใน repository หรือไม่ก่อนแก้ไข ซึ่งช่วยป้องกันการเพิ่ม UI ที่ Backend ยังไม่รองรับจริง

## มีส่วนใดที่ AI แนะนำผิด แล้วคุณตัดสินใจแก้อย่างไร?

มี โดยพบประเด็นสำคัญดังนี้

### 1. เลือก `html2canvas` รุ่นเดิมสำหรับสร้าง PDF

คำแนะนำแรกใช้ `html2canvas` แต่ library ดังกล่าวไม่รองรับค่าสี `lab()` ที่เกิดจาก Tailwind CSS รุ่นใหม่ ทำให้การสร้าง PDF ล้มเหลวด้วยข้อความ

```text
Attempting to parse an unsupported color function "lab"
```

แนวทางแก้ไขคือเปลี่ยนไปใช้ `html2canvas-pro` ซึ่งรองรับรูปแบบสีสมัยใหม่ แล้วตรวจสอบ TypeScript อีกครั้ง

### 2. แบ่งหน้า PDF ด้วยความสูงคงที่

วิธีแรกเลื่อนภาพขนาดใหญ่ตามความสูงกระดาษ A4 ทำให้ข้อมูลถูกตัดกลางแถวเมื่อเปลี่ยนหน้า วิธีนี้ไม่เหมาะกับรายงานตาราง

แนวทางแก้ไขคือคำนวณตำแหน่งขอบล่างของแต่ละ `<tr>` แล้วเลือกจุดแบ่งหน้าที่ขอบแถวก่อนหน้าเสมอ แม้หน้าก่อนจะมีพื้นที่ว่าง เพื่อให้แถวถัดไปย้ายไปหน้าใหม่ทั้งแถว

### 3. Encoding ภาษาไทยในหน้ารายชื่อนักเรียนผิดพลาด

ระหว่างแก้ไฟล์ด้วย PowerShell มีการอ่าน UTF-8 ด้วย encoding ที่ไม่ถูกต้อง ทำให้ข้อความภาษาไทยกลายเป็นตัวอักษรเพี้ยน

แนวทางแก้ไขคือหยุดแก้ส่วนอื่นก่อน ทดลองแปลง Windows-1252 mojibake กลับเป็น UTF-8 และตรวจคำภาษาไทยสำคัญก่อนเขียนไฟล์จริง จากนั้นรัน TypeScript check เพื่อยืนยันว่าไฟล์ยังใช้งานได้

### 4. ความสามารถเลือกวันที่และเวลาลาต้องแก้มากกว่า Frontend

การเพิ่ม input ในหน้าเว็บเพียงอย่างเดียวไม่ทำให้ระบบรองรับวันที่และเวลาลาจริง เพราะ API ปัจจุบันรับเฉพาะ `leaveType` และ `reason`

แนวทางที่ถูกต้องคือต้องปรับ request DTO, validation, service/controller, entity, database migration, response DTO และหน้าจออนุมัติร่วมกัน หาก Backend source code ไม่อยู่ใน repository จะไม่ควรอ้างว่าแก้ API และ Database สำเร็จแล้วจากการแก้ Frontend เพียงอย่างเดียว

### 5. วินิจฉัยปัญหาฐานข้อมูลจาก log เพียงอย่างเดียว

log เก่ามีทั้งข้อความเชื่อม PostgreSQL ไม่สำเร็จและข้อผิดพลาดพอร์ต Backend ซ้ำ หากสรุปจาก log อย่างเดียวอาจเข้าใจผิดว่า PostgreSQL หยุดทำงาน

แนวทางแก้ไขคือทดสอบสถานะปัจจุบันแยกเป็นชั้น ได้แก่ ตรวจพอร์ต `5432`, `5134` และ `5135`, ตรวจ process ที่ครอบครองพอร์ต, เปิด Swagger ของ Backend และรัน SchemaFix จริง ผลตรวจพบว่า PostgreSQL และ Backend ทำงานอยู่ แต่ SchemaFix ใช้ `Username=school_attendance_db` ซึ่งไม่ตรงกับ Backend ที่ใช้ `Username=postgres` จึงเกิด error `28P01` หลังแก้ credential และเพิ่ม environment override แล้ว การเชื่อมต่อและอัปเดต schema สำเร็จ

## วิธีตรวจสอบผลลัพธ์จาก AI

ทุกการเปลี่ยนแปลงควรผ่านการตรวจสอบอย่างน้อยดังนี้

- ตรวจ `git diff` ก่อนยอมรับการแก้ไข
- รัน `npx tsc --noEmit`
- รัน `npm run build` เพื่อยืนยันว่า production build สำเร็จ
- รัน `npm run lint` และแก้ configuration ของเครื่องมือตรวจสอบหากคำสั่งยังทำงานไม่ได้
- ตรวจ HTTP status ของ public routes และ protected routes รวมถึง redirect ไปหน้า login
- ทดสอบ flow จริงใน browser โดยเฉพาะ login, API error, realtime alert และ PDF หลายหน้า
- ตรวจข้อความภาษาไทยและ responsive layout
- ตรวจ process, port, Swagger และทดสอบ database command จริงเมื่อวิเคราะห์ปัญหาการเชื่อมต่อ
- ทดสอบ API และ migration ใน environment สำรองก่อน Production
- ให้ผู้พัฒนาตรวจสอบ security, authorization และผลกระทบต่อข้อมูลอีกครั้ง
