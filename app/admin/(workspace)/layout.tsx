
import type { ReactNode } from 'react';

import { requireStaff } from '@/lib/admin/auth';

import {
  StaffWorkspaceShell,
} from '@/components/admin/StaffWorkspaceShell';

export const dynamic = 'force-dynamic';

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Preserve existing staff authentication.
  await requireStaff();

  return (
    <StaffWorkspaceShell>
      {children}
    </StaffWorkspaceShell>
  );
}
