'use client';

import { useState } from 'react';
import {
  DM_Sans,
  Space_Grotesk,
  IBM_Plex_Mono,
} from 'next/font/google';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

import {
  initialDocuments,
  timeOffRequests,
  type TimeOffRequest,
} from './mockData';

import { OverviewView } from './views/OverviewView';
import { PayrollView } from './views/PayrollView';
import { PeopleView } from './views/PeopleView';
import { TimeView } from './views/TimeView';

import {
  DocumentsView,
  ReportsView,
  TaxView,
} from './views/AdminViews';

/* -------------------------------------------------------------------------- */
/* Demo-specific fonts                                                        */
/* -------------------------------------------------------------------------- */

const bodyFont = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-business-body',
  display: 'swap',
});

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-business-heading',
  display: 'swap',
});

const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-business-mono',
  display: 'swap',
});

export type BusinessView =
  | 'overview'
  | 'payroll'
  | 'people'
  | 'time'
  | 'tax'
  | 'documents'
  | 'reports';

const mobileViews: {
  id: BusinessView;
  label: string;
}[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'people', label: 'People' },
  { id: 'time', label: 'Time' },
  { id: 'tax', label: 'Tax' },
  { id: 'documents', label: 'Documents' },
  { id: 'reports', label: 'Reports' },
];

export function BusinessFinanceApp() {
  const [view, setView] =
    useState<BusinessView>('overview');

  const [requests, setRequests] =
    useState<TimeOffRequest[]>(timeOffRequests);

  const [payrollStatus, setPayrollStatus] =
    useState('Ready for review');

  const [documents, setDocuments] =
    useState(initialDocuments);

  const updateRequest = (
    id: number,
    status: 'Approved' | 'Declined'
  ) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
            }
          : request
      )
    );
  };

  const exportCsv = (
    filename: string,
    rows: string[][]
  ) => {
    const csv = rows
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${cell.replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([csv], {
        type: 'text/csv',
      })
    );

    const anchor =
      document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`
        business-finance-demo
        ${bodyFont.variable}
        ${headingFont.variable}
        ${monoFont.variable}
        min-h-screen
        bg-[#08172a]
        text-white
      `}
    >
      {/*
        This forces the demo to ignore font-heading,
        font-sans, and other inherited site typography.
      */}
      <style jsx global>{`
        .business-finance-demo,
        .business-finance-demo button,
        .business-finance-demo input,
        .business-finance-demo textarea,
        .business-finance-demo select,
        .business-finance-demo table {
          font-family: var(--font-business-body) !important;
        }

        .business-finance-demo h1,
        .business-finance-demo h2,
        .business-finance-demo h3,
        .business-finance-demo h4,
        .business-finance-demo h5,
        .business-finance-demo h6,
        .business-finance-demo .business-heading {
          font-family: var(--font-business-heading) !important;
        }

        .business-finance-demo .business-mono {
          font-family: var(--font-business-mono) !important;
        }
      `}</style>

      <div className="flex min-h-screen">
        <Sidebar
          view={view}
          onChange={setView}
        />

        <div className="min-w-0 flex-1">
          <TopBar view={view} />

          {/* Mobile navigation */}
          <div
            className="
              border-b
              border-white/10
              bg-[#0a1b31]
              px-4
              py-2
              lg:hidden
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                overflow-x-auto
                pb-1
              "
            >
              <Menu
                size={16}
                className="
                  mr-1
                  shrink-0
                  text-white/35
                "
              />

              {mobileViews.map((item) => {
                const active =
                  view === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setView(item.id)
                    }
                    className={`
                      shrink-0
                      rounded-lg
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      transition-colors

                      ${
                        active
                          ? `
                            bg-white
                            text-[#071426]
                          `
                          : `
                            bg-white/[0.04]
                            text-white/55
                            hover:bg-white/[0.08]
                            hover:text-white
                          `
                      }
                    `}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <main
            className="
              mx-auto
              max-w-[1500px]
              p-4
              md:p-6
              xl:p-8
            "
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -3,
                }}
                transition={{
                  duration: 0.16,
                }}
              >
                {view === 'overview' && (
                  <OverviewView
                    onNavigate={setView}
                  />
                )}

                {view === 'payroll' && (
                  <PayrollView
                    payrollStatus={
                      payrollStatus
                    }
                    onRunPayroll={() =>
                      setPayrollStatus(
                        'Scheduled'
                      )
                    }
                  />
                )}

                {view === 'people' && (
                  <PeopleView
                    requests={requests}
                    onRequestStatus={
                      updateRequest
                    }
                  />
                )}

                {view === 'time' && (
                  <TimeView />
                )}

                {view === 'tax' && (
                  <TaxView />
                )}

                {view ===
                  'documents' && (
                  <DocumentsView
                    documents={documents}
                    onImport={(file) =>
                      setDocuments(
                        (current) => [
                          {
                            name: file.name,
                            type: 'Imported',
                            updated:
                              'Just now',
                            size: `${Math.max(
                              1,
                              Math.round(
                                file.size /
                                  1024
                              )
                            )} KB`,
                          },
                          ...current,
                        ]
                      )
                    }
                    onExport={() =>
                      exportCsv(
                        'northstar-document-index.csv',
                        [
                          [
                            'Name',
                            'Type',
                            'Updated',
                            'Size',
                          ],
                          ...documents.map(
                            (item) => [
                              item.name,
                              item.type,
                              item.updated,
                              item.size,
                            ]
                          ),
                        ]
                      )
                    }
                  />
                )}

                {view === 'reports' && (
                  <ReportsView
                    onExport={() =>
                      exportCsv(
                        'northstar-labor-report.csv',
                        [
                          [
                            'Month',
                            'Labor cost ($000s)',
                          ],
                          ...[
                            'Sep',
                            'Oct',
                            'Nov',
                            'Dec',
                            'Jan',
                            'Feb',
                            'Mar',
                            'Apr',
                            'May',
                            'Jun',
                            'Jul',
                            'Aug',
                          ].map(
                            (
                              month,
                              index
                            ) => [
                              month,
                              String(
                                [
                                  58,
                                  63,
                                  61,
                                  70,
                                  68,
                                  76,
                                  72,
                                  84,
                                  80,
                                  88,
                                  91,
                                  86,
                                ][index]
                              ),
                            ]
                          ),
                        ]
                      )
                    }
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}