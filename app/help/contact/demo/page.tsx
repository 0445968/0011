import {
    ContactFormShell,
  } from '@/components/help-center/contact/ContactFormShell';
  
  import {
    DemoRequestForm,
  } from '@/components/help-center/contact/DemoRequestForm';
  
  export default function DemoRequestPage() {
    return (
      <ContactFormShell
        eyebrow="Request a demo"
        title="See how Design Blade can help."
        description="
          Tell us what you are exploring and what you
          would like to see. We can tailor the
          conversation around relevant capabilities,
          work examples, process, and project direction.
        "
        sidebarTitle="Make the demo relevant"
        sidebarDescription="
          A little context helps us avoid giving you
          a generic overview and focus on what matters
          most to your business.
        "
        tips={[
          'Share the type of project or challenge you are exploring.',
          'Tell us which Design Blade capabilities interest you most.',
          'Include your expected timeline if you already have one.',
          'Let us know what you specifically want to see demonstrated.',
        ]}
      >
        <DemoRequestForm />
      </ContactFormShell>
    );
  }