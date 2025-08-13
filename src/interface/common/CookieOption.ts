export type CookieOptions = {
  path?: string;
  expires?: Date | number; // Date or days from now
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  priority?: "low" | "medium" | "high";
  partitioned?: boolean;
};
