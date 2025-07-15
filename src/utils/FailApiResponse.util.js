export default class FailApiResponse {
  constructor({ message = 'Something went wrong', errors = null } = {}) {
    this.success = false;
    this.message = message;
    if (errors !== null) this.errors = errors;
  }
}
