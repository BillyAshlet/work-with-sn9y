# Ocean1 API 接口文档

> 前端已定义好所有接口调用，后端按此文档实现即可对接。

## 环境变量

```
NEXT_PUBLIC_API_BASE_URL=https://rangecomic.asia
```

## 认证方式

所有请求携带以下 Headers：
- `x-device-id`: 浏览器生成的唯一设备 ID
- `x-user-email`: 当前登录用户邮箱（登录后）
- `Content-Type: application/json`（除文件上传外）

---

## 1. Auth 认证接口

### POST `/api/auth/login`
登录，支持设备绑定验证。

**Request:**
```json
{
  "email": "user@example.com",
  "password": "xxx",
  "device_id": "uuid-string",
  "version": "1.0.0"
}
```

**Response:**
```json
// 成功
{ "status": "success", "data": { "nickname": "Billy", "email": "...", "points": 100 } }
// 需要验证新设备
{ "status": "NEED_VERIFY" }
// 失败
{ "status": "failed", "msg": "密码错误" }
```

---

### POST `/api/auth/register`
注册新用户。

**Request:**
```json
{
  "email": "user@example.com",
  "password": "xxx",
  "nickname": "Billy",
  "invite_code": "ABC123",
  "verify_code": "123456"
}
```

**Response:**
```json
{ "status": "success", "msg": "注册成功" }
```

---

### POST `/api/auth/send_code`
发送邮箱验证码（注册/重置密码通用）。

**Request:**
```json
{ "email": "user@example.com" }
```

**Response:**
```json
{ "status": "success", "msg": "邮件已发送" }
```

---

### POST `/api/auth/login_verify`
新设备验证（登录返回 NEED_VERIFY 后调用）。

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "device_id": "uuid-string"
}
```

**Response:** 同 login 成功响应。

---

### POST `/api/auth/reset_password`
重置密码。

**Request:**
```json
{
  "email": "user@example.com",
  "password": "new_password",
  "verify_code": "123456"
}
```

**Response:**
```json
{ "status": "success", "msg": "密码重置成功" }
```

---

## 2. User 用户接口

### POST `/api/user/heartbeat`
心跳保活 + 设备冲突检测。前端每 30s 调用一次。

**Request:**
```json
{ "email": "user@example.com" }
```

**Response:**
```json
{ "status": "ok", "has_reward": false }
// 或被踢下线
{ "status": "rejected" }
```

---

### GET `/api/user/history`
获取余额和交易记录。通过 Header `x-user-email` 识别用户。

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "type": "consume",
      "amount": -10,
      "balance_after": 90,
      "description": "Sora 视频生成",
      "created_at": "2026-02-12T10:00:00Z"
    }
  ]
}
```
> 最新余额 = `data[0].balance_after`（按时间倒序）

---

## 3. Pay 支付接口

### POST `/api/pay/redeem`
卡密充值。

**Request:**
```json
{ "email": "user@example.com", "card_key": "XXXX-XXXX-XXXX" }
```

**Response:**
```json
{ "status": "success", "msg": "充值成功", "new_points": 200 }
```

---

## 4. AI Generation 生成接口

所有生成接口通过 `/api/proxy/` 前缀代理。

### POST `/api/proxy/sora`
Sora 视频生成（流式，超时 600s）。

**Request:**
```json
{
  "model": "sora-2",
  "prompt": "A cat walking on the beach",
  "aspectRatio": "16:9",
  "duration": 5,
  "size": "small",
  "url": "https://..." // 可选，图生视频
}
```

---

### POST `/api/proxy/banana`
Banana 图片生成（超时 300s）。

**Request:**
```json
{
  "model": "banana-v1",
  "prompt": "A sunset over mountains",
  "imageSize": "1024x1024",
  "aspectRatio": "1:1",
  "urls": ["https://..."] // 可选，参考图
}
```

---

### POST `/api/proxy/v1/draw/result`
轮询生成任务结果（Sora/Banana 通用）。

**Request:**
```json
{ "id": "task-id-string" }
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "completed",
    "progress": 100,
    "result_url": "https://cdn.example.com/output.mp4"
  }
}
```

---

### POST `/api/proxy/jimeng/create`
即梦视频生成。

**Request:** 灵活 payload，至少包含 `prompt`。

---

### POST `/api/proxy/jimeng/image`
即梦图片生成（支持文件上传，用 `multipart/form-data`）。

**Request:** FormData，字段包含 `prompt` 等，可选 `image` 文件字段。

---

## 5. Cat Chat 猫猫对话

### POST `/api/proxy/cat/chat`
AI 猫猫伴侣对话。

**Request:**
```json
{
  "messages": [
    { "role": "system", "content": "你是一只可爱的猫猫" },
    { "role": "user", "content": "你好呀" }
  ]
}
```

**Response:**
```json
{ "status": "success", "reply": "喵~ 你好呀主人！" }
```

---

## 文件结构

```
src/app/ocean1/services/
├── API_README.md   ← 你正在看的文档
├── types.ts        ← TypeScript 类型定义
└── api.ts          ← 前端 API 调用函数
```

前端调用示例：
```typescript
import { login, getHistory, soraCreate } from "@/app/ocean1/services/api";

// 登录
const res = await login("user@example.com", "password");

// 获取余额
const history = await getHistory();

// 生成视频
const task = await soraCreate("A cat on the beach", "sora-2", "16:9", 5);
```
