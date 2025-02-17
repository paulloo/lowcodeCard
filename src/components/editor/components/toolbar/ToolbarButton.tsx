import { type ReactNode } from 'react';

interface ToolbarButtonProps {
  icon: ReactNode;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function ToolbarButton({ 
  icon, 
  label, 
  onClick, 
  disabled 
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-1.5 rounded hover:bg-gray-100 
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={label}
    >
      <div className="w-5 h-5 text-gray-600">
        {icon}
      </div>
    </button>
  );
} 