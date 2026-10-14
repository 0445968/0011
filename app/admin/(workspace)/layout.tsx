
import type { ReactNode } from 'react';

import {
  requireStaff,
} from '@/lib/admin/auth';

import {
  StaffWorkspaceShell,
} from '@/components/admin/StaffWorkspaceShell';

/* =========================================================
   CONFIGURATION
   ========================================================= */

export const dynamic = 'force-dynamic';

/* =========================================================
   AUTHENTICATED WORKSPACE LAYOUT
   ========================================================= */

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  /* =======================================================
     AUTHENTICATE STAFF MEMBER
     ======================================================= */

  const { user } = await requireStaff();

  /* =======================================================
     STAFF ACCOUNT INFORMATION
     ======================================================= */

  const staffId = user.id;

  const staffEmail = user.email ?? '';

  /* =======================================================
     RENDER PERSISTENT WORKSPACE
     ======================================================= */

  return (
    <StaffWorkspaceShell
      staffId={staffId}
      staffEmail={staffEmail}
    >
      {children}
    </StaffWorkspaceShell>
  );
}
