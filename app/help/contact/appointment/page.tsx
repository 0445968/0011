import {
    AppointmentRequestForm,
  } from '@/components/help-center/contact/AppointmentRequestForm';
  
  import {
    ContactFormShell,
  } from '@/components/help-center/contact/ContactFormShell';
  
  export default function AppointmentRequestPage() {
    return (
      <ContactFormShell
        eyebrow="Request an appointment"
        title="Let’s talk about what you’re building."
        description="
          Share a little about your project, goals,
          timing, and availability so Design Blade
          can prepare for a useful conversation from
          the start.
        "
        sidebarTitle="Help us prepare"
        sidebarDescription="
          The best project conversations start with
          a little context. You do not need to have
          every detail figured out before reaching out.
        "
        tips={[
          'Tell us which service or project area you are considering.',
          'Share the main challenge you are trying to solve.',
          'Include timing and budget estimates if you already have them.',
          'Add your preferred availability so follow-up is easier.',
        ]}
      >
        <AppointmentRequestForm />
      </ContactFormShell>
    );
  }