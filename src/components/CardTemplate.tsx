import type { CSSProperties } from 'react';
import CardEffects from './CardEffects';

import styles from '../styles/CardTemplate.module.css';

interface Props {
  images: {
    self?: string;
    partner?: string;
    background?: string;
  };
  message: string;
  templateId: string;
  effect?: string;
}

const templates = {
  template1: {
    container: "bg-gradient-to-br from-pink-100 via-rose-100 to-red-100 p-8 aspect-[4/5]",
    imageContainer: "grid grid-cols-2 gap-6 mb-8",
    imageWrapper: "relative aspect-square rounded-2xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:rotate-2",
    image: "w-full h-full object-cover object-center",
    messageWrapper: "bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50",
    message: "text-gray-800 text-lg font-medium leading-relaxed text-center",
    overlay: "absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"
  },
  
  template2: {
    container: "bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 p-8 aspect-[4/5]",
    imageContainer: "flex justify-center items-center gap-4 mb-8 relative",
    imageWrapper: "w-1/2 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl transform hover:rotate-3 transition-all duration-300 relative hover:z-10",
    image: "w-full h-full object-cover object-center preserve-aspect",
    messageWrapper: "bg-white/90 backdrop-blur rounded-2xl p-8 shadow-lg border border-white/50",
    message: "text-gray-700 text-lg font-serif italic leading-relaxed text-center",
    overlay: "absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30",
    extraStyles: {
      secondImage: {
        transform: 'rotate(-3deg)',
        hover: {
          transform: 'rotate(0deg)'
        }
      } as CSSProperties
    }
  },
  
  template3: {
    container: "bg-cover bg-center p-8 aspect-[4/5]",
    containerStyle: { 
      backgroundImage: 'url("/patterns/pattern-bg.png")',
      backgroundColor: 'rgba(255,192,203,0.1)'
    } as CSSProperties,
    imageContainer: "grid grid-cols-2 gap-8 mb-8",
    imageWrapper: "relative aspect-square rounded-full overflow-hidden shadow-2xl border-4 border-white/80 transform hover:scale-105 transition-all duration-300",
    image: "w-full h-full object-cover object-center preserve-aspect",
    messageWrapper: "bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50",
    message: "text-gray-800 text-xl font-medium leading-relaxed text-center",
    overlay: "absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20"
  },
  
  template4: {
    container: "bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 p-10 aspect-[4/5]",
    imageContainer: "relative flex justify-center items-center mb-12",
    imageWrapper: "relative w-2/5 aspect-square rounded-full overflow-hidden shadow-2xl border-4 border-white transform transition-all duration-300 hover:scale-105 hover:rotate-6",
    image: "w-full h-full object-cover object-center preserve-aspect",
    messageWrapper: "relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50",
    message: "text-gray-800 text-lg font-medium leading-relaxed text-center",
    overlay: "absolute inset-0 bg-gradient-to-t from-black/30 to-transparent",
    extraStyles: {
      secondImage: {
        position: 'absolute',
        left: '55%',
        top: '50%',
        transform: 'translateY(-50%) rotate(-6deg)',
        zIndex: 10,
        transition: 'all 0.3s ease',
        ':hover': {
          transform: 'translateY(-50%) rotate(0deg) scale(1.05)'
        }
      } as CSSProperties
    }
  },
  
  template5: {
    container: "bg-cover bg-center p-8 aspect-[4/5] relative",
    containerStyle: { 
      backgroundImage: 'url("/patterns/hearts-bg.png")',
      backgroundColor: 'rgba(255,182,193,0.15)'
    } as CSSProperties,
    imageContainer: "flex items-center justify-center gap-8 mb-8 relative",
    imageWrapper: "relative w-[40%] aspect-square overflow-hidden shadow-xl transform transition-all duration-300",
    imageWrapperStyles: {
      clipPath: `path('M50,15 A25,25,0,0,1,75,40 A25,25,25,0,1,50,85 A25,25,25,0,1,25,40 A25,25,25,0,1,50,15 Z')`,
      WebkitClipPath: `path('M50,15 A25,25,0,0,1,75,40 A25,25,25,0,1,50,85 A25,25,25,0,1,25,40 A25,25,25,0,1,50,15 Z')`,
      position: 'relative'
    } as CSSProperties,
    image: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover",
    messageWrapper: "bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-md mx-auto border border-pink-100 relative z-10",
    message: "text-gray-800 text-lg font-medium leading-relaxed text-center",
    overlay: "absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20",
    decorations: {
      hearts: [
        { top: '5%', left: '10%', size: 'text-2xl', color: 'text-pink-400/50', animation: 'animate-float' },
        { top: '15%', right: '15%', size: 'text-3xl', color: 'text-pink-300/40', animation: 'animate-float-delay' },
        { bottom: '10%', left: '20%', size: 'text-xl', color: 'text-rose-400/30', animation: 'animate-float-delay-2' },
        { bottom: '20%', right: '10%', size: 'text-2xl', color: 'text-red-300/40', animation: 'animate-float' },
        { top: '40%', left: '5%', size: 'text-lg', color: 'text-pink-500/30', animation: 'animate-float-delay' }
      ],
      background: {
        before: {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(255,192,203,0.2) 0%, transparent 70%)',
          zIndex: 0
        } as CSSProperties,
        after: {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'url("/patterns/hearts-overlay.png")',
          opacity: 0.1,
          zIndex: 1
        } as CSSProperties
      }
    }
  }
};

const effects = {
  shine: "animate-shine",
  heart: "animate-float-heart",
  float: "animate-float",
  sparkle: "animate-sparkle",
};

export default function CardTemplate({ images, message, templateId, effect = 'none' }: Props) {
  const style = templates[templateId as keyof typeof templates] || templates.template1;
  
  return (
    <div 
      className={`${style.container} relative overflow-hidden`}
      style={{
        ...style.containerStyle,
        ...(images.background && {
          backgroundImage: `url(${images.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        })
      }}
    >
      {/* 背景装饰 */}
      {templateId === 'template5' && (
        <>
          <div style={style.decorations?.background.before} />
          <div style={style.decorations?.background.after} />
        </>
      )}

      {/* 装饰元素 */}
      {templateId === 'template5' && style.decorations?.hearts.map((heart, index) => (
        <span
          key={index}
          className={`absolute ${heart.size} ${heart.color} ${heart.animation}`}
          style={{ top: heart.top, left: heart.left, right: heart.right, bottom: heart.bottom }}
        >
          💝
        </span>
      ))}

      {/* 特效层 */}
      {effect !== 'none' && <CardEffects effect={effect} />}
      
      <div className={style.imageContainer}>
        {/* 自己的照片 */}
        <div 
          className={style.imageWrapper}
          style={templateId === 'template5' ? {
            ...style.imageWrapperStyles,
            transform: 'rotate(-5deg)'
          } : undefined}
        >
          {images.self ? (
            <div className="relative w-full h-full">
              <img 
                src={images.self} 
                alt="我的照片" 
                className={style.image}
                loading="eager"
                decoding="async"
              />
              <div className={style.overlay} />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">等待上传...</span>
            </div>
          )}
        </div>
        
        {/* 对方的照片 */}
        <div 
          className={style.imageWrapper}
          style={templateId === 'template5' ? {
            ...style.imageWrapperStyles,
            transform: 'rotate(5deg) scale(1)'
          } : templateId === 'template4' ? style.extraStyles?.secondImage : undefined}
        >
          {images.partner ? (
            <>
              <img src={images.partner} alt="对方的照片" className={style.image} />
              <div className={style.overlay} />
            </>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">等待上传...</span>
            </div>
          )}
        </div>
      </div>

      <div className={style.messageWrapper}>
        <p className={style.message}>{message || '写下你的祝福...'}</p>
      </div>
    </div>
  );
} 