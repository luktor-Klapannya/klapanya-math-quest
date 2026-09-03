import React from 'react';
import { GLASS_TOKENS } from '../../tokens/glassTokens';

interface GlassNavButtonProps {
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const GlassNavButton: React.FC<GlassNavButtonProps> = ({
  label,
  href,
  isActive = false,
  onClick,
  className = '',
  children,
}) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`px-4 py-1.5 text-xs font-semibold tracking-wide inline-flex items-center gap-1.5 cursor-pointer ${
        isActive ? GLASS_TOKENS.GLASS_BUTTON_ACTIVE : GLASS_TOKENS.GLASS_BUTTON_DEFAULT
      } ${className}`}
    >
      {children}
      <span>{label}</span>
    </a>
  );
};
