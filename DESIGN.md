---
name: School Attendance
description: A clear school-operations bulletin board for daily attendance work.
colors:
  cool-light: "#f2f5f8"
  paper-white: "#ffffff"
  ink-navy: "#16243a"
  navigation-navy: "#14233b"
  action-cobalt: "#2156d7"
  action-cobalt-soft: "#e8eefc"
  action-cobalt-ink: "#183d94"
  quiet-surface: "#edf1f5"
  quiet-ink: "#5b6879"
  rule: "#d9e0e8"
  field-rule: "#cbd5e1"
  school-yellow: "#f5c84c"
  danger: "#c93445"
typography:
  headline:
    fontFamily: "Prompt, Noto Sans Thai, Leelawadee UI, Tahoma, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Prompt, Noto Sans Thai, Leelawadee UI, Tahoma, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Prompt, Noto Sans Thai, Leelawadee UI, Tahoma, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Prompt, Noto Sans Thai, Leelawadee UI, Tahoma, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  field: "8px"
  control: "12px"
  landmark: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.action-cobalt}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.field}"
    padding: "10px 16px"
  button-outline:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.field}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.control}"
    padding: "24px"
  input:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
---

# Design System: School Attendance

## Overview

**Creative North Star: "The School Operations Bulletin Board"**

This is an operational school environment, not a generic gradient SaaS dashboard. Cool light surfaces behave like orderly posted sheets; deep navy navigation provides a permanent institutional frame; cobalt identifies the next useful action; and one school-yellow landmark makes the product recognizable without turning every screen into branding.

The system is deliberately dense but calm. Administrators and teachers must scan many records and pending states, while students must find a short, frequent action and understand its result immediately. The first viewport therefore keeps navigation, a plain-language task title, and readable working content in view. Flat color, explicit labels, icons, and compact 12–16px geometry do the work.

**Key Characteristics:**

- Cool, light working canvas with white paper-like containers.
- Deep navy persistent navigation and cobalt action hierarchy.
- School yellow reserved for the product landmark and rare attention cues.
- Compact Thai-first typography and dense, readable operational layouts.
- Status meaning expressed with words and icons as well as color.
- Mostly flat surfaces; restrained shadows clarify hierarchy, not decoration.

## Colors

The palette is a cool institutional neutral field anchored by navy, with cobalt for action and school yellow as a scarce landmark.

### Primary

- **Action Cobalt:** The default primary action, focus identity, links, and active icon color.
- **Navigation Navy:** The persistent desktop and mobile navigation plane.

### Secondary

- **Cobalt Wash:** Active-navigation icon wells and quiet selected surfaces.
- **School Yellow:** The graduation-cap landmark and exceptional counts or attention markers; it is not a general-purpose button color.

### Neutral

- **Cool Light:** The application canvas behind content.
- **Paper White:** Cards, fields, active navigation rows, and high-clarity working surfaces.
- **Ink Navy:** Primary text and headings.
- **Quiet Surface:** Muted rows, identity blocks, loading regions, and low-emphasis groupings.
- **Quiet Ink:** Descriptions, metadata, helper copy, and secondary labels.
- **Rule / Field Rule:** Dividers, card boundaries, table structure, and form outlines.

### Named Rules

**The No-Gradient Rule.** Keep core surfaces and actions flat; hierarchy comes from contrast, spacing, borders, and restrained depth.

**The Yellow Landmark Rule.** School yellow is a recognizable landmark, not a second primary action color.

**The Status Is Language Rule.** Never communicate attendance or approval state through hue alone; pair color with a label and, where space permits, an icon.

## Typography

**Display Font:** Prompt (with Noto Sans Thai, Leelawadee UI, Tahoma, sans-serif fallbacks)  
**Body Font:** Prompt (with the same Thai-capable fallbacks)

**Character:** Prompt keeps Thai and Latin text equally direct, friendly, and operational. Weight changes establish hierarchy; oversized display typography and ornamental pairings do not belong in the working application.

### Hierarchy

- **Headline:** Bold, compact page and task titles; typically around the 24px tier with balanced wrapping on small screens.
- **Title:** Semibold card, section, and table-region headings.
- **Body:** Regular 14px operational copy, values, and descriptions, with 16px used where a student-facing primary task needs more emphasis.
- **Label:** Semibold 12px metadata and control labels; the navigation group eyebrow is an existing uppercase, tracked exception rather than a pattern to spread.

### Named Rules

**The Thai-First Measure Rule.** Allow Thai labels enough width and line height to remain legible; do not force English-dashboard abbreviations to preserve a rigid row.

## Layout

Large screens use a persistent 288px left navigation rail and a content column offset to match it. The shell header keeps the current task and user context available while the main region uses compact, readable cards and tables. Student check-in narrows to a focused central working column, while administrative pages may use the wider canvas for search, filters, tables, and reports.

Spacing follows a practical 4/8/12/16/24px rhythm. Controls cluster tightly; sections receive the larger steps. At widths below the large breakpoint, navigation becomes an off-canvas drawer with a clear menu trigger and scrim. Mobile is a primary layout: actions may stack or form a two-column task pair only when labels remain readable, tables require deliberate overflow or alternate presentation, and tap targets stay comfortably usable.

**The First-Viewport Rule.** Preserve access to navigation, the current task title, and the task's meaningful content or action without ceremonial hero space.

## Elevation & Depth

The system is flat by default. White cards separate from the cool canvas through tonal contrast and quiet borders; shadows are structural accents for the fixed navigation, active navigation row, focused task card, and temporary overlays. Avoid glass effects and decorative floating layers.

### Shadow Vocabulary

- **Navigation edge:** A broad, low-opacity navy shadow separates the fixed rail from working content.
- **Active row:** A compact dark shadow lifts the white active destination against the navy rail.
- **Task emphasis:** A soft, wide shadow may identify the principal check-in card without making every card float.

### Named Rules

**The Flat-by-Default Rule.** Ordinary cards and fields rely on surface contrast and rules; reserve visible elevation for navigation, priority, and transient state.

## Shapes

The recurring language is gently squared: 8px fields and compact controls, 12px cards and navigation rows, and 16px landmark/icon containers. Circles are reserved for avatars, status icons, loaders, and small count indicators. Borders are thin and cool. Larger rounded-3xl containers and heavily softened backdrop modals are legacy compatibility patterns, not templates for new work.

## Components

### Buttons

- **Shape:** Compact gently curved control, normally 8px; student primary actions may grow to 48–56px high.
- **Primary:** Cobalt with white text and icon, clear verb-first label, and concise hover darkening.
- **Outline:** White or transparent surface with a cool border and ink text for secondary actions.
- **Ghost / icon:** Used in navigation and compact utility contexts, with a visible hover surface and the global focus-visible outline.
- **States:** Disabled actions remain readable but visibly unavailable; loading states retain the action label and add a spinner.

### Chips

- **Style:** Compact labeled status badges use a pale tonal surface, matching darker text, a fine border, and optional icon.
- **State:** Green means completed/present, amber means late or attention, red means absent/error, blue means leave/information, and violet distinguishes pending time-entry workflow. Text remains authoritative.

### Cards / Containers

- **Corner Style:** 12px for standard working cards; use 16px only for branded landmarks or deliberately prominent modules.
- **Background:** Paper white on cool light, with quiet-surface blocks nested for student identity, loading, and secondary facts.
- **Shadow Strategy:** Flat by default; priority check-in content may use the task-emphasis shadow.
- **Border:** One-pixel cool rules separate normal cards, headers, rows, and map details.
- **Internal Padding:** Usually 16–24px, reduced only for dense table or mobile treatments.

### Inputs / Fields

- **Style:** White or page-toned field, 8px corners, cool field rule, 12px horizontal inset, concise labels and helper text.
- **Focus:** Cobalt ring with a visible offset; never remove the global keyboard outline without an equivalent.
- **Error / Disabled:** Use explicit nearby copy plus state color; disabled fields preserve legibility.

### Tables

- **Style:** Dense, flat, left-aligned operational rows with quiet headers, cool dividers, and enough cell padding for scanning.
- **Behavior:** Filters and search precede the dataset; numeric/status columns stay compact; mobile behavior must be intentionally scrollable or reformatted.

### Navigation

- **Style:** Deep navy 288px rail with 56px minimum rows, paired icon wells, strong labels, and short descriptions.
- **Active:** White row, navy text, cobalt-on-wash icon, and `aria-current`; pending counts remain visible.
- **Mobile:** Off-canvas rail opened from the persistent header, closed by an explicit control or scrim.

## Do's and Don'ts

### Do:

- **Do** keep frequent actions and pending states visible in the first working viewport.
- **Do** use cobalt for the clearest next action and deep navy for persistent institutional navigation.
- **Do** pair status color with direct Thai wording and a recognizable icon where practical.
- **Do** use the 8/12/16px corner hierarchy and the 4/8/12/16/24px spacing rhythm.
- **Do** preserve keyboard focus, reduced-motion behavior, readable contrast, and mobile touch targets.

### Don't:

- **Don't** introduce generic gradients, glass panels, decorative blobs, or marketing-style hero composition.
- **Don't** use school yellow as a routine primary button or flood whole screens with it.
- **Don't** make every card float; elevation must communicate navigation, priority, or temporary state.
- **Don't** rely on red, amber, green, blue, or violet without a textual state label.
- **Don't** copy the legacy one-off uppercase eyebrow, ad hoc status pills, or rounded-3xl/backdrop modal treatment into new components; maintain them only where compatibility requires it.

---

# Design Decisions

ส่วนนี้บันทึกการตัดสินใจด้านสถาปัตยกรรมที่สำคัญของระบบ โดยอ้างอิงจาก implementation ปัจจุบันของ Frontend และ contract ที่ใช้ร่วมกับ Backend

## 1. Why this framework? — ทำไมเลือก Framework นี้

เลือก **Next.js 16, React 19 และ TypeScript** เพราะระบบมีหลายหน้าที่ใช้ layout, authentication และ UI components ร่วมกัน เช่น Dashboard, รายชื่อนักเรียน, การอนุมัติ และรายงาน Next.js App Router ช่วยจัด route และแยก protected layout ได้ชัดเจน ขณะที่ React เหมาะกับหน้าที่มี state และ interaction จำนวนมาก เช่น filter, pagination, modal และ realtime notification

TypeScript ช่วยกำหนดสัญญาข้อมูลระหว่าง UI กับ API ลดความผิดพลาดจากชื่อ field หรือสถานะที่ไม่ตรงกัน ส่วน Tailwind CSS ช่วยรักษา spacing, responsive behavior และ visual tokens ให้สม่ำเสมอในทีม

การตัดสินใจสำคัญคือให้ Frontend เป็น client ของ Backend API แยกต่างหาก ไม่ผูก business rule สำคัญไว้กับ UI การคำนวณสิทธิ์ การอนุมัติ และการบันทึกข้อมูลจริงจึงต้องถูกตรวจซ้ำที่ Backend เสมอ

## 2. Why this database design? — ทำไมออกแบบ Database แบบนี้

เลือกฐานข้อมูลเชิงสัมพันธ์ **PostgreSQL** เพราะข้อมูลนักเรียน บัญชี การเข้าเรียน และคำขออนุมัติมีความสัมพันธ์และข้อบังคับที่ชัดเจน การใช้ Foreign Key, Unique Constraint และ Check Constraint ช่วยรักษาความถูกต้องของข้อมูลได้ในระดับฐานข้อมูล ไม่ต้องพึ่ง application code เพียงอย่างเดียว

โครงสร้างหลักแยกความรับผิดชอบดังนี้

- `students` เก็บตัวตนและข้อมูลประจำตัวของนักเรียน
- `student_accounts` เก็บข้อมูล authentication แยกจากข้อมูลนักเรียน
- `attendances` เก็บผลการเข้าเรียนรายวันและทำหน้าที่เป็นประวัติถาวร
- `time_entry_requests` เก็บ workflow คำขอลงเวลาและผลการพิจารณาแยกจาก attendance ที่อนุมัติแล้ว

กำหนด Unique Key ที่ `(student_id, attendance_date)` เพื่อป้องกันการบันทึกสถานะซ้ำในวันเดียวกัน และใช้สถานะที่กำหนดแน่นอน เช่น `Present`, `Late`, `Leave`, `Absent` เพื่อให้รายงานและ validation เชื่อถือได้ เวลาเช็กอินและเช็กเอาต์ควรเก็บเป็น UTC แล้วแปลงเป็น `Asia/Bangkok` ตอนแสดงผล ส่วนรอบวันเรียนเริ่ม 03:00 น. ต้องเป็น business rule กลางที่ Backend ใช้ร่วมกันทุก endpoint

## 3. What alternatives did you consider? — มีทางเลือกอื่นหรือไม่

ทางเลือกที่พิจารณามีดังนี้

- **Single-page React ด้วย Vite:** ตั้งค่าและ deploy ง่ายกว่า แต่ต้องสร้าง routing, protected layout และแนวทาง rendering เพิ่มเอง Next.js เหมาะกว่าเมื่อระบบมีหลาย route และต้องการ convention กลาง
- **Server Actions หรือ API routes ภายใน Next.js:** ลดจำนวนโปรเจกต์ที่ต้องดูแล แต่ระบบนี้มี Backend และฐานข้อมูลแยกอยู่แล้ว การคง API boundary ทำให้แยก deployment, authorization และ scaling ได้ชัดเจนกว่า
- **NoSQL เช่น MongoDB:** ยืดหยุ่นเมื่อ schema เปลี่ยนบ่อย แต่ข้อมูล attendance ต้องการ uniqueness, relation และ transaction ที่แน่นอน PostgreSQL จึงตรงกับลักษณะงานมากกว่า
- **Polling สำหรับแจ้งเตือน:** ทำได้ง่าย แต่สร้าง request ซ้ำแม้ไม่มีข้อมูลเปลี่ยนแปลง จึงเลือก SignalR สำหรับคำขอลาและคำขอลงเวลา และยังคงการโหลดครั้งแรกผ่าน REST API
- **สร้าง PDF ที่ Backend:** ให้รูปแบบรายงานคงที่และเหมาะกับข้อมูลจำนวนมากกว่า แต่เพิ่มภาระ Backend ปัจจุบันจึงสร้าง PDF ฝั่ง browser เพื่อให้ดาวน์โหลดได้ทันที โดยแบ่งหน้าตามขอบแถวตาราง

## 4. With more time, what would you improve? — ถ้ามีเวลาเพิ่ม จะปรับปรุงอะไรต่อ

ลำดับการปรับปรุงที่สำคัญคือ

1. เพิ่ม automated tests ครบทั้ง unit, component และ end-to-end สำหรับ login, check-in, leave approval, time-entry approval และ report export
2. สร้าง OpenAPI specification เป็นแหล่งข้อมูลกลาง แล้ว generate TypeScript API client เพื่อลด type ที่เขียนซ้ำในแต่ละหน้า
3. ย้ายการสร้าง PDF ขนาดใหญ่ไป Backend หรือ report worker พร้อม template ที่แบ่งหน้าและทำซ้ำ table header ได้สมบูรณ์
4. เพิ่ม database migration ที่มี version แทนการใช้ SQL fix แบบไฟล์เดี่ยว พร้อม backup และ rollback procedure
5. ทำ accessibility audit, responsive test และทดสอบกับข้อมูลภาษาไทยยาว ๆ บนอุปกรณ์จริง
6. เพิ่ม observability เช่น structured logs, error tracking, API latency, SignalR connection status และ audit log ของผู้อนุมัติ
7. ทำ flow วันที่และเวลาลาให้ครบทั้ง UI, request DTO, validation, database migration, approval screen และ report โดยไม่เก็บข้อมูลสำคัญรวมไว้ในข้อความ `remark`

## 5. For 1,000,000 users, what would you change? — ถ้าระบบต้องรองรับผู้ใช้ 1 ล้านคน จะเปลี่ยนอะไร

ระบบต้องเปลี่ยนจาก deployment แบบ instance เดียวเป็นสถาปัตยกรรมที่ scale ได้หลายระดับ

- วาง Frontend static assets หลัง CDN และ deploy Next.js แบบหลาย instance โดยไม่เก็บ session state ใน process
- ใช้ API Gateway, rate limiting และ autoscaling สำหรับ Backend พร้อมแยก read-heavy endpoints เช่น Dashboard และ Report
- ใช้ Redis สำหรับ distributed cache, short-lived dashboard aggregates, pending counts และ coordination ของ SignalR
- ใช้ managed SignalR/backplane เพื่อกระจาย realtime events ข้ามหลาย Backend instances โดยไม่เปิด connection ทั้งหมดไว้ที่เครื่องเดียว
- เพิ่ม connection pooling เช่น PgBouncer, read replicas และ partition ตาราง `attendances` ตามช่วงเวลาเมื่อข้อมูลโตมาก
- สร้าง composite indexes จาก query จริง เช่น `(attendance_date, status)`, `(student_id, attendance_date)` และ index สำหรับ pending approval queues
- เปลี่ยน report และ CSV/PDF ขนาดใหญ่เป็น asynchronous jobs ผ่าน message queue แล้วให้ผู้ใช้ดาวน์โหลดจาก object storage เมื่อสร้างเสร็จ
- ใช้ idempotency key และ transaction สำหรับ check-in/approval เพื่อป้องกันข้อมูลซ้ำจาก retry หรือ request พร้อมกัน
- แยก audit/event stream สำหรับเหตุการณ์สำคัญ และกำหนด data retention/archival policy เพื่อลดขนาดฐานข้อมูลหลัก
- เพิ่ม multi-region disaster recovery, automated backup restore test, monitoring, tracing, SLO และ load testing ก่อนเพิ่ม traffic จริง

สิ่งที่ยังคงเดิมแม้ระบบขยายคือ Backend ต้องเป็นผู้บังคับใช้ authorization และ business rules, ฐานข้อมูลต้องรักษา constraint สำคัญ และ UI ต้องแสดงสถานะด้วยข้อความ ไม่พึ่งสีเพียงอย่างเดียว