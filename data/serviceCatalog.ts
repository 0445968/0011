import type { ClientRequirement, ServiceBlueprint, ServiceCategoryId } from '@/lib/services/types';

/** Draft operating data, not published offers. Snapshot accepted terms per project. */
export const serviceCategories: { id: ServiceCategoryId; name: string }[] = [
  {
    "id": "brand-strategy",
    "name": "Brand Strategy"
  },
  {
    "id": "graphic-brand-design",
    "name": "Graphic and Brand Design"
  },
  {
    "id": "web-digital",
    "name": "Web and Digital"
  },
  {
    "id": "marketing-content",
    "name": "Marketing and Content"
  }
];

export const clientRequirements: ClientRequirement[] = [
  {
    "id": "business-profile",
    "label": "Business overview, audience, goals, and existing links",
    "responseType": "form",
    "required": true
  },
  {
    "id": "project-contacts",
    "label": "Primary contact and authorized approver",
    "responseType": "form",
    "required": true
  },
  {
    "id": "existing-assets",
    "label": "Existing brand assets or confirmation that none exist",
    "responseType": "form",
    "required": true
  },
  {
    "id": "strategy-context",
    "label": "Products, competitors, positioning, research, and stakeholder priorities",
    "responseType": "form",
    "required": true
  },
  {
    "id": "logo-context",
    "label": "Approved name, competitors, visual references, intended uses, and constraints",
    "responseType": "form",
    "required": true
  },
  {
    "id": "identity-context",
    "label": "Channels, references, typography licensing, and readability requirements",
    "responseType": "form",
    "required": true
  },
  {
    "id": "guidelines-context",
    "label": "Guide audience, approved specifications, and required chapters",
    "responseType": "form",
    "required": true
  },
  {
    "id": "website-context",
    "label": "Audience, page inventory, functionality, platform, and technical constraints",
    "responseType": "form",
    "required": true
  },
  {
    "id": "website-content",
    "label": "Website copy and media inventory with a named content owner",
    "responseType": "form",
    "required": true
  },
  {
    "id": "development-scope",
    "label": "Approved implementation scope, platform, pages, integrations, and functionality",
    "responseType": "form",
    "required": true
  },
  {
    "id": "social-context",
    "label": "Template count, platforms, dimensions, editing tool, and sample social copy",
    "responseType": "form",
    "required": true
  },
  {
    "id": "presentation-content",
    "label": "Approved outline, slide count, copy, charts, audience, and chosen software",
    "responseType": "form",
    "required": true
  },
  {
    "id": "approved-logo",
    "label": "Approved logo files",
    "responseType": "file",
    "required": true
  },
  {
    "id": "approved-identity",
    "label": "Approved identity assets and specifications",
    "responseType": "file",
    "required": true
  },
  {
    "id": "approved-web-design",
    "label": "Approved website designs and implementation specifications",
    "responseType": "file",
    "required": true
  },
  {
    "id": "development-access",
    "label": "Required hosting and integration invitations; do not enter passwords",
    "responseType": "access",
    "required": true
  },
  {
    "id": "assessment-brand-health",
    "label": "Brand Health",
    "responseType": "assessment",
    "required": false,
    "assessmentSlug": "brand-health"
  },
  {
    "id": "assessment-brand-positioning",
    "label": "Brand Positioning",
    "responseType": "assessment",
    "required": false,
    "assessmentSlug": "brand-positioning"
  },
  {
    "id": "assessment-brand-voice",
    "label": "Brand Voice",
    "responseType": "assessment",
    "required": false,
    "assessmentSlug": "brand-voice"
  }
];

export const serviceCatalog: ServiceBlueprint[] = [
  {
    "id": "brand-strategy",
    "blueprintVersion": 1,
    "status": "draft",
    "categoryId": "brand-strategy",
    "name": "Brand Strategy",
    "description": "Define positioning, audience, differentiation, and strategic priorities.",
    "marketingHref": "/services/branding-services",
    "unit": "project",
    "minimumQuantity": 1,
    "quantityNotes": "Confirm the contents of each unit in the accepted proposal.",
    "configurationFields": [
      "Workshop count",
      "Research scope",
      "Messaging scope"
    ],
    "commercial": {
      "pricingMode": "quote_required",
      "price": null,
      "currency": null,
      "estimatedEffortHours": null,
      "turnaroundBusinessDays": null,
      "supportDays": null,
      "revisions": {
        "includedRounds": null,
        "proposedRounds": null,
        "status": "undecided",
        "notes": "Agree allowances and review windows in the accepted proposal."
      }
    },
    "prerequisites": [
      "Accepted discovery scope and access to decision-makers"
    ],
    "requirementIds": [
      "business-profile",
      "project-contacts",
      "existing-assets",
      "strategy-context",
      "assessment-brand-health",
      "assessment-brand-positioning",
      "assessment-brand-voice"
    ],
    "tasks": [
      {
        "id": "brand-strategy-bivi-1",
        "title": "Review discovery and research agreed competitors",
        "phase": "discovery",
        "owner": "bivi"
      },
      {
        "id": "brand-strategy-bivi-2",
        "title": "Draft positioning, differentiation, and messaging direction",
        "phase": "production",
        "owner": "bivi"
      },
      {
        "id": "brand-strategy-bivi-3",
        "title": "Present strategy and incorporate consolidated feedback",
        "phase": "review",
        "owner": "bivi"
      },
      {
        "id": "brand-strategy-client-1",
        "title": "Complete discovery and validate assumptions",
        "phase": "discovery",
        "owner": "client"
      },
      {
        "id": "brand-strategy-client-2",
        "title": "Review strategy and approve final document",
        "phase": "review",
        "owner": "client"
      },
      {
        "id": "brand-strategy-qa",
        "title": "Verify scoped outputs, formats, and approval records",
        "phase": "qa",
        "owner": "bivi"
      },
      {
        "id": "brand-strategy-handoff",
        "title": "Deliver approved files and agreed handoff instructions",
        "phase": "handoff",
        "owner": "bivi"
      }
    ],
    "approvalGates": [
      {
        "id": "brief",
        "title": "Project brief",
        "phase": "discovery"
      },
      {
        "id": "strategy-direction",
        "title": "Strategic direction",
        "phase": "direction"
      },
      {
        "id": "strategy-final",
        "title": "Final strategy document",
        "phase": "review"
      }
    ],
    "deliverables": [
      "Strategy document",
      "Positioning and value proposition",
      "Audience summary and brand pillars",
      "Implementation priorities"
    ],
    "exclusions": [
      "Naming",
      "Full copywriting",
      "Research recruitment",
      "Logo design"
    ],
    "handoff": [
      "Final PDF and agreed editable files",
      "Decision summary and next steps"
    ],
    "addOnServiceIds": [
      "logo-design",
      "visual-identity"
    ]
  },
  {
    "id": "logo-design",
    "blueprintVersion": 1,
    "status": "draft",
    "categoryId": "graphic-brand-design",
    "name": "Logo Design",
    "description": "Create an approved logo system and production files.",
    "marketingHref": "/services/branding-services",
    "unit": "logo system",
    "minimumQuantity": 1,
    "quantityNotes": "Confirm the contents of each unit in the accepted proposal.",
    "configurationFields": [
      "Concept count",
      "Logo variants",
      "Favicon inclusion"
    ],
    "commercial": {
      "pricingMode": "quote_required",
      "price": null,
      "currency": null,
      "estimatedEffortHours": null,
      "turnaroundBusinessDays": null,
      "supportDays": null,
      "revisions": {
        "includedRounds": null,
        "proposedRounds": 2,
        "status": "proposed",
        "notes": "Two rounds are proposed by the operating plan, not an approved client term."
      }
    },
    "prerequisites": [
      "Approved brief and positioning context; a full strategy purchase is not mandatory"
    ],
    "requirementIds": [
      "business-profile",
      "project-contacts",
      "existing-assets",
      "logo-context"
    ],
    "tasks": [
      {
        "id": "logo-design-bivi-1",
        "title": "Research and propose creative direction",
        "phase": "discovery",
        "owner": "bivi"
      },
      {
        "id": "logo-design-bivi-2",
        "title": "Develop concepts and perform internal review",
        "phase": "production",
        "owner": "bivi"
      },
      {
        "id": "logo-design-bivi-3",
        "title": "Refine selected concept and prepare exports",
        "phase": "review",
        "owner": "bivi"
      },
      {
        "id": "logo-design-client-1",
        "title": "Approve direction and choose a concept",
        "phase": "discovery",
        "owner": "client"
      },
      {
        "id": "logo-design-client-2",
        "title": "Provide consolidated feedback and approve artwork",
        "phase": "review",
        "owner": "client"
      },
      {
        "id": "logo-design-qa",
        "title": "Verify scoped outputs, formats, and approval records",
        "phase": "qa",
        "owner": "bivi"
      },
      {
        "id": "logo-design-handoff",
        "title": "Deliver approved files and agreed handoff instructions",
        "phase": "handoff",
        "owner": "bivi"
      }
    ],
    "approvalGates": [
      {
        "id": "brief",
        "title": "Project brief",
        "phase": "discovery"
      },
      {
        "id": "logo-direction",
        "title": "Creative direction",
        "phase": "direction"
      },
      {
        "id": "logo-concept",
        "title": "Concept selection",
        "phase": "review"
      },
      {
        "id": "logo-final",
        "title": "Final artwork",
        "phase": "review"
      }
    ],
    "deliverables": [
      "Primary logo",
      "Scoped secondary, mark, and orientation variants",
      "Full-color, black, and reversed versions",
      "Applicable RGB and CMYK exports in SVG, PDF, PNG, and JPG",
      "Basic usage sheet"
    ],
    "exclusions": [
      "Unused concepts as final deliverables",
      "Comprehensive guidelines",
      "Animation",
      "Stationery"
    ],
    "handoff": [
      "Named export package",
      "Usage guidance"
    ],
    "addOnServiceIds": [
      "visual-identity",
      "brand-guidelines",
      "social-media-kit"
    ]
  },
  {
    "id": "visual-identity",
    "blueprintVersion": 1,
    "status": "draft",
    "categoryId": "graphic-brand-design",
    "name": "Visual Identity Extension",
    "description": "Build a coherent visual system around an approved logo.",
    "marketingHref": "/services/branding-services",
    "unit": "identity system",
    "minimumQuantity": 1,
    "quantityNotes": "Confirm the contents of each unit in the accepted proposal.",
    "configurationFields": [
      "Visual elements",
      "Example applications",
      "Typography licensing"
    ],
    "commercial": {
      "pricingMode": "quote_required",
      "price": null,
      "currency": null,
      "estimatedEffortHours": null,
      "turnaroundBusinessDays": null,
      "supportDays": null,
      "revisions": {
        "includedRounds": null,
        "proposedRounds": null,
        "status": "undecided",
        "notes": "Agree allowances and review windows in the accepted proposal."
      }
    },
    "prerequisites": [
      "Approved logo and positioning brief"
    ],
    "requirementIds": [
      "business-profile",
      "project-contacts",
      "existing-assets",
      "approved-logo",
      "identity-context"
    ],
    "tasks": [
      {
        "id": "visual-identity-bivi-1",
        "title": "Develop color, typography, and image direction",
        "phase": "discovery",
        "owner": "bivi"
      },
      {
        "id": "visual-identity-bivi-2",
        "title": "Design agreed visual elements and example applications",
        "phase": "production",
        "owner": "bivi"
      },
      {
        "id": "visual-identity-bivi-3",
        "title": "Refine the system and prepare specifications",
        "phase": "review",
        "owner": "bivi"
      },
      {
        "id": "visual-identity-client-1",
        "title": "Confirm applications and approve direction",
        "phase": "discovery",
        "owner": "client"
      },
      {
        "id": "visual-identity-client-2",
        "title": "Review and approve the final visual system",
        "phase": "review",
        "owner": "client"
      },
      {
        "id": "visual-identity-qa",
        "title": "Verify scoped outputs, formats, and approval records",
        "phase": "qa",
        "owner": "bivi"
      },
      {
        "id": "visual-identity-handoff",
        "title": "Deliver approved files and agreed handoff instructions",
        "phase": "handoff",
        "owner": "bivi"
      }
    ],
    "approvalGates": [
      {
        "id": "identity-direction",
        "title": "Visual direction",
        "phase": "direction"
      },
      {
        "id": "identity-final",
        "title": "Identity system",
        "phase": "review"
      }
    ],
    "deliverables": [
      "Color palette and type system",
      "Agreed visual elements and image direction",
      "Sample applications",
      "Basic implementation specifications"
    ],
    "exclusions": [
      "Logo design",
      "Production of every sample application",
      "Comprehensive guidelines"
    ],
    "handoff": [
      "Agreed assets and specifications",
      "Font and asset license references"
    ],
    "addOnServiceIds": [
      "brand-guidelines",
      "social-media-kit",
      "website-design"
    ]
  },
  {
    "id": "brand-guidelines",
    "blueprintVersion": 1,
    "status": "draft",
    "categoryId": "graphic-brand-design",
    "name": "Brand Guidelines",
    "description": "Document an approved identity for consistent application.",
    "marketingHref": "/services/branding-services",
    "unit": "guide",
    "minimumQuantity": 1,
    "quantityNotes": "Confirm the contents of each unit in the accepted proposal.",
    "configurationFields": [
      "Chapters",
      "Editable-file delivery",
      "Voice content"
    ],
    "commercial": {
      "pricingMode": "quote_required",
      "price": null,
      "currency": null,
      "estimatedEffortHours": null,
      "turnaroundBusinessDays": null,
      "supportDays": null,
      "revisions": {
        "includedRounds": null,
        "proposedRounds": null,
        "status": "undecided",
        "notes": "Agree allowances and review windows in the accepted proposal."
      }
    },
    "prerequisites": [
      "Identity components being documented are approved"
    ],
    "requirementIds": [
      "business-profile",
      "project-contacts",
      "existing-assets",
      "approved-identity",
      "guidelines-context"
    ],
    "tasks": [
      {
        "id": "brand-guidelines-bivi-1",
        "title": "Inventory approved assets and outline guide",
        "phase": "discovery",
        "owner": "bivi"
      },
      {
        "id": "brand-guidelines-bivi-2",
        "title": "Document agreed usage rules and examples",
        "phase": "production",
        "owner": "bivi"
      },
      {
        "id": "brand-guidelines-bivi-3",
        "title": "Review consistency and export final guide",
        "phase": "review",
        "owner": "bivi"
      },
      {
        "id": "brand-guidelines-client-1",
        "title": "Confirm outline and factual specifications",
        "phase": "discovery",
        "owner": "client"
      },
      {
        "id": "brand-guidelines-client-2",
        "title": "Review and approve guide",
        "phase": "review",
        "owner": "client"
      },
      {
        "id": "brand-guidelines-qa",
        "title": "Verify scoped outputs, formats, and approval records",
        "phase": "qa",
        "owner": "bivi"
      },
      {
        "id": "brand-guidelines-handoff",
        "title": "Deliver approved files and agreed handoff instructions",
        "phase": "handoff",
        "owner": "bivi"
      }
    ],
    "approvalGates": [
      {
        "id": "guide-outline",
        "title": "Guide outline",
        "phase": "direction"
      },
      {
        "id": "guide-final",
        "title": "Final guide",
        "phase": "review"
      }
    ],
    "deliverables": [
      "PDF guide covering agreed logo, color, typography, imagery, and usage rules"
    ],
    "exclusions": [
      "New identity design",
      "Editable guide unless scoped",
      "Extensive voice content unless scoped"
    ],
    "handoff": [
      "Versioned guide",
      "Linked approved assets"
    ],
    "addOnServiceIds": []
  },
  {
    "id": "website-design",
    "blueprintVersion": 1,
    "status": "draft",
    "categoryId": "web-digital",
    "name": "Website Design",
    "description": "Design the agreed responsive website experience.",
    "marketingHref": "/services/web-design",
    "unit": "scoped page set",
    "minimumQuantity": 1,
    "quantityNotes": "Record exact pages, unique layouts, and functionality in scope; quantity alone is not an estimate.",
    "configurationFields": [
      "Pages",
      "Unique layouts",
      "Breakpoints",
      "Prototype inclusion"
    ],
    "commercial": {
      "pricingMode": "quote_required",
      "price": null,
      "currency": null,
      "estimatedEffortHours": null,
      "turnaroundBusinessDays": null,
      "supportDays": null,
      "revisions": {
        "includedRounds": null,
        "proposedRounds": null,
        "status": "undecided",
        "notes": "Agree allowances and review windows in the accepted proposal."
      }
    },
    "prerequisites": [
      "Sitemap approval before wireframes",
      "Wireframe approval before detailed UI",
      "Suitable brand direction before final UI"
    ],
    "requirementIds": [
      "business-profile",
      "project-contacts",
      "existing-assets",
      "website-context",
      "website-content"
    ],
    "tasks": [
      {
        "id": "website-design-bivi-1",
        "title": "Create sitemap and wireframes",
        "phase": "discovery",
        "owner": "bivi"
      },
      {
        "id": "website-design-bivi-2",
        "title": "Design responsive UI and component system",
        "phase": "production",
        "owner": "bivi"
      },
      {
        "id": "website-design-bivi-3",
        "title": "Prepare agreed prototype and implementation specifications",
        "phase": "review",
        "owner": "bivi"
      },
      {
        "id": "website-design-client-1",
        "title": "Approve sitemap and wireframes",
        "phase": "discovery",
        "owner": "client"
      },
      {
        "id": "website-design-client-2",
        "title": "Provide content and consolidate UI feedback",
        "phase": "review",
        "owner": "client"
      },
      {
        "id": "website-design-qa",
        "title": "Verify scoped outputs, formats, and approval records",
        "phase": "qa",
        "owner": "bivi"
      },
      {
        "id": "website-design-handoff",
        "title": "Deliver approved files and agreed handoff instructions",
        "phase": "handoff",
        "owner": "bivi"
      }
    ],
    "approvalGates": [
      {
        "id": "sitemap",
        "title": "Sitemap",
        "phase": "direction"
      },
      {
        "id": "wireframes",
        "title": "Wireframes",
        "phase": "direction"
      },
      {
        "id": "ui",
        "title": "Website UI",
        "phase": "review"
      },
      {
        "id": "design-handoff",
        "title": "Design handoff",
        "phase": "handoff"
      }
    ],
    "deliverables": [
      "Sitemap and scoped wireframes",
      "Responsive UI for agreed layouts",
      "Component specifications",
      "Agreed prototype and design handoff"
    ],
    "exclusions": [
      "Development",
      "Copywriting",
      "Paid assets",
      "Production deployment"
    ],
    "handoff": [
      "Editable design access as agreed",
      "Implementation specifications"
    ],
    "addOnServiceIds": [
      "website-development"
    ]
  },
  {
    "id": "website-development",
    "blueprintVersion": 1,
    "status": "draft",
    "categoryId": "web-digital",
    "name": "Website Development",
    "description": "Implement approved designs, content, and functionality.",
    "marketingHref": "/services/web-design",
    "unit": "scoped implementation",
    "minimumQuantity": 1,
    "quantityNotes": "Record exact pages, unique layouts, and functionality in scope; quantity alone is not an estimate.",
    "configurationFields": [
      "Pages",
      "CMS",
      "Integrations",
      "Launch",
      "Training"
    ],
    "commercial": {
      "pricingMode": "quote_required",
      "price": null,
      "currency": null,
      "estimatedEffortHours": null,
      "turnaroundBusinessDays": null,
      "supportDays": null,
      "revisions": {
        "includedRounds": null,
        "proposedRounds": null,
        "status": "undecided",
        "notes": "Agree allowances and review windows in the accepted proposal."
      }
    },
    "prerequisites": [
      "Approved implementation scope and designs",
      "Required access and content for each dependent task"
    ],
    "requirementIds": [
      "business-profile",
      "project-contacts",
      "existing-assets",
      "development-scope",
      "approved-web-design",
      "website-content",
      "development-access"
    ],
    "tasks": [
      {
        "id": "website-development-bivi-1",
        "title": "Set up environment and implement components, pages, and scoped integrations",
        "phase": "discovery",
        "owner": "bivi"
      },
      {
        "id": "website-development-bivi-2",
        "title": "Populate content and perform functional and responsive QA",
        "phase": "production",
        "owner": "bivi"
      },
      {
        "id": "website-development-bivi-3",
        "title": "Prepare staging, authorized launch, and smoke test",
        "phase": "review",
        "owner": "bivi"
      },
      {
        "id": "website-development-client-1",
        "title": "Provide content and access invitations",
        "phase": "discovery",
        "owner": "client"
      },
      {
        "id": "website-development-client-2",
        "title": "Review staging and authorize launch",
        "phase": "review",
        "owner": "client"
      },
      {
        "id": "website-development-qa",
        "title": "Verify scoped outputs, formats, and approval records",
        "phase": "qa",
        "owner": "bivi"
      },
      {
        "id": "website-development-handoff",
        "title": "Deliver approved files and agreed handoff instructions",
        "phase": "handoff",
        "owner": "bivi"
      }
    ],
    "approvalGates": [
      {
        "id": "technical-scope",
        "title": "Technical scope",
        "phase": "discovery"
      },
      {
        "id": "staging",
        "title": "Staging acceptance",
        "phase": "review"
      },
      {
        "id": "qa",
        "title": "QA completion",
        "phase": "qa"
      },
      {
        "id": "launch",
        "title": "Launch authorization",
        "phase": "delivery"
      }
    ],
    "deliverables": [
      "Working scoped website and integrations",
      "Agreed source or repository handoff",
      "Deployment, documentation, and training when included"
    ],
    "exclusions": [
      "Hosting subscriptions",
      "Ongoing maintenance",
      "Additional integrations",
      "Copywriting"
    ],
    "handoff": [
      "Ownership and access transfer",
      "Deployment and maintenance instructions",
      "Backup approach and agreed support terms"
    ],
    "addOnServiceIds": []
  },
  {
    "id": "social-media-kit",
    "blueprintVersion": 1,
    "status": "draft",
    "categoryId": "graphic-brand-design",
    "name": "Social Media Kit",
    "description": "Create reusable branded social templates and scoped profile assets.",
    "marketingHref": "/services/social-media-creative",
    "unit": "template set",
    "minimumQuantity": 1,
    "quantityNotes": "Confirm the contents of each unit in the accepted proposal.",
    "configurationFields": [
      "Template count",
      "Platforms",
      "Aspect ratios",
      "Editable format"
    ],
    "commercial": {
      "pricingMode": "quote_required",
      "price": null,
      "currency": null,
      "estimatedEffortHours": null,
      "turnaroundBusinessDays": null,
      "supportDays": null,
      "revisions": {
        "includedRounds": null,
        "proposedRounds": null,
        "status": "undecided",
        "notes": "Agree allowances and review windows in the accepted proposal."
      }
    },
    "prerequisites": [
      "Approved identity or accepted visual direction",
      "Define whether ratio adaptations count as separate templates"
    ],
    "requirementIds": [
      "business-profile",
      "project-contacts",
      "existing-assets",
      "social-context"
    ],
    "tasks": [
      {
        "id": "social-media-kit-bivi-1",
        "title": "Confirm template inventory and design a sample",
        "phase": "discovery",
        "owner": "bivi"
      },
      {
        "id": "social-media-kit-bivi-2",
        "title": "Create layouts and scoped adaptations",
        "phase": "production",
        "owner": "bivi"
      },
      {
        "id": "social-media-kit-bivi-3",
        "title": "Check editable files and exports",
        "phase": "review",
        "owner": "bivi"
      },
      {
        "id": "social-media-kit-client-1",
        "title": "Confirm inventory and supply sample social copy",
        "phase": "discovery",
        "owner": "client"
      },
      {
        "id": "social-media-kit-client-2",
        "title": "Approve sample direction and final set",
        "phase": "review",
        "owner": "client"
      },
      {
        "id": "social-media-kit-qa",
        "title": "Verify scoped outputs, formats, and approval records",
        "phase": "qa",
        "owner": "bivi"
      },
      {
        "id": "social-media-kit-handoff",
        "title": "Deliver approved files and agreed handoff instructions",
        "phase": "handoff",
        "owner": "bivi"
      }
    ],
    "approvalGates": [
      {
        "id": "social-sample",
        "title": "Sample direction",
        "phase": "direction"
      },
      {
        "id": "social-final",
        "title": "Final template set",
        "phase": "review"
      }
    ],
    "deliverables": [
      "Agreed template quantity",
      "Editable files in chosen tool",
      "Sample exports and usage notes"
    ],
    "exclusions": [
      "Posting",
      "Community management",
      "Recurring content creation",
      "Reporting"
    ],
    "handoff": [
      "Editable template access",
      "Exports and instructions"
    ],
    "addOnServiceIds": []
  },
  {
    "id": "presentation-design",
    "blueprintVersion": 1,
    "status": "draft",
    "categoryId": "graphic-brand-design",
    "name": "Presentation Design",
    "description": "Design an editable deck around approved content.",
    "marketingHref": "/services/presentation-design",
    "unit": "slide deck",
    "minimumQuantity": 1,
    "quantityNotes": "Confirm the contents of each unit in the accepted proposal.",
    "configurationFields": [
      "Slide count",
      "Presentation software",
      "Reusable layouts"
    ],
    "commercial": {
      "pricingMode": "quote_required",
      "price": null,
      "currency": null,
      "estimatedEffortHours": null,
      "turnaroundBusinessDays": null,
      "supportDays": null,
      "revisions": {
        "includedRounds": null,
        "proposedRounds": null,
        "status": "undecided",
        "notes": "Agree allowances and review windows in the accepted proposal."
      }
    },
    "prerequisites": [
      "Approved content outline and design direction",
      "Named owner for factual and data validation"
    ],
    "requirementIds": [
      "business-profile",
      "project-contacts",
      "existing-assets",
      "presentation-content"
    ],
    "tasks": [
      {
        "id": "presentation-design-bivi-1",
        "title": "Inventory content and propose sample slide direction",
        "phase": "discovery",
        "owner": "bivi"
      },
      {
        "id": "presentation-design-bivi-2",
        "title": "Design scoped slides and format charts",
        "phase": "production",
        "owner": "bivi"
      },
      {
        "id": "presentation-design-bivi-3",
        "title": "Perform consistency, editable-file, and PDF QA",
        "phase": "review",
        "owner": "bivi"
      },
      {
        "id": "presentation-design-client-1",
        "title": "Approve outline and provide final content",
        "phase": "discovery",
        "owner": "client"
      },
      {
        "id": "presentation-design-client-2",
        "title": "Validate facts and approve deck",
        "phase": "review",
        "owner": "client"
      },
      {
        "id": "presentation-design-qa",
        "title": "Verify scoped outputs, formats, and approval records",
        "phase": "qa",
        "owner": "bivi"
      },
      {
        "id": "presentation-design-handoff",
        "title": "Deliver approved files and agreed handoff instructions",
        "phase": "handoff",
        "owner": "bivi"
      }
    ],
    "approvalGates": [
      {
        "id": "deck-outline",
        "title": "Content outline",
        "phase": "discovery"
      },
      {
        "id": "deck-sample",
        "title": "Sample design",
        "phase": "direction"
      },
      {
        "id": "deck-final",
        "title": "Final deck",
        "phase": "review"
      }
    ],
    "deliverables": [
      "Agreed number of designed slides",
      "Editable deck in agreed application",
      "PDF and scoped reusable layouts"
    ],
    "exclusions": [
      "Business planning",
      "Financial modeling",
      "Full copywriting",
      "Complex animation unless scoped"
    ],
    "handoff": [
      "Editable deck and PDF",
      "Required fonts and license references"
    ],
    "addOnServiceIds": []
  }
];

export function getServiceBlueprint(id: string): ServiceBlueprint | undefined {
  return serviceCatalog.find((service) => service.id === id);
}
