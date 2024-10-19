import http from "http";

export interface IController {
  get: http.RequestListener<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  >;
  post?: http.RequestListener<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  >;
  patch: http.RequestListener<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  >;
  handle: http.RequestListener<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  >;
}
