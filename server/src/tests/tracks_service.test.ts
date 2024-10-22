import { describe, it, expect, vi, beforeEach, Mocked } from "vitest";
import { IncomingMessage, ServerResponse } from "http";
import * as Service from "../service/tracks.js";
import { TracksBL } from "../business/tracks.js";
import { StatusCodes } from "http-status-codes";
import { RequestError } from "../entities/errors/request_error.js";

describe("Tests for TracksController", () => {
  let controller: Service.TracksController;
  //   @ts-ignore
  let tracksBl: Mocked<TracksBL> = {};
  let req: Partial<IncomingMessage>;
  let res: Partial<ServerResponse>;

  beforeEach(() => {
    controller = new Service.TracksController(tracksBl);

    req = {
      url: "",
      method: "",
      headers: {},
      on: vi.fn((event, callback) => {
        if (event === "data") callback(1);
        if (event === "end") callback();
        return req as IncomingMessage;
      }),
    };

    res = {
      statusCode: 0,
      setHeader: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
    };
  });

  describe("Tests for GET Request", () => {
    it("should return tracks for a valid request", async () => {
      req.url = "/api/tracks?title=test&offset=0&limit=10";
      tracksBl.get = vi.fn().mockResolvedValue([{ id: "1", title: "test" }]);

      await controller.get(req as IncomingMessage, res as ServerResponse);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.write).toHaveBeenCalledWith(
        JSON.stringify([{ id: "1", title: "test" }])
      );
      expect(res.end).toHaveBeenCalled();
    });

    it("should return 400 for invalid query parameters", async () => {
      req.url = "/api/tracks?title=test&offset=abc&limit=xyz";

      await controller.get(req as IncomingMessage, res as ServerResponse);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({
          data: null,
          error: `\`start\` must be a valid integer`,
        })
      );
    });

    it("should return 500 if TracksBL.get throws an error", async () => {
      req.url = "/tracks?title=test&offset=0&limit=10";
      tracksBl.get = vi.fn().mockRejectedValue(new Error("DB Error"));

      await controller.get(req as IncomingMessage, res as ServerResponse);

      expect(res.statusCode).toBe(500);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({
          err: "An Unknown Error occurred. Please try again.",
          data: null,
        })
      );
    });
  });

  describe("Tests for PATCH Request", () => {
    it("should update a track and return 200 for valid input", async () => {
      req.url = "/tracks?id=123&idx=0";
      req.headers = {};
      req.headers["content-type"] = "application/json";
      const getRequestBodySpy = vi.spyOn(controller, "getRequestBody");
      getRequestBodySpy.mockReturnValueOnce(
        new Promise((resolve) =>
          resolve([{ op: "replace", path: "/title", value: "New Title" }])
        )
      );
      tracksBl.update = vi.fn().mockResolvedValue(true);

      await controller.patch(req as IncomingMessage, res as ServerResponse);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({
          data: true,
          error: null,
        })
      );
    });

    it("should return 400 if ID or IDX is missing", async () => {
      req.url = "/tracks?id=123";
      await controller.patch(req as IncomingMessage, res as ServerResponse);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({
          error:
            "The Update Request must specify the ID and the Idx of the track to be updated in the request URL.",
        })
      );
    });

    it("should return 500 if TracksBL.update throws an error", async () => {
      req.url = "/tracks?id=123&idx=0";
      req.headers = {};
      req.headers["content-type"] = "application/json";
      const onSpy = vi.spyOn(req, "on");
      //   @ts-ignore
      onSpy.mockImplementation((event, callback) => {
        if (event === "data")
          callback(
            JSON.stringify([
              { op: "replace", path: "/title", value: "New Title" },
            ])
          );
        if (event === "end") callback();
      });
      tracksBl.update = vi.fn().mockRejectedValue(new Error("DB Error"));

      await controller.patch(req as IncomingMessage, res as ServerResponse);

      expect(res.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({
          error: "An unknown error occurred. Please try again later.",
        })
      );
    });
  });

  describe("Tests for handle Method", () => {
    it("should call the correct method based on request method", async () => {
      req.method = "GET";
      const getSpy = vi
        .spyOn(controller, "get")
        .mockImplementation(() => Promise.resolve());

      await controller.handle(req as IncomingMessage, res as ServerResponse);

      expect(getSpy).toHaveBeenCalled();
    });

    it("should return 501 for unsupported methods", async () => {
      req.method = "DELETE";

      await controller.handle(req as IncomingMessage, res as ServerResponse);

      expect(res.statusCode).toBe(StatusCodes.NOT_IMPLEMENTED);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({
          error: "Not supported.",
          data: null,
        })
      );
    });
  });
});
