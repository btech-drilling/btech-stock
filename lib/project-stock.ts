// A site scrap has already left the warehouse through OUT. Never deduct it twice.
export const SITE_SCRAP = '[BTECH_SITE_SCRAP]';
export const WAREHOUSE_SCRAP = '[BTECH_WAREHOUSE_SCRAP]';
export type Movement = {item_id: number|string; project_id?: number|string|null; movement_type:string; quantity:number|string; remark?:string|null};
export type Position = {itemId:string;projectId:string;out:number;returned:number;siteScrap:number;legacyScrap:number;balance:number;invalid:boolean};
export function projectPositions(movements:Movement[]):Position[] {
 const rows = new Map<string,Position>();
 for(const m of movements){
  if(m.project_id==null || !['OUT','RETURN','SCRAP'].includes(m.movement_type))continue;
  const key=JSON.stringify([String(m.item_id),String(m.project_id)]);
  const row=rows.get(key)??{itemId:String(m.item_id),projectId:String(m.project_id),out:0,returned:0,siteScrap:0,legacyScrap:0,balance:0,invalid:false};
  const qty=Math.abs(Number(m.quantity));
  if(!Number.isFinite(qty)){row.invalid=true;rows.set(key,row);continue;}
  if(m.movement_type==='OUT')row.out+=qty;
  if(m.movement_type==='RETURN')row.returned+=qty;
  if(m.movement_type==='SCRAP'){
   if(m.remark?.startsWith(SITE_SCRAP))row.siteScrap+=qty;
   else if(!m.remark?.startsWith(WAREHOUSE_SCRAP))row.legacyScrap+=qty;
  }
  row.balance=row.out-row.returned-row.siteScrap;
  rows.set(key,row);
 }
 return [...rows.values()];
}
export function isReturnable(type:string){return ['ASSET','TOOL'].includes(type?.trim().toUpperCase());}
export function positionNeedsReview(row:Position){return row.invalid || row.balance<0 || row.legacyScrap>0;}
export function visibleRemark(remark?:string|null){return remark?.replace(/^\[BTECH_(?:SITE|WAREHOUSE)_SCRAP\]\s*/, '')??'';}

// Supabase limits each response; load the full ledger before deciding a balance.
export async function allMovementRows(query:any):Promise<{data:any[];error:any}>{
 const rows:any[]=[];
 for(let offset=0;;offset+=500){
  const {data,error}=await query.order('id',{ascending:true}).range(offset,offset+499);
  if(error)return {data:[],error};
  rows.push(...(data??[]));
  if(!data||data.length<500)return {data:rows,error:null};
 }
}
