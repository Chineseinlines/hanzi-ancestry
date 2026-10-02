import { useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id'> {
  id: string;
  label: string;
  icon: ReactNode;
  /** 密码框右侧「显示/隐藏」按钮的无障碍标签 */
  revealLabels?: { show: string; hide: string };
}

export function AuthField({ id, label, icon, type = 'text', revealLabels, ...rest }: AuthFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && revealed ? 'text' : type;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium" style={{ color: '#3D3D3B' }}>
        {label}
      </label>
      <div className="group relative">
        <input
          id={id}
          type={inputType}
          className="w-full rounded-2xl border border-[#E4DDCC] bg-white/70 py-2.5 pl-11 pr-11 text-sm text-[#1A1A18] outline-none transition-all placeholder:text-[#A9A294] focus:border-[#C23B2A] focus:bg-white focus:ring-4 focus:ring-[#C23B2A]/10"
          {...rest}
        />
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B4AC9C] transition-colors group-focus-within:text-[#C23B2A]">
          {icon}
        </span>
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? revealLabels?.hide : revealLabels?.show}
            className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#B4AC9C] transition-colors hover:bg-[#F2ECE0] hover:text-[#6B6558]"
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}