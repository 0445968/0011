import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();

export const projectTaskScheduleRowSchema = z.object({
  request_id: z.string().uuid(),
  task_id: z.string().min(1).max(100),
  start_on: date,
  revision: z.number().int().positive(),
  updated_at: z.string(),
});

export const projectTaskScheduleResponseSchema = z.object({
  rows: z.array(projectTaskScheduleRowSchema),
});

export const projectTaskScheduleCommandSchema = z.object({
  taskId: z.string().trim().min(1).max(100),
  startOn: date,
  expectedProjectRevision: z.number().int().positive(),
  expectedScheduleRevision: z.number().int().nonnegative(),
}).strict();

export type ProjectTaskScheduleRow = z.infer<typeof projectTaskScheduleRowSchema>;
