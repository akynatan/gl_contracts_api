export class DefaultError extends Error {
  public code: number;

  constructor(message, code = 400) {
    super(message);
    this.name = 'DefaultError';
    this.code = code;
  }
}
