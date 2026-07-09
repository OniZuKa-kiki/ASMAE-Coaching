import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(5000),
  turnstileToken: z.string().optional(),
});

export const bookingCheckoutSchema = z.object({
  serviceSlug: z.string().trim().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  provider: z.enum(["payzone", "stripe"]).optional(),
});

export const courseCheckoutSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  provider: z.enum(["payzone", "stripe"]).optional(),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  service: z.string().trim().min(1).max(80),
});
