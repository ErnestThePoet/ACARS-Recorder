export const StatusCode = {
  SUCCESS: 0,
  WARNING: 100,
  ERROR: 500,
} as const;

export type StatusCodeType = (typeof StatusCode)[keyof typeof StatusCode];
