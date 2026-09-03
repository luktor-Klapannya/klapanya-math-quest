import React,{createContext,useContext,useState} from 'react';
export type AdminLanguage='TH'|'EN';
const labels:Record<string,string>={
 'Dashboard':'ภาพรวม','Users':'ผู้ใช้','Library':'คลังเนื้อหา','Game Bank':'คลังเกม','Assessment Engine':'เครื่องมือวิเคราะห์',
 'Refresh':'โหลดใหม่','Logout':'ออกจากระบบ','Overview':'ภาพรวม','Territories':'ดินแดน','Content Mapping':'การเชื่อมโยงเนื้อหา','Versions':'เวอร์ชัน',
 'Game':'เกม','Subject':'วิชา','Type':'ประเภท','Version':'เวอร์ชัน','Status':'สถานะ','Visibility':'การมองเห็น','Updated':'แก้ไขล่าสุด','Action':'การทำงาน',
 'Territory':'ดินแดน','Theme':'ธีม','Subject / content':'วิชา / เนื้อหา','Reference?':'ต้นแบบ?',
 'General':'ทั่วไป','Structure':'โครงสร้าง','Questions':'คำถาม','Visual':'ภาพประกอบ','Preview':'ดูตัวอย่าง','Publish':'เผยแพร่',
 'Open Game #001':'เปิดเกม #001','Open Arctic':'เปิด Arctic','Title':'ชื่อ','Description':'คำอธิบาย','Save':'บันทึก','Saved':'บันทึกแล้ว','Saving…':'กำลังบันทึก…',
 'Current visual':'ภาพปัจจุบัน','Upload / Replace':'อัปโหลด / เปลี่ยนภาพ','Bundled fallback':'ภาพเดิมในเกม','Uploaded':'ภาพที่อัปโหลด','Unsaved preview':'ตัวอย่างที่ยังไม่บันทึก',
 'Reload':'โหลดใหม่','Cancel':'ยกเลิก','Name':'ชื่อ','Search':'ค้นหา','All':'ทั้งหมด','Teachers':'ครู','Students':'นักเรียน','Grade':'ระดับชั้น','Class':'ห้องเรียน',
 'Documents':'เอกสาร','Question Sets':'ชุดคำถาม','Assessments':'แบบทดสอบ','External':'ภายนอก','Analyze':'วิเคราะห์','Compare':'เปรียบเทียบ','Blueprint':'พิมพ์เขียว','Question Builder':'จัดการคำถาม','Export':'ส่งออก',
 'Role':'บทบาท','Student code':'รหัสนักเรียน','Teacher ID':'รหัสครู','Login linkage':'บัญชีเข้าสู่ระบบ','Assigned grades / classes':'ชั้นเรียน / ห้องที่รับผิดชอบ',
 'Edit / access':'แก้ไข / สิทธิ์เข้าใช้','Access status':'สถานะการเข้าใช้','Save name / access status':'บันทึกชื่อ / สถานะ',
 'Import from Existing System':'นำเข้าจากระบบเดิม','Import CSV':'นำเข้า CSV','Source':'แหล่งที่มา','Source taxonomy':'หมวดหมู่ต้นทาง','Common mapping':'การจับคู่หมวดหมู่',
 'Period':'ช่วงเวลา','Active players':'ผู้เล่นที่ใช้งาน','Sessions':'รอบการเล่น','Completed':'เสร็จสิ้น','Players':'ผู้เล่น','Started':'เริ่มแล้ว','Passed':'ผ่าน',
 'Game performance':'ผลการเล่นเกม','Usage trend':'แนวโน้มการใช้งาน','Difficulty':'ความยาก','Group by':'จัดกลุ่มตาม','Stage':'ด่าน','Teacher':'ครู',
 'No matching records.':'ไม่พบรายการ','Loading authorized data…':'กำลังโหลดข้อมูลตามสิทธิ์…','Arctic metadata':'ข้อมูล Arctic',
 'From':'ตั้งแต่','Through':'ถึง','This Month':'เดือนนี้','This Week':'สัปดาห์นี้','Custom':'กำหนดเอง','week':'สัปดาห์','month':'เดือน',
 'Export chart-ready data':'ส่งออกข้อมูลกราฟ','Export game / grade progress CSV':'ส่งออกผลการเล่น / ระดับชั้น CSV','Teacher usage / engagement':'การใช้งานของครู',
 'Add':'เพิ่ม','Edit / review':'แก้ไข / ตรวจทาน','Source Library record':'รายการต้นทางในคลัง','External URL':'ลิงก์ภายนอก','Google Drive source file':'ไฟล์ต้นทาง Google Drive',
 'Attach source / visual (10 MB maximum)':'แนบไฟล์ / ภาพ (ไม่เกิน 10 MB)','Metadata / classifications (JSON)':'ข้อมูล / การจัดหมวดหมู่ (JSON)','Export JSON':'ส่งออก JSON',
 'Review status':'สถานะการตรวจทาน','Visual upload slot':'ช่องภาพสำหรับอัปโหลด','Code / ID':'รหัสประจำตัว','Managed email / login':'อีเมล / บัญชีเข้าสู่ระบบ','Academic year':'ปีการศึกษา',
 'Assigned grades (comma-separated)':'ระดับชั้นที่รับผิดชอบ (คั่นด้วยจุลภาค)','Assigned classes (comma-separated)':'ห้องที่รับผิดชอบ (คั่นด้วยจุลภาค)','External reference (optional)':'รหัสอ้างอิงภายนอก (ไม่บังคับ)',
 'New temporary password':'รหัสผ่านชั่วคราวใหม่','Close':'ปิด','Student':'นักเรียน',
 'Average duration (s)':'เวลาเฉลี่ย (วินาที)','Pass %':'ผ่าน %','Average score %':'คะแนนเฉลี่ย %','Average sessions/player':'รอบเฉลี่ย / ผู้เล่น','Accuracy %':'ความแม่นยำ %','Observed difficulty':'ความยากที่พบ',
 'Students in scope':'นักเรียนในความรับผิดชอบ','Classroom assignments':'ห้องเรียนที่รับผิดชอบ','Recent activity':'กิจกรรมล่าสุด',
 'Math':'คณิตศาสตร์','English':'ภาษาอังกฤษ','Science':'วิทยาศาสตร์','Social':'สังคมศึกษา','Thai':'ภาษาไทย',
 'ACTIVE':'ใช้งาน','DISABLED':'ระงับ','EXPIRED':'หมดอายุ','PRIVATE':'ส่วนตัว','INTERNAL':'ภายใน','PUBLIC':'สาธารณะ','DRAFT':'แบบร่าง','REVIEW':'รอตรวจ','APPROVED':'อนุมัติ','PUBLISHED':'เผยแพร่','ARCHIVED':'เก็บถาวร',
};
const Context=createContext({language:'TH' as AdminLanguage,setLanguage:(_value:AdminLanguage)=>{}});
export function AdminLocale({children}:{children:React.ReactNode}) {const [language,setLanguage]=useState<AdminLanguage>('TH');return <Context.Provider value={{language,setLanguage}}>{children}</Context.Provider>;}
export function useAdminLocale(){const value=useContext(Context);return {...value,t:(label:string)=>value.language==='TH'?(labels[label]||label):label};}
