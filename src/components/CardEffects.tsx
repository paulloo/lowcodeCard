import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface Props {
  effect: string;
}

export default function CardEffects({ effect }: Props) {
  const [sparkles] = useState(() => 
    Array.from({ length: 5 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {effect === 'shine' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
        </div>
      )}

      {effect === 'heart' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl text-pink-500/30 animate-float-heart">
            💝
          </span>
        </div>
      )}

      {effect === 'sparkle' && (
        <>
          {sparkles.map((pos, i) => (
            <span
              key={i}
              className="absolute text-yellow-400 animate-sparkle"
              style={{
                top: pos.top,
                left: pos.left,
                animationDelay: pos.delay
              }}
            >
              ✨
            </span>
          ))}
        </>
      )}

      {effect === 'float' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-pink-200/20 via-transparent to-transparent animate-float" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 to-transparent animate-float" style={{ animationDelay: '-1.5s' }} />
        </div>
      )}

      {effect === 'confetti' && (
        <div className="absolute inset-0">
          {/* 左侧彩带 */}
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={`left-${i}`}
              className="absolute w-1.5 h-6 rounded-full animate-confetti-left"
              style={{
                left: `${Math.random() * 30}%`,
                top: `-${20 + Math.random() * 20}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#ff718d', '#ff8fa3', '#ffb3c1'][i % 3],
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
          {/* 右侧彩带 */}
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={`right-${i}`}
              className="absolute w-1.5 h-6 rounded-full animate-confetti-right"
              style={{
                right: `${Math.random() * 30}%`,
                top: `-${20 + Math.random() * 20}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#ff718d', '#ff8fa3', '#ffb3c1'][i % 3],
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
} 