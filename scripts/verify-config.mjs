import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {loadEnvConfig}=require('@next/env');
loadEnvConfig(process.cwd(),false,{info(){},error(){}});
const args=process.argv.slice(2);
if(args.some(arg=>arg!=='--local')){console.error('Usage: npm run verify:config [-- --local]');process.exit(1);}
const local=args.includes('--local');
let failures=0;
function check(label,ok){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failures++;}
function validOrigin(value){try{const url=new URL(value);return !url.username&&!url.password&&!url.search&&!url.hash&&url.pathname==='/'&&(url.protocol==='https:'||(local&&url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)));}catch{return false;}}
const url=process.env.SUPABASE_URL;
const anon=process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
check('Supabase URL is a valid HTTPS origin (or explicit local test origin)',validOrigin(url));
check('A project public key is configured',Boolean(anon?.trim()));
check('Server-only inquiry service key is configured',Boolean(service?.trim()));
check('Public and privileged keys are different',Boolean(anon&&service&&anon!==service));
check('Canonical application origin is configured and valid',validOrigin(process.env.INQUIRY_APP_URL));
function isPrivilegedKey(value){if(value.startsWith('sb_secret_'))return true;try{return value.startsWith('eyJ')&&JSON.parse(Buffer.from(value.split('.')[1],'base64url').toString()).role==='service_role';}catch{return false;}}
const publicSecrets=Object.entries(process.env).some(([name,value])=>name.startsWith('NEXT_PUBLIC_')&&value&&(name.includes('SERVICE_ROLE')||name==='NEXT_PUBLIC_SUPABASE_SECRET_KEY'||isPrivilegedKey(value)||(service&&value===service)));
check('No privileged Supabase key is exposed through NEXT_PUBLIC_ configuration',!publicSecrets);
for(const [name,key,expected] of [['Public key',anon,'anon'],['Inquiry key',service,'service_role']]){
 if(key?.startsWith('eyJ')){try{const claims=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString());check(`${name} JWT has the expected role`,claims.role===expected);if(typeof claims.exp==='number')check(`${name} JWT has not expired`,claims.exp*1000>Date.now());}catch{check(`${name} JWT can be decoded`,false);}}
}
console.log(`Configuration checks: ${failures===0?'passed':`${failures} failed`}. Values and credentials were not printed. Database access and live workflows still require verification.`);
process.exitCode=failures?1:0;
