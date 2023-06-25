export class BadRequestError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
