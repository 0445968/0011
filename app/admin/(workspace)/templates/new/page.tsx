import Link from 'next/link';
import {requireStaff} from '@/lib/admin/auth';
import {TemplateEditor} from '@/components/admin/templates/TemplateEditor';
export const dynamic='force-dynamic';
export default async function NewTemplatePage(){const {user}=await requireStaff();return <div className="space-y-6"><header><Link className="text-sm underline" href="/templates">Back to Templates</Link><h1 className="mt-4 text-3xl font-semibold">New template</h1></header><TemplateEditor userId={user.id}/></div>;}
