import { cookies } from 'next/headers';

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

  const { user,client } = await requireStaff();
  const avatar=await client.rpc("get_profile_image",{p_kind:"staff",p_subject:user.id});
  const staff=await client.from("inquiry_staff").select("public_id").eq("user_id",user.id).maybeSingle();

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
      initialCollapsed={cookies().get('bivi-staff-sidebar-collapsed')?.value === 'true'}
      staffId={staffId}
      staffAvatarPath={avatar.data||null}
      staffPublicId={staff.data?.public_id||""}
      staffEmail={staffEmail}
    >
      {children}
    </StaffWorkspaceShell>
  );
}
