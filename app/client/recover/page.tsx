import Link from 'next/link';import {AccountSetup} from '@/components/portal/AccountSetup';
export const dynamic='force-dynamic';
export default function AccountPage(){return <main className="mx-auto max-w-md px-5 py-16"><Link href="/" className="font-heading text-2xl font-semibold">Bivi</Link><section className="mt-8 rounded-2xl border border-border bg-card p-6"><h1 className="font-heading text-3xl font-semibold">Reset your password</h1><p className="mt-4 text-sm text-muted-foreground">Enter the email address used for your Bivi account.</p><AccountSetup mode="recover"/></section></main>;}
