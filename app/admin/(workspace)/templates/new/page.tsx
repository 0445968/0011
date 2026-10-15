import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireStaff} from '@/lib/admin/auth';
import {getServiceBlueprint} from '@/data/serviceCatalog';
import {serviceTemplateSeed} from '@/lib/services/staff-catalog';
import {TemplateEditor} from '@/components/admin/templates/TemplateEditor';
export const dynamic='force-dynamic';
export default async function NewTemplatePage({searchParams:p}:{searchParams:Record<string,string|undefined>}) {
 const {user}=await requireStaff();const service=p.service?getServiceBlueprint(p.service):undefined;if(p.service&&!service)notFound();
 return <div className="space-y-6"><header><Link className="text-sm underline" href="/templates">Back to Templates</Link><h1 className="mt-4 text-3xl font-semibold">New template</h1>{service&&<p className="mt-2 text-sm text-muted-foreground">Draft scope from <Link className="underline" href={`/services/${service.id}`}>{service.name}</Link>, blueprint v{service.blueprintVersion}. Review it and save as your own template.</p>}</header><TemplateEditor key={service?.id||'blank'} userId={user.id} initialFields={service?serviceTemplateSeed(service):undefined}/></div>;
}
