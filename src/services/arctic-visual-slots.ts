// Presentation only. These keys never select questions or change game rules.
export const ARCTIC_VISUAL_SLOTS = [
  {id:'worldMap',en:'World Map',th:'แผนที่โลก',asset:'ARCTIC_MAP'},
  {id:'dojo',en:'Training Dojo / Ice Gym',th:'โดโจฝึกฝน / ยิมน้ำแข็ง',asset:'ARCTIC_DOJO'},
  {id:'farming',en:'Farming Shrine / Treasure Cave',th:'ศาลาฟาร์ม / ถ้ำสมบัติ',asset:'ARCTIC_FARMING'},
  {id:'onet',en:'O-NET Gateway / Math Ice Lab',th:'ประตู O-NET / ห้องทดลองคณิตน้ำแข็ง',asset:'ARCTIC_ONET'},
  {id:'geometry',en:'Geometry Special',th:'เรขาคณิตพิเศษ',asset:'ARCTIC_GEOMETRY'},
  {id:'quest',en:'Quest Board / Quest Hall',th:'กระดานภารกิจ / หอภารกิจ',asset:'ARCTIC_QUEST'},
  {id:'citadel1',en:'Citadel 1',th:'ปราสาท 1',asset:'ARCTIC_BOSS_DRAGON'},
  {id:'citadel2',en:'Citadel 2',th:'ปราสาท 2',asset:'ARCTIC_BOSS_GOLEM'},
  {id:'citadel3',en:'Citadel 3',th:'ปราสาท 3',asset:'ARCTIC_BOSS_ARCHMAGE'},
  {id:'final',en:'Final Dark Angel Arena',th:'ลานประลองเทวทูตมืด',asset:'ARCTIC_FINAL'},
  {id:'victory',en:'Purification / Victory Scene',th:'ฉากชำระล้าง / ชัยชนะ',asset:'ARCTIC_RESULT'},
  {id:'market',en:'Market Skin',th:'ภาพตลาด',asset:'ARCTIC_MAP'},
] as const;
export type ArcticSlot = typeof ARCTIC_VISUAL_SLOTS[number]['id'];
export type ArcticVisuals = Partial<Record<ArcticSlot,string>>;
export function validVisualPath(path:unknown,organizationId:string):path is string {
  return typeof path==='string' && path.startsWith(organizationId+'/') &&
    /^[0-9a-f-]+\.(png|jpg|webp)$/.test(path.slice(organizationId.length+1));
}
export function cleanVisuals(value:unknown,organizationId:string):ArcticVisuals {
  const result:ArcticVisuals={};
  if(value && typeof value==='object') for(const {id} of ARCTIC_VISUAL_SLOTS) {
    const path=(value as Record<string,unknown>)[id];
    if(validVisualPath(path,organizationId)) result[id]=path;
  }
  return result;
}
