import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const uri=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const ledgerJs=compile(readFileSync('lib/project-stock.ts','utf8'));
const ledgerUri=uri(ledgerJs);
const {projectPositions,isReturnable,positionNeedsReview,SITE_SCRAP,WAREHOUSE_SCRAP}=await import(ledgerUri);
const movement=(type,qty,remark='',project_id=1,item_id=1)=>({item_id,project_id,movement_type:type,quantity:qty,remark});
const rows=projectPositions([movement('OUT',-10),movement('RETURN','2'),movement('SCRAP',1,SITE_SCRAP+' bent'),movement('SCRAP',4,WAREHOUSE_SCRAP),movement('IN',100),movement('OUT',7,'',2),movement('OUT',50,'',null),movement('OUT',3,'',1,2)]);
assert.equal(rows.length,3);assert.equal(rows[0].balance,7);assert.equal(rows[0].siteScrap,1);assert.equal(rows[1].balance,7);assert.equal(rows[2].balance,3);
assert.equal(positionNeedsReview(rows[0]),false);
const legacy=projectPositions([movement('OUT',5),movement('SCRAP',2,'old scrap')])[0];
assert.equal(legacy.balance,5);assert.equal(legacy.legacyScrap,2);assert.equal(positionNeedsReview(legacy),true);
assert.equal(positionNeedsReview(projectPositions([movement('RETURN',1)])[0]),true);
assert.equal(positionNeedsReview(projectPositions([movement('OUT','bad')])[0]),true);
assert.equal(isReturnable('ASSET'),true);assert.equal(isReturnable(' tool '),true);assert.equal(isReturnable('CONSUMABLE'),false);
// Exercise route guards with a fake database. No live writes or notifications.
async function route(path,history,item={id:1,current_stock:10}){
 const writes=[];
 const db={from(table){const query={select(){return query},order(){return query},range(){return query},eq(){return query},single(){return Promise.resolve({data:item,error:null})},update(data){writes.push({table,update:data});return query},insert(data){writes.push({table,insert:data});return Promise.resolve({error:null})},then(resolve,reject){return Promise.resolve({data:table==='stock_movements'?history:[],error:null}).then(resolve,reject)}};return query}};
 globalThis.__stockTestDb=db;
 let source=readFileSync(path,'utf8').replace(/import \{[^}]*\} from ['"]@\/lib\/project-stock['"];?/,`import {allMovementRows,projectPositions,isReturnable,positionNeedsReview,SITE_SCRAP,WAREHOUSE_SCRAP} from '${ledgerUri}';`).replace(/import \{ NextResponse \} from "next\/server";/,'const NextResponse={json:(data,options)=>({data,status:options?.status??200})};').replace(/import \{ supabase \} from "@\/lib\/supabase";/,'const supabase=globalThis.__stockTestDb;');
 const mod=await import(uri(compile(source))+'#'+Math.random());
 return {call:body=>mod.POST({json:async()=>body}),writes};
}
let r=await route('app/api/stock-scrap/route.ts',[movement('OUT',-3)]);
let result=await r.call({item_id:1,project_id:1,quantity:2,source:'site',remark:'bent'});assert.equal(result.data.success,true);assert.equal(r.writes.length,1);assert.equal(r.writes[0].insert.remark,SITE_SCRAP+' bent');
r=await route('app/api/stock-scrap/route.ts',[movement('OUT',-3)]);result=await r.call({item_id:1,project_id:1,quantity:4,source:'site'});assert.equal(result.status,400);assert.equal(r.writes.length,0);
r=await route('app/api/stock-scrap/route.ts',[movement('OUT',-3)]);result=await r.call({item_id:1,project_id:1,quantity:-1,source:'site'});assert.equal(result.status,400);assert.equal(r.writes.length,0);
r=await route('app/api/stock-return/route.ts',[movement('OUT',-3),movement('RETURN',2)]);result=await r.call({item_id:1,project_id:1,quantity:2});assert.equal(result.status,400);assert.equal(r.writes.length,0);
r=await route('app/api/projects/close/route.ts',[{...movement('OUT',-1),items:{item_type:'ASSET'}}]);result=await r.call({id:1});assert.equal(result.status,409);assert.equal(r.writes.length,0);
r=await route('app/api/projects/close/route.ts',[{...movement('OUT',-1),items:{item_type:'CONSUMABLE'}}]);result=await r.call({id:1});assert.equal(result.data.success,true);
console.log('Project ledger and route guards passed: location isolation, returns, site scrap without double deduction, legacy review, invalid values, consumables and project closure.');

r=await route('app/api/projects/update/route.ts',[{...movement('OUT',-1),items:{item_type:'TOOL'}}]);result=await r.call({id:1,status:'CLOSED'});assert.equal(result.status,409);assert.equal(r.writes.length,0);

const {allMovementRows}=await import(ledgerUri);let calls=[];const q={order(){return q},range(start,end){calls.push([start,end]);return Promise.resolve({data:start===0?Array(500).fill(movement('OUT',1)):[movement('OUT',1)],error:null})}};assert.equal((await allMovementRows(q)).data.length,501);assert.deepEqual(calls,[[0,499],[500,999]]);
