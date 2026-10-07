import {pathToFileURL} from 'node:url';

const fixtureId='00000000-0000-4000-8000-000000000001';
const fileId='00000000-0000-4000-8000-000000000002';
const foreignOrigin='https://bivi-verification.invalid';

export function deploymentCases(){
  const cases=[];
  for(const path of ['/get-started','/admin/login','/client/login']){
    cases.push({label:`Public page ${path}`,path,status:200,html:true,login:path.includes('login')});
  }
  for(const path of ['/admin','/admin/projects',`/admin/leads/${fixtureId}`,`/admin/leads/${fixtureId}/onboarding`,`/admin/projects/${fixtureId}`,`/admin/projects/${fixtureId}/publish`,`/admin/projects/${fixtureId}/files`]){
    cases.push({label:`Staff gate ${path}`,path,status:307,redirect:'/admin/login'});
  }
  for(const path of ['/client',`/client/projects/${fixtureId}`]){
    cases.push({label:`Client gate ${path}`,path,status:307,redirect:'/client/login'});
  }
  const protectedPaths=[
    `/api/admin/leads/${fixtureId}`,
    `/api/admin/leads/${fixtureId}/proposals`,
    `/api/admin/leads/${fixtureId}/readiness`,
    `/api/admin/leads/${fixtureId}/onboarding`,
    `/api/admin/projects/${fixtureId}`,
    `/api/admin/projects/${fixtureId}/publish`,
    `/api/admin/projects/${fixtureId}/files`,
    `/api/admin/projects/${fixtureId}/files/${fileId}/download`,
    `/api/client/projects/${fixtureId}/review`,
    `/api/client/projects/${fixtureId}/files`,
    `/api/client/projects/${fixtureId}/files/${fileId}/download`,
  ];
  for(const path of protectedPaths){
    const method=path===`/api/admin/leads/${fixtureId}`?'PATCH':'POST';
    cases.push({label:`Anonymous API denial ${path}`,path,method,status:401,privateJson:true});
    cases.push({label:`Foreign-origin denial ${path}`,path,method,status:403,origin:foreignOrigin,privateJson:true});
  }
  for(const path of ['/api/admin/session','/api/client/session']){
    cases.push({label:`Invalid sign-in body ${path}`,path,method:'POST',status:400,privateJson:true});
    cases.push({label:`Foreign-origin sign-in denial ${path}`,path,method:'POST',status:403,origin:foreignOrigin,privateJson:true});
  }
  cases.push({label:'Intake has no public read endpoint',path:'/api/inquiries',status:405});
  cases.push({label:'Foreign-origin intake denied before submission',path:'/api/inquiries',method:'POST',status:403,origin:foreignOrigin,privateJson:true});
  return cases;
}

export async function verifyDeployment(origin,{fetchImpl=fetch,log=console.log}={}){
  const results=[];
  for(const entry of deploymentCases()){
    let reason='';
    try{
      const response=await fetchImpl(new URL(entry.path,origin),{
        method:entry.method||'GET',redirect:'manual',credentials:'omit',cache:'no-store',
        headers:entry.method?{'Content-Type':'application/json',Origin:entry.origin||origin}:{},
        ...(entry.method?{body:'{}'}:{}),signal:AbortSignal.timeout(15000),
      });
      const body=await response.text();
      if(response.status!==entry.status)reason=`expected HTTP ${entry.status}, received ${response.status}`;
      else if(entry.redirect){
        const location=response.headers.get('location');
        const target=location?new URL(location,origin):null;
        if(!target||target.origin!==origin||target.pathname!==entry.redirect)reason='expected same-origin sign-in redirect';
      }
      else if(entry.html){
        if(!response.headers.get('content-type')?.includes('text/html'))reason='expected HTML';
        else if(entry.login&&(!/<input\b[^>]*\btype="password"/i.test(body)||!/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(body)))reason='expected password sign-in form and noindex metadata';
      }
      else if(entry.privateJson){
        if(!response.headers.get('cache-control')?.includes('no-store'))reason='error response must not be cached';
        else if(!response.headers.get('content-type')?.includes('application/json'))reason='expected JSON error response';
        else{let payload;try{payload=JSON.parse(body);}catch{reason='invalid JSON response';}
          if(!reason&&(!payload||typeof payload.error!=='string'||Object.keys(payload).some(key=>key!=='error')))reason='expected an error-only response';}
      }
    }catch{reason='request failed or timed out';}
    const result={label:entry.label,passed:!reason,...(reason?{reason}:{})};results.push(result);
    log(`${result.passed?'PASS':'FAIL'} ${entry.label}${reason?`: ${reason}`:''}`);
  }
  const failed=results.filter(result=>!result.passed).length;
  log(`Deployment checks: ${results.length-failed}/${results.length} passed. No accounts, inquiries or files were created. Authenticated workflows, real Storage behavior and cookies remain manual checks.`);
  return {passed:failed===0,results};
}

async function main(){
  const args=process.argv.slice(2);const raw=args.find(arg=>!arg.startsWith('--'));
  let target;
  try{target=new URL(raw);const local=args.includes('--allow-http')&&['localhost','127.0.0.1','[::1]'].includes(target.hostname);
    if(args.some(arg=>arg.startsWith('--')&&arg!=='--allow-http')||args.filter(arg=>!arg.startsWith('--')).length!==1||target.username||target.password||target.search||target.hash||target.pathname!=='/'||(target.protocol!=='https:'&&!(local&&target.protocol==='http:')))throw new Error();
  }catch{console.error('Usage: npm run verify:deployment -- https://YOUR_CANONICAL_HOST\nLocal only: npm run verify:deployment -- http://localhost:3001 --allow-http');process.exitCode=1;return;}
  const report=await verifyDeployment(target.origin);process.exitCode=report.passed?0:1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
