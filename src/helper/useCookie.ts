"use client";

import { useCallback } from "react";

type CookieOptions = {
  path?: string;
  expires?: Date | number; // Date or days from now
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
};

function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.path) {
    cookieStr += `; path=${options.path}`;
  } else {
    cookieStr += `; path=/`;
  }

  if (options.expires) {
    const expires =
      options.expires instanceof Date
        ? options.expires.toUTCString()
        : new Date(Date.now() + options.expires * 864e5).toUTCString();
    cookieStr += `; expires=${expires}`;
  }

  if (options.maxAge !== undefined) {
    cookieStr += `; max-age=${options.maxAge}`;
  }

  if (options.domain) {
    cookieStr += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieStr += `; Secure`;
  }

  if (options.sameSite) {
    cookieStr += `; SameSite=${options.sameSite}`;
  }

  return cookieStr;
}

export function useCookie(name: string) {
  const set = useCallback(
    (value: string, options?: CookieOptions) => {
      if (typeof document === "undefined") return;
      const cookieStr = serializeCookie(name, value, options);
      document.cookie = cookieStr;
    },
    [name]
  );

  const get = useCallback((): string | null => {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    for (const cookie of cookies) {
      const [cookieName, ...cookieVal] = cookie.split("=");
      if (decodeURIComponent(cookieName) === name) {
        return decodeURIComponent(cookieVal.join("="));
      }
    }
    return null;
  }, [name]);

  const update = useCallback(
    (value: string, options?: CookieOptions) => {
      set(value, options);
    },
    [set]
  );

  const remove = useCallback(
    (options?: CookieOptions) => {
      set("", { ...options, expires: new Date(0) });
    },
    [set]
  );

  return {
    set,
    get,
    update,
    remove,
  };
}
