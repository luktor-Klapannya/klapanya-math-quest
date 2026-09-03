// Navigation only. AdminAccessGuard remains the authorization boundary.
export function entryScreen(pathname:string):'LANDING'|'ADMIN_CONSOLE' {
 return /^\/admin\/?$/.test(pathname)?'ADMIN_CONSOLE':'LANDING';
}
