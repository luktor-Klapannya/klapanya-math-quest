export interface DriveConfig {rootFolderId?:string;clientId?:string;clientSecret?:string;refreshToken?:string}
export interface DriveUpload {id:string;name:string;mimeType:string;bytes:Uint8Array;operationId:string;sha256:string}
const mimeTypes=['application/pdf','text/plain','text/csv','image/png','image/jpeg','image/webp','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export function validateUpload(name:string,mime:string,size:number){if(!name||name.length>200||/[\r\n\x00]/.test(name)||!mimeTypes.includes(mime)||size<1||size>10485760)throw new Error('File must be PDF, DOCX, TXT, CSV, PNG, JPEG or WEBP, 1 byte–10 MB.');}
export function driveLibrary(config:DriveConfig,fetcher:typeof fetch=fetch){
 async function token(){
  if(!config.rootFolderId)throw new Error('WAITING_FOR_DRIVE_FOLDER_ID');
  if(!/^[a-zA-Z0-9_-]+$/.test(config.rootFolderId)||!config.clientId||!config.clientSecret||!config.refreshToken)throw new Error('Drive server credentials are not configured.');
  const response=await fetcher('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({grant_type:'refresh_token',client_id:config.clientId,client_secret:config.clientSecret,refresh_token:config.refreshToken}),signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error('Drive authorization failed.');const data=await response.json();if(!data.access_token)throw new Error('Drive authorization failed.');return data.access_token as string;
 }
 async function api(path:string,access:string,init:RequestInit={}){const result=await fetcher('https://www.googleapis.com/drive/v3/'+path,{...init,headers:{...init.headers,Authorization:`Bearer ${access}`},signal:AbortSignal.timeout(30000)});return result;}
 async function root(access:string){const r=await api(`files/${config.rootFolderId}?fields=id,mimeType,trashed,capabilities(canAddChildren),permissions(type,role)&supportsAllDrives=true`,access);const d=await r.json();if(!r.ok||d.trashed||d.mimeType!=='application/vnd.google-apps.folder'||d.capabilities?.canAddChildren!==true)throw new Error('Configured Drive root is unavailable or not writable.');if(!d.permissions?.length||d.permissions.some((p:any)=>p.type!=='user'||p.role!=='owner'))throw new Error('Drive root must be private to its owner for this pilot. Shared roots require separate permission review.');}
 return {
  async generateId(){const access=await token();await root(access);const r=await api('files/generateIds?count=1&space=drive&type=files',access);const d=await r.json();if(!r.ok||!d.ids?.[0])throw new Error('Drive ID allocation failed.');return d.ids[0] as string;},
  async upload(file:DriveUpload){validateUpload(file.name,file.mimeType,file.bytes.length);const access=await token();await root(access);
   const inspect=async()=>{const r=await api(`files/${file.id}?fields=id,name,mimeType,parents,trashed,size,appProperties&supportsAllDrives=true`,access);if(r.status===404)return null;if(!r.ok)throw new Error('Cannot verify Drive upload. Retry the same operation.');const d=await r.json();if(d.trashed||!d.parents?.includes(config.rootFolderId)||d.appProperties?.operationId!==file.operationId||d.appProperties?.sha256!==file.sha256||Number(d.size)!==file.bytes.length||d.mimeType!==file.mimeType)throw new Error('Drive retry reference conflict.');return d;};
   let result=await inspect();if(!result){const boundary='klapanya_'+crypto.randomUUID();const metadata={id:file.id,name:file.name,mimeType:file.mimeType,parents:[config.rootFolderId],appProperties:{operationId:file.operationId,sha256:file.sha256}};
    const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${file.mimeType}\r\n\r\n`,file.bytes as BlobPart,`\r\n--${boundary}--`]);
    const r=await fetcher('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',{method:'POST',headers:{Authorization:`Bearer ${access}`,'Content-Type':`multipart/related; boundary=${boundary}`},body,signal:AbortSignal.timeout(60000)});
    if(!r.ok&&r.status!==409)throw new Error('Drive upload failed or uncertain. Retry the same operation ID.');result=await inspect();if(!result)throw new Error('Drive file not yet confirmed. Retry the same operation ID.');
   }
   return {google_drive_file_id:file.id,google_drive_folder_id:config.rootFolderId,original_filename:file.name,mime_type:file.mimeType};
  }
 };
}
