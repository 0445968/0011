/**
 * Bivi test fixture seeder. Run locally, never as part of a production build.
 * Requires SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_ equivalents).
 * Prompts interactively for a Bivi staff login; does not store the password.
 * All Supabase reads and writes use a verified, authenticated Bivi staff session.
 * Task insertion is permitted only for existing activated projects associated
 * with these test companies; no project activation gates are bypassed.
 */
import { createClient } from '@supabase/supabase-js';
import { createInterface } from 'node:readline/promises';

if (process.env.CONFIRM_BIVI_TEST_SEED !== 'yes') throw new Error('Set CONFIRM_BIVI_TEST_SEED=yes to explicitly allow writing test records.');
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) throw new Error('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required.');
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!anonKey) throw new Error('SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required for staff sign-in.');
let staffDb;

// Prompts are local. The password is never printed or written to disk.
async function hiddenPrompt(message) {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    throw new Error('Run in an interactive terminal, or set BIVI_SEED_STAFF_PASSWORD in the process environment.');
  }
  process.stdout.write(message);
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    const oldRaw = Boolean(input.isRaw);
    let secret = '';
    const finish = (error) => {
      input.removeListener('data', onData);
      input.setRawMode(oldRaw);
      input.pause();
      process.stdout.write('\n');
      if (error) reject(error);
      else resolve(secret);
    };
    function onData(chunk) {
      for (const c of chunk) {
        if (c === '\n' || c === '\r') { finish(); return; }
        if (c === '\u0003') { finish(new Error('Cancelled.')); return; }
        if (c === '\u007f' || c === '\b') { secret = secret.slice(0, -1); continue; }
        if (c.charCodeAt(0) >= 32) secret += c;
      }
    }
    input.setEncoding('utf8');
    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
  });
}
async function authenticateStaff() {
  let email = process.env.BIVI_SEED_STAFF_EMAIL?.trim() || '';
  if (!email) {
    if (!process.stdin.isTTY) throw new Error('BIVI_SEED_STAFF_EMAIL is required in a non-interactive terminal.');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try { email = (await rl.question('Bivi staff email: ')).trim(); }
    finally { rl.close(); }
  }
  if (!email) throw new Error('Bivi staff email is required.');
  const password = process.env.BIVI_SEED_STAFF_PASSWORD || await hiddenPrompt('Bivi staff password (hidden): ');
  if (!password) throw new Error('Bivi staff password is required.');
  const auth = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }});
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) throw new Error('Bivi staff sign-in failed. Verify the email and password.');
  staffDb = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
  });
  const staff = await staffDb.rpc('is_inquiry_staff');
  if (staff.error) throw new Error(`Staff permission check failed: ${staff.error.message}`);
  if (staff.data !== true) throw new Error('This account does not have Bivi staff access. Use the same account that signs into /admin.');
  console.log('Bivi staff authentication verified.');
}

const dataset = [
 { name:'[TEST] Solara Wellness Studio',legal:'Solara Wellness Studio LLC',status:'prospect',site:'https://solara.example.com',industry:'health-wellness',subindustry:'health-wellness.spas',founded:2022,employees:14,city:'Austin',region:'TX',postal:'78701',people:[['Maya Ellis','maya.ellis@solara.example.com','Founder & CEO','ceo'],['Jordan Vale','jordan.vale@solara.example.com','Operations Director','executive'],['Camila Park','camila.park@solara.example.com','Marketing Lead','employee']], tasks:[['Prepare client discovery agenda','todo',-2],['Send onboarding questionnaire','doing',2],['Audit current visual identity','todo',4],['Interview target customers','todo',7],['Map customer journey','blocked',9],['Develop positioning directions','todo',12],['Present initial concepts','todo',15],['Confirm brand approval','todo',22]] },
 { name:'[TEST] Northline Architecture',legal:'Northline Architecture Inc.',status:'active',site:'https://northline.example.com',industry:'property-construction',subindustry:'property-construction.architecture',founded:2011,employees:42,city:'Chicago',region:'IL',postal:'60601',people:[['Adrian Cole','adrian.cole@northline.example.com','Managing Principal','ceo'],['Sofia Bennett','sofia.bennett@northline.example.com','Marketing Director','executive'],['Elliot Rivera','elliot.rivera@northline.example.com','Senior Designer','employee']],tasks:[['Review brand guidelines','done',-20],['Approve sitemap','done',-14],['Deliver homepage wireframes','doing',-3],['Review homepage feedback','blocked',2],['Write team bios','todo',4],['Prepare project photography','doing',6],['Build service landing pages','todo',9],['Test responsive layouts','todo',13],['Complete accessibility QA','todo',17],['Launch redesigned website','todo',24]] },
 { name:'[TEST] Goodfolk Beverages',legal:'Goodfolk Beverages LLC',status:'prospect',site:'https://goodfolk.example.com',industry:'food-beverage',subindustry:'food-beverage.beverage-production',founded:2024,employees:9,city:'Denver',region:'CO',postal:'80202',people:[['Alex Morgan','alex.morgan@goodfolk.example.com','Co-Founder','ceo'],['Riley Chen','riley.chen@goodfolk.example.com','Brand Manager','executive'],['Taylor Brooks','taylor.brooks@goodfolk.example.com','Sales Lead','employee']],tasks:[['Document project requirements','done',-12],['Prepare project proposal','done',-7],['Review commercial scope','doing',-1],['Confirm stakeholder approval','blocked',3],['Schedule kickoff meeting','todo',5],['Research competitor packaging','todo',8],['Present creative moodboards','todo',12],['Plan retail launch assets','todo',19]] }
];
const dateShift = offset => { const d = new Date(); d.setUTCDate(d.getUTCDate()+offset); return d.toISOString().slice(0,10); };
async function rpc(name, args) { const result = await staffDb.rpc(name,args); if (result.error) throw new Error(`${name}: ${result.error.message}`); if(result.data?.result && !['saved','assigned'].includes(result.data.result))throw new Error(`${name}: ${JSON.stringify(result.data)}`);return result.data; }
function personBody(p, companyId, first) {const [name,email,job,role]=p;return {name,email,phone:'',company_name:'',labels:['client'],notes:'[TEST] Fictional Bivi workflow fixture. No messages should be sent to this address.',company_id:companyId,referral_contact_id:null,referral_company_id:null,channels:{emails:[{email,kind:'work',is_primary:true}],phones:[]},job_title:job,company_role:role,status:'active',lead_source:'import',source_reference:'bivi-test-seed-v1',project_roles:[]};}
async function findCompany(name){const {data,error}=await staffDb.from('company_directory').select('id,revision').eq('name',name).limit(1);if(error)throw error;return data?.[0]||null;}
async function findPerson(email){const {data,error}=await staffDb.from('people_directory').select('id,revision').eq('email_search',email).limit(1);if(error)throw new Error(`People lookup unavailable: ${error.message}`);return data?.[0]||null;}
async function projectFor(companyId){const {data,error}=await staffDb.from('staff_project_assignment_directory').select('*').eq('company_id',companyId).limit(5);if(error){console.warn(`Project lookup unavailable: ${error.message}`);return null;}return data?.find(r=>r.request_id)||null;}
async function seed(){await authenticateStaff();let companyCount=0,personCount=0,taskCount=0;for(const fixture of dataset){
 const found=await findCompany(fixture.name);
 const body={status:fixture.status,website:fixture.site,address:{city:fixture.city,region:fixture.region,postal_code:fixture.postal,country:'US'},industry_id:fixture.industry,subindustry_id:fixture.subindustry,legal_name:fixture.legal,organization_type:'Private company',founding_year:fixture.founded,employee_count:fixture.employees};
 const saved=await rpc('save_company_profile',{p_id:found?.id||null,p_revision:found?.revision||0,p_name:fixture.name,p_body:body});
 const companyId=saved.id||found?.id;if(!companyId)throw new Error(`Company ID missing for ${fixture.name}`);companyCount++;
 for(const p of fixture.people){if(await findPerson(p[1]))continue;await rpc('save_people_profile',{p_id:null,p_revision:0,p_body:personBody(p,companyId)});personCount++;}
 const project=await projectFor(companyId);
 if(!project){console.log(`${fixture.name}:  ${fixture.tasks.length} tasks planned; no linked project was found. See tasks JSON export.`);continue;}
 const requestId=project.request_id;
 const read=await staffDb.from('inquiry_projects').select('revision,body').eq('request_id',requestId).maybeSingle();if(read.error||!read.data)throw new Error(`Unable to load project ${requestId}`);
 const current=read.data; const existing=current.body?.tasks||[];
 const additions=fixture.tasks.filter(([title])=>!existing.some(t=>t.id===`bivi-seed-${fixture.name.replace(/[^a-z]/gi,'').toLowerCase()}-${fixture.tasks.findIndex(x=>x[0]===title)}`)).map(([title,status,days],index)=>({id:`bivi-seed-${fixture.name.replace(/[^a-z]/gi,'').toLowerCase()}-${fixture.tasks.findIndex(x=>x[0]===title)}`,title,owner:'Bivi',dueOn:dateShift(days),status,milestoneId:null,notes:'[TEST] Fictional workflow seed task.'}));
 if(!additions.length)continue;
 const next={...current.body,tasks:[...existing,...additions]};
 await rpc('manage_inquiry_project',{p_request_id:requestId,p_command:{action:'save',expectedRevision:current.revision,body:next}});taskCount+=additions.length;
 console.log(`${fixture.name}: ${additions.length} task(s) added to project ${requestId}`);
 }console.log(`Finished. Companies processed: ${companyCount}; new people: ${personCount}; tasks added to existing activated projects: ${taskCount}.`);}
seed().catch(e=>{console.error(e.message);process.exitCode=1;});
