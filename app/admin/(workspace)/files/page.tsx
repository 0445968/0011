import Link from 'next/link';
import {requireStaff} from '@/lib/admin/auth';
import {listSharedFiles} from '@/lib/files/directory-data';
import {fileSize, projectFilesHref} from '@/lib/files/directory-links';
import {FileDirectoryActions} from '@/components/admin/files/FileDirectoryActions';

export const dynamic='force-dynamic';
const field='h-11 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm';
const button='inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm hover:bg-muted';

export default async function SharedFilesPage({searchParams:p}:{searchParams:Record<string,string|undefined>}) {
  const {client,user}=await requireStaff();
  const result=await listSharedFiles(client,user.id,p);
  const pages=Math.max(1,Math.ceil(result.total/25));
  const exactScope=!!p.project||!!p.company||!!p.uploader&&!['mine','staff','client','former'].includes(p.uploader);
  function href(changes:Record<string,string|undefined>){const params=new URLSearchParams();for(const [key,value] of Object.entries({...p,...changes}))if(value)params.set(key,value);return `/files?${params}`;}
  const uploaderOptions=['mine','staff','client','former'];

  return <div className="space-y-6">
    <header><p className="text-xs uppercase tracking-wider text-muted-foreground">Workspace</p><h1 className="mt-2 text-3xl font-semibold">Shared Files</h1><p className="mt-2 text-sm text-muted-foreground">Find project uploads across the workspace, including files kept private to Bivi.</p><p className="mt-2 text-xs text-muted-foreground">Ready files appear by default. Uploading, sharing, withdrawal, and file history live in each project’s file exchange.</p></header>
    <form className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
      {p.project&&<input type="hidden" name="project" value={p.project}/>}
      {p.company&&<input type="hidden" name="company" value={p.company}/>}
      <label className="space-y-1 text-xs sm:col-span-2"><span>Search</span><input className={field} name="q" defaultValue={p.q} maxLength={100} placeholder="File, project, company, uploader or public ID"/></label>
      <label className="space-y-1 text-xs"><span>Type</span><select className={field} name="type" defaultValue={p.type||''}><option value="">All file types</option><option value="images">Images</option><option value="pdf">PDF</option><option value="text">Text</option><option value="zip">ZIP</option></select></label>
      <label className="space-y-1 text-xs"><span>State</span><select className={field} name="state" defaultValue={p.state||'ready'}><option value="ready">Ready</option><option value="pending">Pending verification</option><option value="withdrawn">Withdrawn</option><option value="all">All states</option></select></label>
      <label className="space-y-1 text-xs"><span>Sharing</span><select className={field} name="shared" defaultValue={p.shared||''}><option value="">All sharing</option><option value="yes">Shared with assigned clients</option><option value="no">Private / not shared</option></select></label>
      <label className="space-y-1 text-xs"><span>Uploader</span><select className={field} name="uploader" defaultValue={p.uploader||''}><option value="">Anyone</option><option value="mine">Me</option><option value="staff">Staff accounts</option><option value="client">Client accounts</option><option value="former">Former / unavailable accounts</option>{p.uploader&&!uploaderOptions.includes(p.uploader)&&<option value={p.uploader}>Selected uploader</option>}</select></label>
      <label className="space-y-1 text-xs"><span>Uploaded from (UTC)</span><input className={field} type="date" name="from" defaultValue={result.dates.from?.slice(0,10)}/></label>
      <label className="space-y-1 text-xs"><span>Uploaded through (UTC)</span><input className={field} type="date" name="to" defaultValue={result.dates.through}/></label>
      <label className="space-y-1 text-xs"><span>Sort</span><select className={field} name="sort" defaultValue={p.sort||'uploaded'}><option value="uploaded">Upload date</option><option value="name">Filename</option><option value="size">File size</option><option value="project">Project</option></select></label>
      <label className="space-y-1 text-xs"><span>Direction</span><select className={field} name="direction" defaultValue={p.direction||'desc'}><option value="desc">Descending</option><option value="asc">Ascending</option></select></label>
      <div className="flex items-end gap-2 sm:col-span-2"><button className="min-h-11 rounded-lg bg-foreground px-4 text-sm text-background">Apply filters</button><Link href="/files" className={button}>Reset</Link></div>
    </form>
    {result.dates.warning&&<p role="status" className="rounded-lg border p-3 text-sm">{result.dates.warning}</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><p>{result.total} files{exactScope?' · Scoped to the selected project, company, or uploader':''}</p>{exactScope&&<Link className="underline" href={href({project:undefined,company:undefined,uploader:undefined,page:undefined})}>Clear selected scope</Link>}<p>Previews: PNG, JPG, WebP, and TXT up to 256 KB. Download PDFs, ZIPs, or larger text files.</p></div>
    {result.rows.length?<ul className="space-y-3">{result.rows.map(file=><li key={file.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1"><h2 className="break-all text-sm font-semibold">{file.filename}</h2><p className="mt-1 text-xs text-muted-foreground">{fileSize(file.size_bytes)} · {file.mime_type} · {file.state==='ready'?(file.shared?'Shared with assigned clients':'Private to Bivi'):file.state==='pending'?'Pending verification':'Withdrawn'}</p>
          <p className="mt-3 break-words text-xs"><Link className="font-medium hover:underline" href={projectFilesHref(file.request_id)}>{file.project_title}</Link> <span className="font-mono text-muted-foreground">{file.project_public_id}</span> <Link className="ml-1 text-muted-foreground underline" href={href({project:file.request_id,page:undefined})}>Filter project</Link></p>
          {file.company_name&&file.company_id?<p className="mt-1 text-xs"><Link href={`/companies/${file.company_id}`} className="hover:underline">{file.company_name}</Link> <Link className="ml-1 text-muted-foreground underline" href={href({company:file.company_id,page:undefined})}>Filter company</Link></p>:<p className="mt-1 text-xs text-muted-foreground">No company assigned</p>}
          <p className="mt-2 text-xs text-muted-foreground">Uploaded {new Date(file.created_at).toISOString().slice(0,16).replace('T',' ')} UTC · {file.uploader_label}{file.uploader_id&&<> <Link className="underline" href={href({uploader:file.uploader_id,page:undefined})}>Filter uploader</Link></>}</p>
        </div>
        <FileDirectoryActions file={file}/>
      </div>
    </li>)}</ul>:<div className="rounded-xl border border-border bg-card p-8 text-center"><p className="text-sm font-medium">No files match these filters.</p><p className="mt-2 text-xs text-muted-foreground">Upload files from a project’s file exchange, or adjust the filters.</p><Link href="/projects" className="mt-4 inline-block text-sm underline">Open projects</Link></div>}
    <nav aria-label="File directory pages" className="flex flex-wrap items-center justify-between gap-3 text-sm">{result.page>1?<Link className={button} href={href({page:String(result.page-1)})}>Previous</Link>:<span/>}<span>Page {result.page} of {pages}</span>{result.page<pages?<Link className={button} href={href({page:String(result.page+1)})}>Next</Link>:<span/>}</nav>
  </div>;
}
