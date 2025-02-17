export class ErrorHandler {
  static handle(error: Error, context: string) {
    console.error(`[${context}]`, error);
    
    // 错误分类处理
    if (error instanceof ValidationError) {
      // 处理验证错误
    } else if (error instanceof NetworkError) {
      // 处理网络错误
    }
    
    // 错误上报
    this.reportError(error, context);
  }

  private static reportError(error: Error, context: string) {
    // 实现错误上报逻辑
  }
} 