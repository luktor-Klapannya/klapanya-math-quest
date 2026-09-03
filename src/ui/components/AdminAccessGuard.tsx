import React, { useEffect, useMemo, useSyncExternalStore } from 'react';
import { authSession } from '../../auth/session';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { AdminAccessController, type AdminIdentity, type AdminRuntime } from '../../services/admin-console-service';

export const adminRuntime: AdminRuntime = {
  mode: () => authSession.getAdapterMode(), user: () => authSession.getCurrentUser(),
  subscribe: listener => authSession.subscribe(listener),
};
export function AdminAccessGuard({ children, onExit, renderDenied }: {
  children: (identity: AdminIdentity) => React.ReactNode; onExit: () => void; renderDenied?:()=>React.ReactNode;
}) {
  const controller = useMemo(() => new AdminAccessController(getSupabaseClient(), adminRuntime), []);
  const state = useSyncExternalStore(controller.subscribe, controller.snapshot, controller.snapshot);
  const current = useSyncExternalStore(adminRuntime.subscribe, adminRuntime.user, adminRuntime.user);
  useEffect(()=>{void controller.validate();},[controller,current]);
  useEffect(() => controller.start(), [controller]);
  useEffect(() => {
    const check = () => { if (document.visibilityState === 'visible') void controller.validate(); };
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, [controller]);
  if (state.status !== 'allowed' || adminRuntime.mode() !== 'supabase' || current?.id !== state.identity.profileId ||
      current.status !== 'ACTIVE' || current.organizationId !== state.identity.organizationId) {
    if(state.status==='denied'&&renderDenied)return <>{renderDenied()}</>;
    return <main className="min-h-screen bg-slate-100 text-slate-900 p-8">
      <p role={state.status === 'checking' ? 'status' : 'alert'}>{state.status === 'checking' ? 'Verifying Admin access…' : 'Admin access denied. Sign in with an authorized game account.'}</p>
      <button className="mt-4 min-h-[44px] rounded border border-slate-400 px-4 focus-visible:ring-2" onClick={onExit}>Return to landing</button>
    </main>;
  }
  return <>{children(state.identity)}</>;
}
