import { useState } from 'react';

interface Props {
  onSelect: (effect: string) => void;
}

const EFFECTS = [
  { id: 'none', name: '无特效', icon: '✨' },
  { id: 'shine', name: '闪耀', icon: '💫' },
  { id: 'heart', name: '爱心', icon: '💝' },
  { id: 'float', name: '漂浮', icon: '🎈' },
  { id: 'sparkle', name: '星光', icon: '⭐' },
  { id: 'confetti', name: '彩带', icon: '🎉' },
];

export default function EffectSelector({ onSelect }: Props) {
  const [selected, setSelected] = useState('none');

  return (
    <div className="flex gap-2">
      {EFFECTS.map(({ id, name, icon }) => (
        <button
          key={id}
          onClick={() => {
            setSelected(id);
            onSelect(id);
          }}
          className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all
            ${selected === id 
              ? 'bg-pink-500 text-white' 
              : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
            }`}
        >
          <span>{icon}</span>
          <span>{name}</span>
        </button>
      ))}
    </div>
  );
} 