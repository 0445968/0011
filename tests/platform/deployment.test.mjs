import test from 'node:test';
import assert from 'node:assert/strict';
import {deploymentCases,verifyDeployment} from '../../scripts/verify-deployment.mjs';

// An entirely unavailable or unprotected site must fail, rather than produce a misleading green report.
test('Deployment verifier rejects server errors, absent auth gates and cacheable API errors',async()=>{
  const unavailable=await verifyDeployment('https://test.invalid',{fetchImpl:async()=>new Response('Unavailable',{status:503}),log(){}});
  assert.equal(unavailable.passed,false);
  assert.ok(unavailable.results.every(result=>!result.passed));
  const publicEverything=await verifyDeployment('https://test.invalid',{fetchImpl:async()=>new Response('<html>Public</html>',{headers:{'Content-Type':'text/html'}}),log(){}});
  assert.equal(publicEverything.passed,false);
  assert.ok(publicEverything.results.find(result=>result.label.startsWith('Staff gate')).passed===false);
  const missingCache=await verifyDeployment('https://test.invalid',{fetchImpl:async(input,init)=>{
    const path=new URL(input).pathname;
    const entry=deploymentCases().find(item=>item.path===path&&(item.method||'GET')===init.method&&(item.origin||'https://test.invalid')===(init.headers.Origin||'https://test.invalid'));
    if(entry.privateJson)return new Response(JSON.stringify({error:'Denied'}),{status:entry.status,headers:{'Content-Type':'application/json'}});
    if(entry.redirect)return new Response(null,{status:307,headers:{Location:entry.redirect}});
    return new Response('<meta name="robots" content="noindex"><input type="password">',{status:entry.status,headers:{'Content-Type':'text/html'}});
  },log(){}});
  assert.equal(missingCache.passed,false);
  assert.ok(missingCache.results.filter(result=>!result.passed).every(result=>result.reason==='error response must not be cached'));
});

test('Deployment verifier rejects redirects to a different host and extra private response fields',async()=>{
  const report=await verifyDeployment('https://test.invalid',{fetchImpl:async(input,init)=>{
    if(init.method==='POST')return new Response(JSON.stringify({error:'Denied',payload:{internal:'leak'}}),{status:init.headers.Origin==='https://bivi-verification.invalid'?403:401,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
    return new Response(null,{status:307,headers:{Location:'https://another.invalid/admin/login'}});
  },log(){}});
  assert.equal(report.passed,false);
  assert.ok(report.results.some(result=>result.reason==='expected same-origin sign-in redirect'));
  assert.ok(report.results.some(result=>result.reason==='expected an error-only response'));
});
