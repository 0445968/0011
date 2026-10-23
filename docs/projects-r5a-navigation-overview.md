# R5a — Project navigation and Overview cleanup

This patch works on the Bivi dashboard-overhaul branch and contains no database migration.

- Shared record-sections configuration powers both the project tab strip and View → Record sections menu.
- Existing Overview, Tasks & Milestones, Lifecycle, Brief, Delivery, Files, Discussion, Access and Publishing URLs retain their routing.
- Activity and the dedicated project Calendar are visible but disabled until R5b and R6, respectively. The staff-wide Calendar at /calendar remains available in the sidebar.
- The duplicate Project areas shortcuts have been removed from Overview. The columns exchange positions on xl layouts so saved history moves left and Open Tasks moves right. This history remains a limited, accurately sourced preview; it is not yet the unified Activity feed.
- Project Record fields move from Overview into Publishing. The owner field is explicitly labeled legacy, not a verified identity.
- No lifecycle, task, phase, permission, draft, or publishing mutations are changed.

Verify browser interactions on the shared tab bar and View menu for a project with and without activated work. Confirm publication and source-inquiry links. Run typecheck, platform tests and build before committing.
