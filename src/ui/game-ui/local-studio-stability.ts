export const LOCAL_STUDIO_PREFERENCE_KEY='klapanya.local-studio.preferences';
export function parseStudioPreferences<T extends object>(raw:string|null):Partial<T>{if(!raw)return {};try{const value=JSON.parse(raw);return value&&typeof value==='object'&&!Array.isArray(value)?value as Partial<T>:{}}catch{return {}}}
export function resolveStudioSelection<T extends {screenKey:string}>(items:readonly T[],screenKey:string|undefined){if(!screenKey)return {item:null,unavailable:''};const item=items.find(entry=>entry.screenKey===screenKey)||null;return {item,unavailable:item?'':screenKey}}
