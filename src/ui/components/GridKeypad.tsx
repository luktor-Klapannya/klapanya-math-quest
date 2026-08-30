import React from 'react';
import { Delete, X } from 'lucide-react';

interface GridKeypadProps {
  value: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
}

export const GridKeypad: React.FC<GridKeypadProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handleDigit = (digit: string) => {
    if (disabled || value.length >= 10) return;
    if (digit === '.' && value.includes('.')) return;
    onChange(value + digit);
  };

  const handleBackspace = () => {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    onChange('');
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Number Display Input */}
      <div className="p-4 rounded-2xl bg-arctic-950 border-2 border-cyan-400 text-center mb-4 shadow-inner">
        <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest mb-1">
          คำตอบที่ระบาย (Numerical Answer)
        </div>
        <div className="text-3xl md:text-4xl font-mono font-black text-white min-h-[44px] flex items-center justify-center">
          {value || <span className="text-slate-600">_ _ _ _</span>}
        </div>
      </div>

      {/* On-Screen Mobile Numeric Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => handleDigit(num)}
            className="py-3.5 rounded-xl bg-arctic-800/90 hover:bg-cyan-900/60 border border-slate-700 hover:border-cyan-400 text-white font-mono font-bold text-2xl active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            {num}
          </button>
        ))}

        {/* Bottom row: Decimal, 0, Backspace */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleDigit('.')}
          className="py-3.5 rounded-xl bg-arctic-800 hover:bg-slate-700 border border-slate-700 text-white font-mono font-black text-2xl active:scale-95 transition-all disabled:opacity-50"
        >
          .
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleDigit('0')}
          className="py-3.5 rounded-xl bg-arctic-800/90 hover:bg-cyan-900/60 border border-slate-700 hover:border-cyan-400 text-white font-mono font-bold text-2xl active:scale-95 transition-all shadow-sm disabled:opacity-50"
        >
          0
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={handleBackspace}
          className="py-3.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-600/60 text-rose-300 font-bold flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleClear}
          className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 font-semibold transition-colors py-1 px-2"
        >
          <X className="w-3.5 h-3.5" /> ล้างค่าทั้งหมด
        </button>
      </div>
    </div>
  );
};
