/**
 * Custom Error indicating an issue with the request made by a client.
 */
export class RequestError extends Error {
  constructor(message?: string) {
    super(message);
  }
}
