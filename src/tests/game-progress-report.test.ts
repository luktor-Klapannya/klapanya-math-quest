import {classroomProgress,studentProgress,loadGameProgress} from '../services/game-progress-report';
import type {ProgressData} from '../services/game-progress-report';
async function run(){
 let passed=0;const check=(v:unknown,label:string)=>{if(!v)throw new Error(label);passed++;console.log(`PASS: ${label}`);};
 const data:ProgressData={profiles:[{id:'A',display_name:'A'},{id:'B',display_name:'B'}],enrollments:[{classroom_id:'C',learner_profile_id:'A',status:'ACTIVE'},{classroom_id:'C',learner_profile_id:'A',status:'ACTIVE'},{classroom_id:'C',learner_profile_id:'B',status:'ACTIVE'}],checkpoints:[],sessions:[{id:'s1',profile_id:'A',status:'SUBMITTED',submitted_at:'2026-09-01',evidence:{reportedResult:{accuracy:100}}}],results:[],verified:[]};
 check(classroomProgress(data,'C').count===2,'Roster counts unique enrolled students');
 check(classroomProgress(data,'C').started===1,'Started counts recorded players only');
 check(classroomProgress(data,'C').completed===0,'Submitted round is not a verified completion');
 check(classroomProgress(data,'C').averageAccuracy===null,'Reported accuracy never enters verified average');
 data.sessions.push({id:'s2',profile_id:'A',status:'VERIFIED',submitted_at:'2026-09-02'});data.results.push({session_id:'s2',result:{accuracy:80}});
 check(classroomProgress(data,'C').averageAccuracy===80,'Verified accuracy uses persisted result');
 check(studentProgress(data,'A').latest?.id==='s2','Latest session ordered by submission time');
 check(studentProgress(data,'B').sessions.length===0,'Detail does not mix player sessions');
 check(classroomProgress(data,'OTHER').count===0,'Unknown classroom has no fabricated roster');
 data.runs=[{id:'runB',profile_id:'B',stage_id:'D1',status:'STARTED',last_played_at:'2026-09-03'}];
 check(studentProgress(data,'B').started&&!studentProgress(data,'B').inProgress,'Started run is distinct from an attempted run');
 data.runs[0].status='IN_PROGRESS';
 check(studentProgress(data,'B').inProgress&&!studentProgress(data,'B').completed,'In-progress run has no verified completion');
 data.results[0].result.accuracy=999;
 check(classroomProgress(data,'C').averageAccuracy===null,'Malformed accuracy excluded from summary');
 let rejected=false;try{await loadGameProgress(null as never,'A',()=> 'B');}catch{rejected=true;}
 check(rejected,'Account change rejects report before any request');
 console.log(`Progress reports: ${passed} passed`);
}
void run();
