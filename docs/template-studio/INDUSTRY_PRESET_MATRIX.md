# Bivi Template Studio — Industry Preset Inventory and Three-Surface Coverage

> **Planning-only inventory.** 2026-11-23. No industry preset listed here is asserted to be built, tested or compliant. Each row is a starting kit to customize, not a promise that every client receives all modules. This document expands [MASTER_BLUEPRINT.md](./MASTER_BLUEPRINT.md).

## Rules for every preset

Every preset defines: industry/family ID; public website pages; owner/staff dashboard pages; customer/employee mobile portal pages; role matrix; enabled/optional modules; third-party vendor capabilities; required legal/privacy review; mock fixtures; key happy/error/permission flows; SEO/content blocks; responsive/accessibility states; cost drivers; technical owner/maintenance requirements; demo/production status; manifest version.

**No backend duplication:** common appointment, CRM, payment and project modules use shared contracts. A preset changes labels, required data fields, layout and validated business rules, not the underlying record of truth.

**Not every portal is necessary:** a one-person brochure business might need website only. If website + dashboard + portal are selected, share authoritative identity and data. Customer and staff portal may have independent navigation/permissions within one responsive app.

## Industry matrix

| # | Preset | Website pages and conversion | Dashboard | Customer/employee portal | Primary modules and cost dependencies |
| --- | --- | --- | --- | --- | --- |
| 01 | **Beauty salon / spa** | Home, stylists, services/prices, gallery, booking, policies, contact | Day/week calendar, chairs/staff, clients, service packages, revenue, products | Customers book/reschedule, receipts, profile; stylists see assigned appointments | Bookings, CRM, staff, deposits, email, optional SMS, Stripe/Square and inventory |
| 02 | **Barbershop** | Services, team, walk-in status, appointments, gallery | Chair allocation, queues, tips, staff hours, sales | Queue and appointment updates, barber daily schedule | Booking/queue, point of sale, staff, transactional email/SMS optional |
| 03 | **Pet care / grooming / boarding** | Services, pet types, pricing, pet intake, booking | Pet profiles, medical/behavior notes as scoped, availability/resources, staff, deposits | Owners manage pets and appointments; staff get grooming tasks | Shared booking/CRM plus animal record extension, waivers, optional SMS |
| 04 | **Retail brick-and-mortar** | Storefront, locations/hours, catalog, pickup, loyalty | Inventory, SKU/variants, orders, customers, sales, returns | Customer order/loyalty; employee stock checks | Product/inventory, POS **existing Square/Shopify first**, tax/fulfillment integration |
| 05 | **Online store** | Collections, product, cart, checkout, policies, tracking | Orders, inventory, refunds, campaigns, analytics | Customer account/order; warehouse fulfillment tasks | Shopify first when fit, payment processing, shipping/tax, marketing optional |
| 06 | **Digital products / content** | Creator landing, catalog, previews, checkout, member benefits | Digital entitlements, publishing, members, payouts | Purchased assets, subscriptions, account access | CMS, access/entitlements, payments/subscriptions, file delivery and email |
| 07 | **Auto mechanic / repair** | Services, estimate form, booking, trust/case studies | Work order board, repair statuses, parts, estimates, technicians, invoices | Customer repair request/status/approval; technician job checklist | Work orders, scheduling, CRM, parts, estimate/invoice, payments, SMS optional |
| 08 | **Home maintenance / contractors** | Services, service area, quote request, before/after | Dispatch, work orders, crews, estimates, route map, invoices | Customer service requests, work updates; employee route/job checklist | Field service, scheduling, geocoding optional, CRM, payments |
| 09 | **Cleaning / landscaping / HVAC** | Service plans, quote form, coverage areas, membership | Recurring visits, dispatch, crew shifts, assets, invoices | Customers book/change visits; field staff update tasks/photos | Field-service module, recurring billing, SMS optional, map integration if needed |
| 10 | **Construction / renovation** | Services, capabilities, portfolio, case studies, request quote | Project phases, tasks, dependencies, files, cost updates, subcontractors | Client milestone/approval portal; field-worker assignments/photos | Project management, approvals, document storage, estimates and payments |
| 11 | **Event planning / venues** | Portfolio, event packages, inquiry, proposal request | Event pipeline, vendors, budget, timeline, guest records | Client approvals/docs; team schedule and event checklist | Project and vendor CRM, forms, invoicing, files, calendar integrations |
| 12 | **Fitness / yoga / dance studio** | Schedules, instructors, class packs, memberships | Classes, capacity, bookings, attendance, members, revenue | Member booking/check-in/subscription; trainer roster | Classes, subscriptions, capacity, payment and email/SMS optional |
| 13 | **Tutoring / training** | Courses, tutor profiles, scheduling, enrollment | Students, lessons, attendance, packages, invoices | Learner/guardian schedule and progress; tutor lessons | Booking, learning progress, payments; minors/guardian privacy where applicable |
| 14 | **Childcare / daycare** | Programs, enrollment, staff, safety policies, tours | Enrollment, attendance, guardian authorizations, staff | Guardian updates/notifications; staff classroom attendance | Identity/guardian authorization, attendance, privacy and age-sensitive security review |
| 15 | **Home care / elder care** | Care services, consultation request, coverage areas | Care schedules, authorized caregivers, visit logs, plans | Family authorized updates, caregiver shifts | Scheduling, sensitive health/care data, consent and vendor/legal requirements |
| 16 | **Healthcare / wellness clinic** | Practice info, providers, intake/appointments | Scheduling, restricted intake, staff operations, billing connections | Patient secure account where justified | Elevated compliance gate; avoid EHR replication, vetted integrations/BAAs where applicable |
| 17 | **B2B agency / consultant** | Solutions, case studies, discovery form, pricing | Leads, proposals, projects, invoices, team utilization | Client project status/approvals/files; employee assigned tasks | CRM, contracts/proposals, project module, finance integrations |
| 18 | **Financial/bookkeeping services** | Trust/company, consultation, service offerings | Client cases, approvals, document requests, reporting | Client secure document/invoice portal; staff queue | Privacy/compliance, e-sign, files and reporting; avoid unsupported regulated claims |
| 19 | **Content publisher/newsroom** | Articles, categories, search, subscription, contact | Story assignments, editorial drafts, publishing, assets, analytics | Reader account/subscriptions; freelancer assignment/status | CMS, publishing review, roles, membership, billing, email |
| 20 | **Other professional/brick-and-mortar** | Template family chosen via discovery | Compose CRM/booking/commerce/projects as appropriate | Include only needed role flows | Document new family only when existing presets cannot express requirements |

## Generic surface inventory

### Website building blocks
- Navigation/footers, home/hero, trust blocks, services/catalog, locations, contact/intake forms, pricing, team profiles, testimonials, gallery/case studies, FAQ, legal/privacy/accessibility and SEO.
- Conversion modules: availability check and booking, estimate request, commerce checkout, subscription/enrollment, consultation call, support inquiry.
- Required states: empty catalogs, sold out/full class, form validation, confirmation, cancellation, localization/timezone, 404/500 and rate-limited form response.

### Dashboard building blocks
- Owner home KPIs, activity audit, reporting; staff directory, customer directory, data table and detail editor, scheduling or work/fulfillment board, billing/invoicing, notes/files/comments, notifications, support and settings.
- Roles: owner, location manager, assigned employee, delegated accountant/finance, external contractor/vendor where appropriate. Build exact minimum role matrix for each module, not an all-purpose unrestricted "staff" role.
- Required states: no records, long lists, filters/export, unauthorized, revoked membership, concurrent edits, expired session, failed vendor webhook and backup restore.

### Mobile portal building blocks
- Customer: secure login/recovery, account, bookings/orders/projects, messages and support, payment history, documents and approvals; optional membership/loyalty.
- Employee: schedule, assignments, status, checklists, time/location/photo capture if required and consented, work notes; offline drafts only where intentionally engineered and reconciled.
- Accessibility: touch target sizing, screen readers, keyboard entry, loading/retry/offline, safe restricted data displays.

## First two full reference scenarios

### Salon reference: website → dashboard → portal
1. Customer views services and stylist availability; attempts overlapping appointment and receives a clear conflict outcome.
2. Successful booking is an authoritative DB event; authenticated customer sees appointment; assigned stylist sees it in staff portal; owner sees it on calendar.
3. Payment/deposit optionally attaches through client-owned merchant processor; signed provider webhook updates exactly one paid status, including retry/replay.
4. Confirmation/reminder uses opted-in transactional email provider, with time zone and scheduling record; marketing email remains off.
5. Customer cancels/reschedules under explicit policy; calendar conflict and notification behavior remain consistent.
6. Staff cannot view unrelated salons, clients, sales or notes; owner can export permitted business data.
7. Service ownership and spend estimate are shown in Bivi; a sandbox handoff preserves operation and removes Bivi delegated access.

### Pet grooming reuse proof
1. Copy **configuration**, not the booking/CRM code.
2. Extend a customer with one-to-many pet profiles, breed/size/service duration fields and animal-specific waivers, without mapping pets to human users.
3. Preserve shared calendar capacity/conflict logic, payments, transactional notification and staff roles.
4. Add grooming history and behavior notes with restricted scopes; avoid real sensitive owner/animal records in fixtures.
5. Document number of new files/fields/overrides and minutes required; target demonstrable reuse, not identical salon terminology in pet UI.

## Module dependency shorthand

| Module | Always needs | May need | Exclusions / guard |
| --- | --- | --- | --- |
| Public contact/intake | Spam/rate limiting, privacy consent, record sink | CRM, transactional email | Not a paid mass-marketing product by default |
| Booking | Auth or guest identity, availability, time zone, persistence | Payments/deposits, email, SMS | Do not make Twilio required |
| Commerce | Product/orders, payment/checkout, fulfillment policy | Shopify, POS, email, tax/shipping | Avoid duplicate custom checkout with hosted store |
| CRM | Organizations/contacts, role scopes, audit | Marketing, telephony | Do not share personal records across clients |
| Field service | Work orders, assignees, schedule | SMS, maps, invoicing | Maps only if real routing/location required |
| Membership | Identity, payment entitlement, billing records | Access passes, classes | Merchant and cancel/refund terms |
| Projects | Roles, tasks, files, audit | Signatures, invoicing, calendar | Client viewers do not inherit staff admin |
| Marketing | Consent/unsubscribe, verified sender | Brevo/existing provider | Off unless requested/authorized |
| Reminders | Scheduler, queue/retries where needed, transactional email | SMS | Cron triggers alone not guaranteed delivery |
| Reporting | Source events, aggregation/permissions | External BI | No leaking data through export |

## Design variation policy

Within a family, prepare a small, strong range of looks: luxury/editorial, friendly/playful, clinical/quiet, industrial/dense, modern minimal, accessible/high-contrast as appropriate. Unique layouts and conversion patterns are more valuable than dozens of color clones. The **template manager** records approved screenshots and live internal previews with attribution/license audit.

## Reuse and expansion measurement

For every new preset log:
- existing modules reused vs new modules and copied source;
- number of page changes and customized components;
- first working branded preview hours;
- initial implementation + recurring maintenance hours;
- provider account count (owned vs actively used);
- low/expected/high infrastructure cost accuracy after 30/90 days when available;
- demo QA, tenant isolation and handoff readiness;
- accessibility/performance regressions.

Do not mark this inventory COMPLETE merely because screenshots exist. Each preset passes separately through DESIGN → INTERACTIVE → INTEGRATED → PRODUCTION-READY.
