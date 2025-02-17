import type { TemplateEffect } from '../../types/template';

export class TemplateEffectManager {
  private static instance: TemplateEffectManager;
  private effects: Map<string, TemplateEffect>;

  private constructor() {
    this.effects = new Map();
    this.initializeEffects();
  }

  public static getInstance(): TemplateEffectManager {
    if (!TemplateEffectManager.instance) {
      TemplateEffectManager.instance = new TemplateEffectManager();
    }
    return TemplateEffectManager.instance;
  }

  private initializeEffects() {
    const defaultEffects: TemplateEffect[] = [
      {
        id: 'shine',
        name: '闪耀',
        css: `
          @keyframes shine {
            0% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.1) rotate(5deg); }
            50% { transform: scale(1) rotate(0deg); }
            75% { transform: scale(1.1) rotate(-5deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          .shine .photo {
            animation: shine 3s infinite;
          }
        `
      },
      {
        id: 'float',
        name: '漂浮',
        css: `
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .float .photo {
            animation: float 3s ease-in-out infinite;
          }
        `
      },
      {
        id: 'pulse',
        name: '脉动',
        css: `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .pulse .photo {
            animation: pulse 2s ease-in-out infinite;
          }
        `
      },
      {
        id: 'glitch',
        name: '故障',
        css: `
          @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-5px, 5px); }
            40% { transform: translate(-5px, -5px); }
            60% { transform: translate(5px, 5px); }
            80% { transform: translate(5px, -5px); }
            100% { transform: translate(0); }
          }
          .glitch .photo {
            animation: glitch 0.5s infinite;
          }
        `
      }
    ];

    defaultEffects.forEach(effect => {
      this.effects.set(effect.id, effect);
    });
  }

  public getEffect(id: string): TemplateEffect | undefined {
    return this.effects.get(id);
  }

  public getAllEffects(): TemplateEffect[] {
    return Array.from(this.effects.values());
  }

  public addEffect(effect: TemplateEffect): void {
    this.effects.set(effect.id, effect);
  }

  public removeEffect(id: string): boolean {
    return this.effects.delete(id);
  }

  public generateEffectStyles(effectIds: string[]): string {
    return effectIds
      .map(id => this.effects.get(id)?.css || '')
      .filter(Boolean)
      .join('\n');
  }
} 