import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';
import { GLASS_TOKENS } from '../../tokens/glassTokens';

export type SelectedRole = 'LEARNER' | 'PROFESSOR';

interface RoleSelectorProps {
  selectedRole: SelectedRole;
  onSelectRole: (role: SelectedRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
}) => {
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <span className="text-xs font-serif tracking-widest text-slate-300 uppercase">
        Who are you?
      </span>

      <div className="inline-flex items-center gap-2 p-1 rounded-full bg-slate-950/40 backdrop-blur-xl border border-cyan-100/15 shadow-glass-crystal">
        
        {/* Professor / Teacher Option */}
        <button
          onClick={() => onSelectRole('PROFESSOR')}
          className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
            selectedRole === 'PROFESSOR'
              ? GLASS_TOKENS.ROLE_PILL_PROFESSOR_ACTIVE
              : GLASS_TOKENS.ROLE_PILL_INACTIVE
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
          <span>Professor (ครูผู้สอน)</span>
        </button>

        {/* Learner / Student Option */}
        <button
          onClick={() => onSelectRole('LEARNER')}
          className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
            selectedRole === 'LEARNER'
              ? GLASS_TOKENS.ROLE_PILL_LEARNER_ACTIVE
              : GLASS_TOKENS.ROLE_PILL_INACTIVE
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Learner (นักเรียน)</span>
        </button>
      </div>
    </div>
  );
};
