type TranslationKey = string;
type LocaleCode = string;
type TranslationMap = Record<TranslationKey, string>;
type MessageFormatter = (message: string, params?: Record<string, any>) => string;

interface LocaleConfig {
  code: LocaleCode;
  name: string;
  translations: TranslationMap;
  formatter?: MessageFormatter;
}

export class I18nManager {
  private locales: Map<LocaleCode, LocaleConfig>;
  private currentLocale: LocaleCode;
  private fallbackLocale: LocaleCode;
  private formatter: MessageFormatter;

  constructor(defaultLocale: LocaleCode, fallbackLocale: LocaleCode = 'en') {
    this.locales = new Map();
    this.currentLocale = defaultLocale;
    this.fallbackLocale = fallbackLocale;
    this.formatter = this.defaultFormatter;
  }

  // 注册语言
  registerLocale(config: LocaleConfig): void {
    this.locales.set(config.code, {
      ...config,
      formatter: config.formatter || this.formatter
    });
  }

  // 切换语言
  setLocale(locale: LocaleCode): void {
    if (this.locales.has(locale)) {
      this.currentLocale = locale;
    }
  }

  // 获取翻译
  translate(key: TranslationKey, params?: Record<string, any>): string {
    const locale = this.locales.get(this.currentLocale);
    const fallback = this.locales.get(this.fallbackLocale);
    
    let message = locale?.translations[key] || fallback?.translations[key] || key;
    
    if (params) {
      message = (locale?.formatter || this.formatter)(message, params);
    }
    
    return message;
  }

  // 获取当前语言
  getCurrentLocale(): LocaleConfig | undefined {
    return this.locales.get(this.currentLocale);
  }

  // 获取所有支持的语言
  getAvailableLocales(): LocaleConfig[] {
    return Array.from(this.locales.values());
  }

  // 设置自定义格式化器
  setFormatter(formatter: MessageFormatter): void {
    this.formatter = formatter;
  }

  private defaultFormatter: MessageFormatter = (message, params) => {
    if (!params) return message;
    
    return message.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }
} 