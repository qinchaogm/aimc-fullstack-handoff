const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const OPS_URL = trimTrailingSlash(import.meta.env.VITE_OPS_URL || "http://localhost:47322");
