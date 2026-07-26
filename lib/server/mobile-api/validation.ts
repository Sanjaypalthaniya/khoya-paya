import { z } from "zod";

export const deviceSchema = z.object({
  deviceId: z.string().trim().min(8).max(200),
  platform: z.enum(["android", "ios"]),
  deviceName: z.string().trim().min(1).max(120).optional(),
  appVersion: z.string().trim().min(1).max(40).optional(),
});

export const mobileLoginSchema = z.object({
  identifier: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
  device: deviceSchema,
});

export const mobileRefreshSchema = z.object({
  refreshToken: z.string().min(40).max(500),
  deviceId: z.string().trim().min(8).max(200),
});
