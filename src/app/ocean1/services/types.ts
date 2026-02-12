// ─── Ocean1 API Types ─────────────────────────────────────────────
// All request/response types for backend integration
// Backend base URL: configured via environment variable NEXT_PUBLIC_API_BASE_URL

// ─── Common ───────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  status: "success" | "failed";
  msg?: string;
  data?: T;
}

// ─── Auth ─────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  device_id: string;
  version: string;
}

export interface LoginResponse {
  status: "success" | "failed" | "NEED_VERIFY";
  msg?: string;
  data?: UserData;
}

export interface UserData {
  nickname: string;
  email: string;
  points: number;
  avatar_path?: string;
  download_path?: string;
  // extend as needed
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  invite_code: string;
  verify_code: string;
}

export interface SendCodeRequest {
  email: string;
}

export interface LoginVerifyRequest {
  email: string;
  code: string;
  device_id: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  verify_code: string;
}

// ─── User ─────────────────────────────────────────────────────────

export interface HeartbeatRequest {
  email: string;
}

export interface HeartbeatResponse {
  status: "ok" | "rejected";
  has_reward?: boolean;
}

export interface HistoryRecord {
  id: number;
  type: string;        // e.g. "consume", "recharge"
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;  // ISO timestamp
}

export interface HistoryResponse {
  status: "success" | "failed";
  data?: HistoryRecord[];
}

// ─── Pay ──────────────────────────────────────────────────────────

export interface RedeemCardRequest {
  email: string;
  card_key: string;
}

export interface RedeemCardResponse {
  status: "success" | "failed";
  msg?: string;
  new_points?: number;
}

// ─── AI Generation ────────────────────────────────────────────────

export interface SoraCreateRequest {
  model: string;
  prompt: string;
  aspectRatio: string;
  duration: number;
  size?: string;
  url?: string; // optional image URL for img2video
}

export interface BananaCreateRequest {
  model: string;
  prompt: string;
  imageSize: string;
  aspectRatio: string;
  urls?: string[]; // optional reference images
}

export interface JimengVideoCreateRequest {
  prompt: string;
  model?: string;
  [key: string]: unknown; // flexible payload
}

export interface JimengImageCreateRequest {
  prompt: string;
  model?: string;
  image?: File; // optional uploaded image
  [key: string]: unknown;
}

export interface QueryResultRequest {
  id: string; // task_id
}

export interface GenerationResult {
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;    // 0-100
  result_url?: string;  // final output URL
  msg?: string;
}

// ─── Cat Chat ─────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CatChatRequest {
  messages: ChatMessage[];
}

export interface CatChatResponse {
  status: "success" | "failed";
  reply?: string;
  msg?: string;
}
