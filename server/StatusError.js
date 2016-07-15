export default class StatusError extends Error {
  constructor(status, message = `${code}`) {
    super(message);
    this.status = status;
  }

  toJSON() {
    return {
      message: this.message,
      status: this.status,
      stack: this.stack,
    };
  }
}

