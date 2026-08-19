# Auth Flows — Verify Email & Forgot Password

Base URL: `/api/v1/auth`

All endpoints are **public** (no authentication required).

---

## 1. Verify Email (Activate Account)

ใช้เมื่อ Admin สร้าง user ใหม่ → user ได้รับ email → ตั้ง password + verify email

### Flow

```
Admin POST /users { email, name? }
  │
  ▼
System สร้าง user (password = null) + ส่ง verification email อัตโนมัติ
  │  token: random 64-char hex
  │  หมดอายุ: 24 ชั่วโมง
  │
  ▼
User ได้รับ email → คลิกลิงก์ → Frontend ดึง token จาก URL
  │
  ▼
Frontend  GET /auth/verify-token?token=xxx&type=EMAIL_VERIFICATION
  │  ├─ 200 { valid: true, email, expiresAt }  → แสดงฟอร์มตั้ง password
  │  └─ 400 "Token has expired" / "already been used" / "Invalid token"
  │          → แสดง error + ปุ่ม "ส่งอีกครั้ง"
  │
  ▼
User กรอก password ใหม่
  │
  ▼
Frontend  POST /auth/verify-email { token, password }
  │  ├─ 200 { message: "Email verified successfully" }
  │  │      → emailVerifiedAt = now
  │  │      → password = hashed
  │  │      → token.usedAt = now (ใช้ซ้ำไม่ได้)
  │  └─ 400 → token หมดอายุ/ใช้แล้ว/ไม่ถูกต้อง
  │
  ▼
User login ด้วย email + password ที่ตั้งไว้
```

### Resend Verification Email

กรณี token หมดอายุ หรือไม่ได้รับ email:

```
POST /auth/send-verification
Body: { "email": "user@example.com" }

Response: 200 { "message": "If an account with that email exists, a verification link has been sent" }
```

- Token เก่าถูก invalidate ทันที (mark `usedAt`)
- สร้าง token ใหม่ + ส่ง email
- Return success เสมอ (ป้องกัน email enumeration)
- Rate limit: 3 req/min

---

## 2. Forgot Password

ใช้เมื่อ user ลืม password → ขอ reset → ตั้ง password ใหม่

### Flow

```
User คลิก "ลืมรหัสผ่าน" ใน Frontend
  │
  ▼
Frontend  POST /auth/request-password-reset { email }
  │  └─ 200 { message: "If an account with that email exists, ..." }
  │         → Token สร้างใหม่ (หมดอายุ 15 นาที)
  │         → Token เก่าถูก invalidate
  │         → Return success เสมอ (ป้องกัน email enumeration)
  │
  ▼
User ได้รับ email → คลิกลิงก์ → Frontend ดึง token จาก URL
  │
  ▼
Frontend  GET /auth/verify-token?token=xxx&type=PASSWORD_RESET
  │  ├─ 200 { valid: true, email, expiresAt }  → แสดงฟอร์มตั้ง password ใหม่
  │  └─ 400 "Token has expired" / "already been used" / "Invalid token"
  │          → แสดง error + ปุ่ม "ส่งอีกครั้ง"
  │
  ▼
User กรอก password ใหม่
  │
  ▼
Frontend  POST /auth/reset-password { token, password }
  │  ├─ 200 { message: "Password has been reset successfully" }
  │  │      → password = hashed
  │  │      → token.usedAt = now (ใช้ซ้ำไม่ได้)
  │  │      → refresh tokens ทั้งหมดถูก revoke (บังคับ login ใหม่ทุก device)
  │  └─ 400 → token หมดอายุ/ใช้แล้ว/ไม่ถูกต้อง
  │
  ▼
User login ด้วย password ใหม่
```

---

## API Reference

### `POST /auth/send-verification`

ส่ง/ส่งซ้ำ email verification link

| Field | Type   | Required | Description    |
| ----- | ------ | -------- | -------------- |
| email | string | ✅       | Email ของ user |

**Rate limit:** 3 req/min

---

### `GET /auth/verify-token`

เช็คว่า token ยังใช้ได้ไหม (ใช้ได้ทั้ง EMAIL_VERIFICATION และ PASSWORD_RESET)

| Query Param | Type   | Required | Values                                   |
| ----------- | ------ | -------- | ---------------------------------------- |
| token       | string | ✅       | Token จาก email                          |
| type        | string | ✅       | `EMAIL_VERIFICATION` \| `PASSWORD_RESET` |

**Success (200):**

```json
{
  "valid": true,
  "email": "user@example.com",
  "expiresAt": "2026-03-13T00:00:00.000Z"
}
```

**Error (400):**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Token has expired"
  }
}
```

**Rate limit:** 10 req/min

---

### `POST /auth/verify-email`

Verify email + ตั้ง password (ใช้หลัง admin สร้าง user)

| Field    | Type   | Required | Validation      |
| -------- | ------ | -------- | --------------- |
| token    | string | ✅       | Token จาก email |
| password | string | ✅       | 8–128 ตัวอักษร  |

**Rate limit:** 5 req/min

---

### `POST /auth/request-password-reset`

ส่ง email สำหรับ reset password

| Field | Type   | Required | Description    |
| ----- | ------ | -------- | -------------- |
| email | string | ✅       | Email ของ user |

**Rate limit:** 3 req/min

---

### `POST /auth/reset-password`

ตั้ง password ใหม่ (forgot password flow)

| Field    | Type   | Required | Validation      |
| -------- | ------ | -------- | --------------- |
| token    | string | ✅       | Token จาก email |
| password | string | ✅       | 8–128 ตัวอักษร  |

**Rate limit:** 5 req/min

---

## Token Rules

| Rule                     | Detail                                                         |
| ------------------------ | -------------------------------------------------------------- |
| ใช้ได้ครั้งเดียว         | หลังใช้สำเร็จ → `usedAt = now` → ใช้ซ้ำไม่ได้                  |
| Resend = invalidate เก่า | Token เก่าถูก mark `usedAt` ทันที มีแค่อันล่าสุดที่ใช้ได้      |
| หมดอายุ                  | EMAIL_VERIFICATION: 24 ชั่วโมง / PASSWORD_RESET: 15 นาที       |
| ป้องกัน enumeration      | send-verification + request-password-reset return success เสมอ |
| Rate limited             | ทุก endpoint มี throttle ป้องกัน brute-force                   |

## Security Notes

- Token เป็น `crypto.randomBytes(32).toString('hex')` — 256-bit random
- Password hash ด้วย bcrypt cost factor 12
- Reset password จะ revoke refresh tokens ทั้งหมดของ user (force re-login ทุก device)
- ทุก endpoint เป็น public แต่มี rate limit
