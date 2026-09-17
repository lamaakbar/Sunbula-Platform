import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or user ID."),
  password: z.string().min(1, "Enter your password."),
  intendedRole: z.enum(["EMPLOYEE", "SUPERVISOR", "HQ"]),
});

export const operationSchema = z.object({
  cellId: z.string().min(1),
  type: z.enum(["IRRIGATION", "FERTILIZATION", "REPLANTING", "INSPECTION", "OTHER"]),
  amount: z.string().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
  taskId: z.string().optional(),
});

export const readingSchema = z.object({
  cellId: z.string().min(1),
  metric: z.enum(["SOIL_MOISTURE", "TEMPERATURE", "HUMIDITY", "PH", "WATER_LEVEL"]),
  value: z.coerce.number(),
  notes: z.string().optional(),
});

export const addBatchSchema = z.object({
  kind: z.enum(["PLANT", "BATCH"]),
  speciesId: z.string().min(1, "Select a species."),
  quantity: z.coerce.number().int().positive("Quantity must be greater than zero."),
  source: z.string().trim().min(1, "Enter a source."),
  plantingDate: z.string().min(1, "Select a planting date."),
  cellId: z.string().min(1, "Select a cell."),
  growthStage: z.enum(["SEEDLING", "GROWING", "READY"]),
  healthStatus: z.enum(["HEALTHY", "ATTENTION", "CRITICAL"]),
  notes: z.string().optional(),
});

export const inventoryUpdateSchema = z.object({
  inventoryId: z.string().min(1),
  quantity: z.coerce.number().int().min(0),
});

export const requestSchema = z.object({
  speciesId: z.string().min(1, "Select a species."),
  quantity: z.coerce.number().int().positive(),
  requiredDate: z.string().min(1),
  reason: z.string().trim().min(1, "Explain why this is needed."),
  purpose: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  notes: z.string().optional(),
});

export const reviewRequestSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED"]),
  reviewNotes: z.string().optional(),
});

export const productionTargetSchema = z.object({
  nurseryId: z.string().min(1),
  zoneId: z.string().optional(),
  speciesId: z.string().min(1),
  targetQuantity: z.coerce.number().int().positive(),
  targetDate: z.string().min(1),
  notes: z.string().optional(),
});

export const assignTaskSchema = z.object({
  assigneeId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  zoneId: z.string().optional(),
  cellId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueAt: z.string().optional(),
});
