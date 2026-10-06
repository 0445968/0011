import { z } from 'zod';
import { getServiceBlueprint } from '@/data/serviceCatalog';

export const serviceSelectionSchema = z.object({
  serviceId: z.string().max(80).refine((id) => Boolean(getServiceBlueprint(id)), 'Choose an available service.'),
  quantity: z.number().int().min(1).max(100),
  details: z.string().trim().max(2000),
}).strict();

export const inquiryFieldsSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(120),
  email: z.string().trim().email('Enter a valid email address.').max(254).transform((value) => value.toLowerCase()),
  company: z.string().trim().max(160),
  website: z.string().trim().max(500).refine((value) => {
    if (!value) return true;
    try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
  }, 'Enter a complete website address, such as https://example.com.'),
  goals: z.string().trim().min(20, 'Tell us a little more about your project (at least 20 characters).').max(4000),
  budget: z.enum(['not-sure', 'under-2500', '2500-5000', '5000-10000', '10000-25000', '25000-plus']),
  timeline: z.enum(['flexible', 'within-1-month', '1-3-months', '3-plus-months']),
  customRequest: z.string().trim().max(2000),
  services: z.array(serviceSelectionSchema).max(8).refine(
    (services) => new Set(services.map((service) => service.serviceId)).size === services.length,
    'Each service should appear only once.',
  ),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm we can contact you about this inquiry.' }) }),
}).strict();

export const inquirySchema = inquiryFieldsSchema.extend({
  requestId: z.string().uuid(),
  companyWebsite: z.string().max(0, 'Unable to submit this request.'),
}).superRefine((value, context) => {
  if (!value.services.length && value.customRequest.length < 10) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['customRequest'], message: 'Choose a service or describe what you need (at least 10 characters).' });
  }
});

export type InquiryFields = Omit<z.input<typeof inquiryFieldsSchema>, 'consent'> & { consent: boolean };
export type ServiceSelection = z.infer<typeof serviceSelectionSchema>;

export const emptyInquiry: InquiryFields = {
  name: '', email: '', company: '', website: '', goals: '', budget: 'not-sure',
  timeline: 'flexible', customRequest: '', services: [], consent: false,
};

export const budgetLabels: Record<InquiryFields['budget'], string> = {
  'not-sure': 'Not sure yet', 'under-2500': 'Under $2,500', '2500-5000': '$2,500–$5,000',
  '5000-10000': '$5,000–$10,000', '10000-25000': '$10,000–$25,000', '25000-plus': '$25,000+',
};
export const timelineLabels: Record<InquiryFields['timeline'], string> = {
  flexible: 'Flexible', 'within-1-month': 'Within a month', '1-3-months': '1–3 months', '3-plus-months': 'More than 3 months',
};
