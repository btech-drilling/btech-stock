'use client';
import {usePathname} from 'next/navigation';
import Sidebar from './Sidebar';
import StockIcon from './components/StockIcon';
const titles:Record<string,string>={'/':'ภาพรวมคลังสินค้า','/stock-locations':'คลัง / ของที่ไซต์','/stock-in':'รับเข้าคลัง','/stock-out':'เบิกไปโครงการ','/stock-return':'คืนเข้าคลัง','/stock-scrap':'ตัดชำรุด / สูญเสีย','/stock-adjust':'ปรับยอดคลัง','/projects':'โครงการ','/add-project':'เพิ่มโครงการ','/add-item':'เพิ่มรายการ','/movements':'ประวัติรับ–จ่าย','/project-usage':'สรุปการใช้ตามโครงการ','/low-stock':'รายการถึงขั้นต่ำ'};
export default function Workspace({children}:{children:React.ReactNode}){
 const path=usePathname();if(path==='/login')return <>{children}</>;
 const title=titles[path]||(path.startsWith('/items/')?'รายละเอียดสินค้า':path.startsWith('/edit-item/')?'แก้ไขสินค้า':path.includes('project')?'รายละเอียดโครงการ':'คลังและอุปกรณ์');
 return <div className="stock-shell"><Sidebar/><div className="stock-body"><header className="stock-topbar"><div><span>BTECH</span><span className="stock-crumb">/</span>{title}</div><span className="stock-workspace"><i/>STOCK WORKSPACE</span></header><main className="stock-main"><div className="stock-content"><div className="stock-section-marker"><StockIcon name={path.includes('project')?'project':path.includes('return')?'return':path.includes('scrap')?'scrap':path.includes('low-stock')?'alert':'box'} tone={path.includes('low-stock')?'amber':path.includes('scrap')?'rose':'teal'}/><span>{title}</span></div>{children}</div><footer className="stock-footer">BTECH · INVENTORY & EQUIPMENT</footer></main></div></div>
}
