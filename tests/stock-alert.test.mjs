import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync('lib/stock-alert.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {isLowStock,replenishmentMessage}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const cases=[
 [{item_type:'ASSET',current_stock:0,minimum_stock:0},false],
 [{item_type:'ASSET',current_stock:0,minimum_stock:3},false],
 [{item_type:' asset ',current_stock:0,minimum_stock:1},false],
 [{item_type:'TOOL',current_stock:0,minimum_stock:0},false],
 [{item_type:'CONSUMABLE',current_stock:1,minimum_stock:1},true],
 [{item_type:'CONSUMABLE',current_stock:0,minimum_stock:1},true],
 [{item_type:'TOOL',current_stock:2,minimum_stock:1},false],
 [{current_stock:'0',minimum_stock:'1'},true],
 [{current_stock:0,minimum_stock:null},false],
 [{current_stock:'bad',minimum_stock:1},false],
 [{current_stock:0,minimum_stock:'bad'},false],
];
for(const [item,expected] of cases)assert.equal(isLowStock(item),expected,JSON.stringify(item));
assert.equal(replenishmentMessage({current_stock:0,minimum_stock:1,unit:'bag'}),'ควรสั่งเพิ่มอย่างน้อย: 1 bag');
assert.equal(replenishmentMessage({current_stock:1,minimum_stock:1,unit:'pcs'}),'ถึงขั้นต่ำแล้ว ควรวางแผนสั่งซื้อ');
console.log('Stock alerts: deployed assets excluded, zero/blank minimum disabled, exact/below minimum retained, invalid numbers ignored and no zero-order message: passed');
