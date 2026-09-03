export type AnalyticsRow=Record<string,any>;
export function aggregateRuns(runs:AnalyticsRow[],sessions:AnalyticsRow[],results:AnalyticsRow[]) {
 const sessionMap=new Map(sessions.map(s=>[s.id,s]));const resultMap=new Map(results.map(r=>[r.session_id,r.result]));
 const verified=runs.filter(r=>sessionMap.get(r.id)?.status==='VERIFIED').map(r=>resultMap.get(r.id)).filter(Boolean);
 const numbers=(key:string)=>verified.map(r=>r[key]).filter(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&(key!=='accuracy'||v<=100));
 const avg=(values:number[])=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
 const passes=verified.filter(r=>typeof r.isPassed==='boolean');
 return {players:new Set(runs.map(r=>r.profile_id)).size,started:runs.length,completed:runs.filter(r=>r.status==='COMPLETED').length,verified:verified.length,passed:passes.filter(r=>r.isPassed).length,passPercent:passes.length?passes.filter(r=>r.isPassed).length/passes.length*100:null,accuracy:avg(numbers('accuracy')),averageDuration:avg(numbers('totalTimeSec')),averageAttempts:runs.length?runs.length/new Set(runs.map(r=>r.profile_id)).size:null};
}
export function usageTrend(runs:AnalyticsRow[],sessions:AnalyticsRow[],results:AnalyticsRow[],bucket:'week'|'month') {
 const groups=new Map<string,AnalyticsRow[]>();for(const run of runs){const d=new Date(run.started_at);if(!Number.isFinite(d.getTime()))continue;if(bucket==='month')d.setUTCDate(1);else d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);const key=d.toISOString().slice(0,10);groups.set(key,[...(groups.get(key)||[]),run]);}
 return [...groups].sort(([a],[b])=>a.localeCompare(b)).map(([period,rows])=>({period,...aggregateRuns(rows,sessions,results)}));
}
