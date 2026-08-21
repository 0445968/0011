import {
    ContactFormShell,
  } from '@/components/help-center/contact/ContactFormShell';
  
  import {
    FeatureRequestForm,
  } from '@/components/help-center/contact/FeatureRequestForm';
  
  export default function FeatureRequestPage() {
    return (
      <ContactFormShell
        eyebrow="Request a feature"
        title="Tell us what you’d like to see."
        description="
          Suggest a new feature, tool, assessment,
          resource, or improvement for Design Blade.
          The more clearly you explain the problem
          behind the idea, the easier it is for us
          to understand its value.
        "
        sidebarTitle="What makes a useful request?"
        sidebarDescription="
          Feature requests are most helpful when they
          explain both the idea itself and the problem
          it would solve.
        "
        tips={[
          'Tell us which part of Design Blade the idea relates to.',
          'Explain the problem or friction you are trying to solve.',
          'Describe who would benefit from the improvement.',
          'Include examples or references when they help explain the idea.',
        ]}
      >
        <FeatureRequestForm />
      </ContactFormShell>
    );
  }