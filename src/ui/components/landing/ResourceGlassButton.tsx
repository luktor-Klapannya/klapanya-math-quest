import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { GLASS_TOKENS } from '../../tokens/glassTokens';

interface ResourceGlassButtonProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconColor?: string;
  onClick: () => void;
}

export const ResourceGlassButton: React.FC<ResourceGlassButtonProps> = ({
  icon: Icon,
  title,
  subtitle,
  iconColor = 'text-cyan-300',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer select-none rounded-2xl p-3.5 flex items-start gap-3 transition-all duration-300 ${GLASS_TOKENS.GLASS_BUTTON_MUTED}`}
    >
      <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 ${iconColor} group-hover:scale-110 transition-transform`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 space-y-0.5 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-bold text-xs text-white group-hover:text-amber-200 transition-colors truncate">
            {title}
          </h4>
          <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </div>
        <p className="text-[10px] text-slate-400 leading-snug line-clamp-1">{subtitle}</p>
      </div>
    </div>
  );
};
