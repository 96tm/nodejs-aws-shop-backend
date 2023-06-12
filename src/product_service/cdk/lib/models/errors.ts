export class BadRequestError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
