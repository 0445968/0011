import {
    BugReportForm,
  } from '@/components/help-center/contact/BugReportForm';
  
  import {
    ContactFormShell,
  } from '@/components/help-center/contact/ContactFormShell';
  
  export default function BugReportPage() {
    return (
      <ContactFormShell
        eyebrow="Report a bug"
        title="Tell us what went wrong."
        description="
          Share what happened, where the issue occurred,
          and what you expected to happen instead.
          The more context you provide, the easier it is
          for Design Blade to investigate.
        "
        sidebarTitle="Help us reproduce the issue"
        sidebarDescription="
          Bug reports are most useful when they include
          enough information for us to see the same
          problem on our side.
        "
        tips={[
          'Include the exact page or tool where the issue occurred.',
          'Describe the steps you took before the problem appeared.',
          'Explain what you expected to happen instead.',
          'Add a screenshot when the issue is visual or interface-related.',
        ]}
      >
        <BugReportForm />
      </ContactFormShell>
    );
  }