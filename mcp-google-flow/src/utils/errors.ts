export type FlowErrorCode =
  | 'SESSION_EXPIRED'
  | 'ELEMENT_NOT_FOUND'
  | 'GENERATION_FAILED'
  | 'DOWNLOAD_FAILED'
  | 'TIMEOUT'
  | 'BROWSER_ERROR';

export class FlowError extends Error {
  code: FlowErrorCode;

  constructor(code: FlowErrorCode, message: string) {
    super(message);
    this.name = 'FlowError';
    this.code = code;
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 2,
  delayMs: number = 2000
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (i < retries) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError;
}

export async function withTimeout<T>(
  fn: () => Promise<T>,
  ms: number,
  message: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new FlowError('TIMEOUT', message)), ms)
    ),
  ]);
}

export function formatError(error: unknown): string {
  if (error instanceof FlowError) {
    return `[${error.code}] ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
