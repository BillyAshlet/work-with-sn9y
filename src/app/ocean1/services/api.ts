// ─── Ocean1 API Client ────────────────────────────────────────────
// Frontend API service layer — defines all endpoints for backend integration.
// Backend developer: implement these endpoints on the server side.
//
// Base URL is configured via env var: NEXT_PUBLIC_API_BASE_URL
// e.g. "https://rangecomic.asia" or "http://localhost:8000"

import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  SendCodeRequest,
  LoginVerifyRequest,
  ResetPasswordRequest,
  HeartbeatRequest,
  HeartbeatResponse,
  HistoryResponse,
  RedeemCardRequest,
  RedeemCardResponse,
  SoraCreateRequest,
  BananaCreateRequest,
  JimengVideoCreateRequest,
  JimengImageCreateRequest,
  QueryResultRequest,
  GenerationResult,
  CatChatRequest,
  CatChatResponse,
} from "./types";

// ─── Config ───────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://rangecomic.asia";
const AUTH_URL = `${BASE_URL}/api/auth`;
const USER_URL = `${BASE_URL}/api/user`;
const PAY_URL = `${BASE_URL}/api/pay`;
const PROXY_URL = `${BASE_URL}/api/proxy`;

// ─── Device ID (browser fingerprint) ─────────────────────────────

function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("ocean1_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ocean1_device_id", id);
  }
  return id;
}

// ─── Auth headers ─────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-device-id": getDeviceId(),
  };
  if (typeof window !== "undefined") {
    const email = localStorage.getItem("ocean1_user_email");
    if (email) headers["x-user-email"] = email;
  }
  return headers;
}

// ─── Generic fetch wrapper ────────────────────────────────────────

async function request<T>(
  method: "GET" | "POST",
  url: string,
  body?: unknown,
  timeout = 30000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const opts: RequestInit = {
      method,
      headers: getAuthHeaders(),
      signal: controller.signal,
    };
    if (body && method === "POST") {
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// ═══════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

/** POST /api/auth/login */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const payload: LoginRequest = {
    email,
    password,
    device_id: getDeviceId(),
    version: "1.0.0",
  };
  const res = await request<LoginResponse>("POST", `${AUTH_URL}/login`, payload);
  if (res.status === "success" && res.data) {
    localStorage.setItem("ocean1_user_email", email);
  }
  return res;
}

/** POST /api/auth/register */
export async function register(
  email: string,
  password: string,
  nickname: string,
  inviteCode: string,
  verifyCode: string
): Promise<ApiResponse> {
  return request<ApiResponse>("POST", `${AUTH_URL}/register`, {
    email,
    password,
    nickname,
    invite_code: inviteCode,
    verify_code: verifyCode,
  } satisfies RegisterRequest);
}

/** POST /api/auth/send_code — request email verification code */
export async function sendCode(email: string): Promise<ApiResponse> {
  return request<ApiResponse>("POST", `${AUTH_URL}/send_code`, {
    email,
  } satisfies SendCodeRequest);
}

/** POST /api/auth/login_verify — verify new device with code */
export async function loginVerify(email: string, code: string): Promise<LoginResponse> {
  const payload: LoginVerifyRequest = {
    email,
    code,
    device_id: getDeviceId(),
  };
  const res = await request<LoginResponse>("POST", `${AUTH_URL}/login_verify`, payload);
  if (res.status === "success" && res.data) {
    localStorage.setItem("ocean1_user_email", email);
  }
  return res;
}

/** POST /api/auth/reset_password */
export async function resetPassword(
  email: string,
  newPassword: string,
  verifyCode: string
): Promise<ApiResponse> {
  return request<ApiResponse>("POST", `${AUTH_URL}/reset_password`, {
    email,
    password: newPassword,
    verify_code: verifyCode,
  } satisfies ResetPasswordRequest);
}

// ═══════════════════════════════════════════════════════════════════
// USER ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

/** POST /api/user/heartbeat — keep session alive, detect device conflicts */
export async function heartbeat(email: string): Promise<HeartbeatResponse> {
  return request<HeartbeatResponse>("POST", `${USER_URL}/heartbeat`, {
    email,
  } satisfies HeartbeatRequest, 8000);
}

/** GET /api/user/history — get balance & transaction history */
export async function getHistory(): Promise<HistoryResponse> {
  return request<HistoryResponse>("GET", `${USER_URL}/history`);
}

/** Logout — clear local session */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ocean1_user_email");
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

/** POST /api/pay/redeem — redeem a card key for points */
export async function redeemCard(
  email: string,
  cardKey: string
): Promise<RedeemCardResponse> {
  return request<RedeemCardResponse>("POST", `${PAY_URL}/redeem`, {
    email,
    card_key: cardKey,
  } satisfies RedeemCardRequest);
}

// ═══════════════════════════════════════════════════════════════════
// AI GENERATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

/** POST /api/proxy/sora — create Sora video generation task */
export async function soraCreate(
  prompt: string,
  model: string,
  aspectRatio: string,
  duration: number,
  imgUrl?: string
): Promise<ApiResponse> {
  const payload: SoraCreateRequest = {
    model,
    prompt,
    aspectRatio,
    duration,
    size: "small",
  };
  if (imgUrl) payload.url = imgUrl;
  return request<ApiResponse>("POST", `${PROXY_URL}/sora`, payload, 600000);
}

/** POST /api/proxy/banana — create Banana image generation task */
export async function bananaCreate(
  prompt: string,
  model: string,
  imageSize: string,
  aspectRatio: string,
  imgUrl?: string
): Promise<ApiResponse> {
  const payload: BananaCreateRequest = {
    model,
    prompt,
    imageSize,
    aspectRatio,
  };
  if (imgUrl) payload.urls = [imgUrl];
  return request<ApiResponse>("POST", `${PROXY_URL}/banana`, payload, 300000);
}

/** POST /api/proxy/v1/draw/result — poll generation task result */
export async function queryResult(taskId: string): Promise<ApiResponse<GenerationResult>> {
  return request<ApiResponse<GenerationResult>>(
    "POST",
    `${PROXY_URL}/v1/draw/result`,
    { id: taskId } satisfies QueryResultRequest,
    30000
  );
}

/** POST /api/proxy/jimeng/create — create Jimeng video task */
export async function jimengVideoCreate(
  payload: JimengVideoCreateRequest
): Promise<ApiResponse> {
  return request<ApiResponse>("POST", `${PROXY_URL}/jimeng/create`, payload, 60000);
}

/** POST /api/proxy/jimeng/image — create Jimeng image task (with optional file upload) */
export async function jimengImageCreate(
  payload: JimengImageCreateRequest,
  imageFile?: File
): Promise<ApiResponse> {
  // If there's a file, use FormData instead of JSON
  if (imageFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, val]) => {
      if (val !== undefined && key !== "image") {
        formData.append(key, String(val));
      }
    });
    formData.append("image", imageFile);

    const headers: Record<string, string> = {
      "x-device-id": getDeviceId(),
    };
    const email = typeof window !== "undefined" ? localStorage.getItem("ocean1_user_email") : null;
    if (email) headers["x-user-email"] = email;

    const res = await fetch(`${PROXY_URL}/jimeng/image`, {
      method: "POST",
      headers,
      body: formData,
    });
    return (await res.json()) as ApiResponse;
  }

  return request<ApiResponse>("POST", `${PROXY_URL}/jimeng/image`, payload, 60000);
}

// ═══════════════════════════════════════════════════════════════════
// CAT CHAT ENDPOINT
// ═══════════════════════════════════════════════════════════════════

/** POST /api/proxy/cat/chat — AI cat companion chat */
export async function catChat(
  messages: CatChatRequest["messages"]
): Promise<CatChatResponse> {
  return request<CatChatResponse>("POST", `${PROXY_URL}/cat/chat`, {
    messages,
  } satisfies CatChatRequest, 30000);
}
