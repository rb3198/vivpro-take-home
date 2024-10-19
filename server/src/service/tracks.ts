import { RequestListener, IncomingMessage, ServerResponse } from "http";
import { IController } from "./interfaces/IController.js";
import { StatusCodes } from "http-status-codes";
import { validateGetTracksRequest } from "../service_validations.js";
import { BASE_URL } from "../constants/endpoints.js";
import { TracksBL } from "../business/tracks.js";
import jsonPatch from "fast-json-patch";
import { RequestError } from "../entities/errors/request_error.js";

const getRequestBody = async (req: IncomingMessage) => {
  const body: any[] = [];
  await new Promise<void>((resolve) => {
    req.on("data", (chunk) => body.push(chunk));
    req.on("end", () => resolve());
  });
  return JSON.parse(Buffer.concat(body).toString()) as jsonPatch.Operation[];
};

export class TracksController implements IController {
  TracksBL: TracksBL;
  constructor(TracksBL: TracksBL) {
    this.TracksBL = TracksBL;
  }
  get: RequestListener<typeof IncomingMessage, typeof ServerResponse> = async (
    req,
    res
  ) => {
    const { url: urlString } = req;
    if (!urlString) {
      throw new Error("URL should be populated.");
    }
    const url = new URL(urlString, BASE_URL);
    const { searchParams } = url;
    const title = searchParams.get("title");
    let offset: string | number | null = searchParams.get("offset");
    let limit: string | number | null = searchParams.get("limit");
    const validation = validateGetTracksRequest(title, offset, limit);
    if (!validation.isValid) {
      res.statusCode = StatusCodes.BAD_REQUEST;
      return res.end(
        JSON.stringify({
          data: null,
          error: validation.message,
        })
      );
    }
    offset = parseInt(offset ?? "NaN");
    limit = parseInt(limit ?? "NaN");
    try {
      const rows = await this.TracksBL.get(title, offset, limit);
      res.setHeader("Set-Cookie", "test=1");
      res.write(JSON.stringify(rows));
      res.end();
    } catch (error) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          err: "An Unknown Error occurred. Please try again.",
          data: null,
        })
      );
    }
  };

  post: RequestListener<typeof IncomingMessage, typeof ServerResponse> =
    () => {};
  patch: RequestListener<typeof IncomingMessage, typeof ServerResponse> =
    async (req, res) => {
      const { headers, url: urlString } = req;
      if (!urlString) {
        throw new Error("URL should be populated.");
      }
      const url = new URL(urlString, BASE_URL);
      const { searchParams } = url;
      const id = searchParams.get("id");
      const idx = searchParams.get("idx");
      if (!id || !idx || isNaN(parseInt(idx))) {
        res.statusCode = StatusCodes.BAD_REQUEST;
        return res.end(
          JSON.stringify({
            error:
              "The Update Request must specify the ID and the Idx of the track to be updated in the request URL.",
          })
        );
      }
      if (headers["content-type"] !== "application/json") {
        res.statusCode = StatusCodes.UNSUPPORTED_MEDIA_TYPE;
        return res.end(
          JSON.stringify({
            error: "Request body must be in JSON.",
          })
        );
      }
      try {
        const body = await getRequestBody(req);
        const success = await this.TracksBL.update(id, parseInt(idx), body);
        if (success) {
          res.statusCode = StatusCodes.OK;
          return res.end(
            JSON.stringify({
              data: true,
              error: null,
            })
          );
        } else {
          res.statusCode = StatusCodes.OK;
          return res.end(
            JSON.stringify({
              data: false,
              error: "Could not update the document (Reason Unknown).",
            })
          );
        }
      } catch (error) {
        if (
          error instanceof SyntaxError ||
          error instanceof jsonPatch.JsonPatchError
        ) {
          res.statusCode = StatusCodes.BAD_REQUEST;
          return res.end(
            JSON.stringify({
              error: "Body is not valid JSON Patch spec.",
            })
          );
        }
        if (error instanceof RequestError) {
          res.statusCode = StatusCodes.BAD_REQUEST;
          return res.end(
            JSON.stringify({
              error: error.message,
            })
          );
        }
        res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        return res.end(
          JSON.stringify({
            error: "An unknown error occurred. Please try again later.",
          })
        );
      }
    };
  handle: RequestListener<typeof IncomingMessage, typeof ServerResponse> = (
    req,
    res
  ) => {
    const { method } = req;
    switch (method) {
      case "GET":
        return this.get(req, res);
      case "PATCH":
        return this.patch(req, res);
      default:
        res.statusCode = StatusCodes.NOT_IMPLEMENTED;
        return res.end(
          JSON.stringify({
            error: "Not supported.",
            data: null,
          })
        );
    }
  };
}
