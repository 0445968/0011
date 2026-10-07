import type {
  Metadata,
} from 'next';

import {
  GetStartedFlow,
} from '@/components/get-started/GetStartedFlow';

export const metadata: Metadata = {
  title: 'Start a project',
  description:
    'Tell Bivi what you want to create. Choose services, share your goals, and request a project proposal.',
};

export default function GetStartedPage({
  searchParams,
}: {
  searchParams: {
    services?:
      | string
      | string[];
    email?:
      | string
      | string[];
  };
}) {
  const selections =
    Array.isArray(
      searchParams.services
    )
      ? searchParams.services.join(
          ','
        )
      : searchParams.services ??
        '';

  const email =
    Array.isArray(
      searchParams.email
    )
      ? searchParams.email[0] ??
        ''
      : searchParams.email ??
        '';

  return (
    <GetStartedFlow
      initialSelections={selections.slice(
        0,
        2000
      )}
      initialEmail={email
        .trim()
        .slice(0, 254)}
    />
  );
}