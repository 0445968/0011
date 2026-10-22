import {z} from 'zod';
export const meetingSchema=z.object({id:z.string().uuid(),request_id:z.string().uuid(),title:z.string(),starts_at:z.string(),ends_at:z.string(),timezone:z.string(),organizer:z.string().uuid().nullable(),attendees:z.array(z.string().uuid()),status:z.enum(['scheduled','cancelled']),location:z.string(),meeting_url:z.string().nullable(),revision:z.number().int().positive()});
export const meetingCommandSchema=z.discriminatedUnion('action',[
  z.object({action:z.literal('save'),id:z.string().uuid(),expectedRevision:z.number().int().nonnegative(),title:z.string().trim().min(1).max(300),startsAt:z.string().datetime({offset:true}),endsAt:z.string().datetime({offset:true}),timezone:z.string().min(1).max(100),organizer:z.string().uuid(),attendees:z.array(z.string().uuid()).max(50),location:z.string().max(1000),meetingUrl:z.union([z.literal(''),z.string().url().startsWith('https://').max(2000)])}).strict(),
  z.object({action:z.literal('cancel'),id:z.string().uuid(),expectedRevision:z.number().int().positive()}).strict(),
]);
export type ProjectMeeting=z.infer<typeof meetingSchema>;
