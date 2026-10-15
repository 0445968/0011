'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {Dialog, DialogContent, DialogDescription, DialogTitle} from '@/components/ui/dialog';
import {fileSize, previewKind, projectFilesHref, type DirectoryFile} from '@/lib/files/directory-links';

const button='inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-3 text-xs hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function FileDirectoryActions({file}:{file:DirectoryFile}) {
  const [open,setOpen]=useState(false);
  const [url,setUrl]=useState('');
  const [text,setText]=useState('');
  const [loading,setLoading]=useState(false);
  const [downloading,setDownloading]=useState(false);
  const [error,setError]=useState('');
  const [imageFailed,setImageFailed]=useState(false);
  const generation=useRef(0);
  const downloadPending=useRef(false);
  const mounted=useRef(false);
  const kind=previewKind(file.mime_type,file.size_bytes);
  const base=`/api/admin/projects/${file.request_id}/files/${file.id}`;

  useEffect(()=>{
    mounted.current=true;
    return()=>{mounted.current=false;generation.current+=1;};
  },[]);

  async function authorize(action:'preview'|'download') {
    const response=await fetch(`${base}/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',cache:'no-store',signal:AbortSignal.timeout(15000)});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'File access could not be authorized.');
    return data.url as string;
  }

  async function preview() {
    const current=++generation.current;
    setOpen(true);setLoading(true);setError('');setUrl('');setText('');setImageFailed(false);
    try {
      const signedUrl=await authorize('preview');
      if(kind==='text') {
        const response=await fetch(signedUrl,{cache:'no-store',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(15000)});
        if(!response.ok)throw new Error('The text preview could not load. Refresh the preview or download the file.');
        const content=await response.text();
        if(mounted.current&&current===generation.current)setText(content);
      } else if(mounted.current&&current===generation.current)setUrl(signedUrl);
    } catch(e) {
      if(mounted.current&&current===generation.current)setError(e instanceof Error?e.message:'Preview could not load.');
    } finally {
      if(mounted.current&&current===generation.current)setLoading(false);
    }
  }

  async function download() {
    if(downloadPending.current)return;
    downloadPending.current=true;setDownloading(true);setError('');
    try {window.location.assign(await authorize('download'));}
    catch(e){if(mounted.current)setError(e instanceof Error?e.message:'Download could not start.');}
    finally{downloadPending.current=false;if(mounted.current)setDownloading(false);}
  }

  return <div className="space-y-2">
    <div className="flex flex-wrap gap-2">
      {file.state==='ready'&&kind&&<button type="button" className={button} onClick={()=>void preview()} aria-label={`Preview ${file.filename}`}>Preview</button>}
      {file.state==='ready'&&<button type="button" className={button} disabled={downloading} onClick={()=>void download()} aria-label={`Download ${file.filename}`}>{downloading?'Authorizing…':'Download'}</button>}
      <Link className={button} href={projectFilesHref(file.request_id)}>Open project files</Link>
    </div>
    {error&&!open&&<p role="alert" className="text-xs text-destructive">{error}</p>}
    <Dialog open={open} onOpenChange={next=>{setOpen(next);if(!next){generation.current+=1;setLoading(false);setUrl('');setText('');setError('');}}}>
      <DialogContent className="bivi-staff-surface max-h-[85dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-xl">
        <DialogTitle className="break-all pr-6">{file.filename}</DialogTitle>
        <DialogDescription>{file.project_title} · {fileSize(file.size_bytes)} · {file.mime_type}</DialogDescription>
        {loading&&<p role="status" className="py-8 text-center text-sm text-muted-foreground">Loading preview…</p>}
        {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
        {kind==='image'&&url&&!error&&(imageFailed?<p role="status" className="text-sm">The image preview is unavailable. Refresh the preview or download the file.</p>:
          // Native images accept short-lived Storage URLs without a public image proxy.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.filename} referrerPolicy="no-referrer" className="mx-auto max-h-[55dvh] max-w-full rounded-lg object-contain" onError={()=>setImageFailed(true)}/>
        )}
        {kind==='text'&&!loading&&!error&&<pre className="max-h-[55dvh] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-4 font-mono text-xs">{text||'(Empty text file)'}</pre>}
        <div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={loading} onClick={()=>void preview()}>Refresh preview</button><button type="button" className={button} disabled={downloading} onClick={()=>void download()}>{downloading?'Authorizing…':'Download'}</button><Link href={projectFilesHref(file.request_id)} className={button}>Open project files</Link></div>
      </DialogContent>
    </Dialog>
  </div>;
}
