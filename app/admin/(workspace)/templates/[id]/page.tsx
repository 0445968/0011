import Link from 'next/link';
import {notFound} from 'next/navigation';
import {z} from 'zod';
import {requireStaff} from '@/lib/admin/auth';
import {getTemplate} from '@/lib/templates/data';
import {templateKinds} from '@/lib/templates/schema';
import {TemplateEditor} from '@/components/admin/templates/TemplateEditor';
export const dynamic='force-dynamic';
export default async function TemplatePage({params,searchParams:p}:{params:{id:string};searchParams:Record<string,string|undefined>}) {
 const {client,user}=await requireStaff();if(!z.string().uuid().safeParse(params.id).success)notFound();
 const version=p.version&&/^[1-9][0-9]{0,7}$/.test(p.version)?Number(p.version):undefined;
 const data=await getTemplate(client,params.id,Number(p.page)||1,version);if(!data)notFound();const selected=data.selected;const pages=Math.max(1,Math.ceil(data.total/25));
 return <div className="space-y-6"><header><Link href="/templates" className="text-sm underline">Back to Templates</Link><h1 className="mt-4 break-words text-3xl font-semibold">{selected?.title||data.template.title}</h1><p className="mt-2 text-xs text-muted-foreground">{templateKinds[selected?.kind||data.template.kind]} · {selected?`Version ${selected.version}`:'Version unavailable'} · {selected?.visibility==='personal'?'Personal version':data.template.visibility==='workspace'?'Workspace staff':'Only me'}{data.template.archived?' · Archived':''}</p></header>
 {selected?<TemplateEditor key={`${data.template.id}:${selected.version}:${data.template.current_version}`} template={data.template} version={selected} userId={user.id}/>:<p role="status" className="rounded-xl border p-4 text-sm">This version is unavailable. <Link href={`/templates/${params.id}`} className="underline">Open the current version</Link>.</p>}
 <section className="space-y-3 rounded-xl border bg-card p-5"><h2 className="text-lg font-semibold">Version history</h2><p className="text-xs text-muted-foreground">Saved versions are immutable. Only the owner can see earlier personal versions.</p><ol className="divide-y divide-border">{data.history.map(item=><li key={item.version} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><Link href={`/templates/${params.id}?version=${item.version}`} className="font-medium underline">Version {item.version}</Link><p className="mt-1 break-words text-xs text-muted-foreground">{item.change_note}{item.archived?' · Archived':''} · {new Date(item.created_at).toISOString().slice(0,16).replace('T',' ')} UTC</p></div><span className="text-xs text-muted-foreground">{item.visibility==='personal'?'Personal':'Workspace'}</span></li>)}</ol><nav aria-label="Template history pages" className="flex justify-between gap-3 text-sm">{data.page>1?<Link href={`/templates/${params.id}?page=${data.page-1}`}>Previous</Link>:<span/>}<span>Page {data.page} of {pages}</span>{data.page<pages?<Link href={`/templates/${params.id}?page=${data.page+1}`}>Next</Link>:<span/>}</nav></section>
 </div>;
}
