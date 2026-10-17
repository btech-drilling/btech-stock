export type StockLevel = {
  item_type?: string | null;
  current_stock?: number | string | null;
  minimum_stock?: number | string | null;
};

// Assets may be deployed to a project. An empty warehouse balance is not a
// purchasing signal. Zero/blank minimum means replenishment alerts are disabled.
export function isLowStock(item: StockLevel): boolean {
  const current = Number(item.current_stock ?? 0);
  const minimum = Number(item.minimum_stock ?? 0);
  return (
    String(item.item_type ?? 'CONSUMABLE').trim().toUpperCase() !== 'ASSET' &&
    Number.isFinite(current) && Number.isFinite(minimum) &&
    minimum > 0 && current <= minimum
  );
}

export function replenishmentMessage(item: StockLevel & { unit?: string | null }): string {
  const shortage = Math.max(Number(item.minimum_stock ?? 0) - Number(item.current_stock ?? 0), 0);
  return shortage > 0
    ? `ควรสั่งเพิ่มอย่างน้อย: ${shortage} ${item.unit ?? ''}`.trim()
    : 'ถึงขั้นต่ำแล้ว ควรวางแผนสั่งซื้อ';
}
