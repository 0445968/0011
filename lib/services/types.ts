/** Serializable catalog contracts. Marketing components and icons live elsewhere. */
export type ServiceCategoryId =
  | 'brand-strategy'
  | 'graphic-brand-design'
  | 'web-digital'
  | 'marketing-content';

export type ServiceId =
  | 'brand-strategy'
  | 'logo-design'
  | 'visual-identity'
  | 'brand-guidelines'
  | 'website-design'
  | 'website-development'
  | 'social-media-kit'
  | 'presentation-design';

export type ProjectPhaseId =
  | 'inquiry'
  | 'proposal-onboarding'
  | 'discovery'
  | 'direction'
  | 'production'
  | 'review'
  | 'qa'
  | 'delivery'
  | 'handoff';

export interface ClientRequirement {
  id: string;
  label: string;
  responseType: 'form' | 'file' | 'access' | 'assessment';
  required: boolean;
  /** Only assessments use this field; it references the existing assessment registry. */
  assessmentSlug?: string;
}

export interface WorkflowTask {
  id: string;
  title: string;
  phase: ProjectPhaseId;
  owner: 'bivi' | 'client';
}

export interface ApprovalGate {
  id: string;
  title: string;
  phase: ProjectPhaseId;
}

export interface ServiceBlueprint {
  id: ServiceId;
  blueprintVersion: 1;
  status: 'draft';
  categoryId: ServiceCategoryId;
  name: string;
  description: string;
  marketingHref: string;
  unit: string;
  minimumQuantity: number;
  quantityNotes: string;
  configurationFields: string[];
  commercial: {
    pricingMode: 'quote_required';
    price: number | null;
    currency: string | null;
    estimatedEffortHours: number | null;
    turnaroundBusinessDays: { min: number; max: number } | null;
    supportDays: number | null;
    revisions: {
      includedRounds: number | null;
      proposedRounds: number | null;
      status: 'undecided' | 'proposed';
      notes: string;
    };
  };
  /** Rules to review, not mandatory purchases of other services. */
  prerequisites: string[];
  requirementIds: string[];
  tasks: WorkflowTask[];
  approvalGates: ApprovalGate[];
  deliverables: string[];
  exclusions: string[];
  handoff: string[];
  addOnServiceIds: ServiceId[];
}

export type SelectionResolution =
  | { kind: 'service'; inputId: string; serviceId: ServiceId }
  | { kind: 'clarification'; inputId: string; label: string; question: string; candidateServiceIds: ServiceId[] }
  | { kind: 'custom'; inputId: string; label: string; question: string }
  | { kind: 'unknown'; inputId: string };
