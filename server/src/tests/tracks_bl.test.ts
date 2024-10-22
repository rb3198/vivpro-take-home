import {
  describe,
  it,
  beforeEach,
  expect,
  afterEach,
  vi as jest,
  Mocked,
} from "vitest";

import fs, { existsSync } from "fs";

// Mock external dependencies
jest.mock("fs", () => ({
  existsSync: jest.fn((path: string) => {
    console.log("Mocked called");
    return path !== "someFile.json";
  }),
  readFile: jest.fn(),
}));
import jsonPatch, { Operation } from "fast-json-patch";
import { TracksBL } from "../business/index.js";
import { TracksDAL } from "../dal/index.js";
import { Track } from "../entities/track.js";
import { RequestError } from "../entities/errors/request_error.js";
import { StartupError } from "../entities/errors/startup_error.js";

const mockedTrack = new Track({
  id: "1",
  acousticness: 1,
  class: 1,
  danceability: 10,
  duration: 300000,
  energy: 0.5,
  idx: 0,
  instrumentalness: 0.1,
  key: 1,
  title: "21 Guns",
  liveness: 0.25,
  loudness: 0.5,
  mode: 1,
  numBars: 100,
  numSections: 5,
  numSegments: 600,
  rating: -1,
  tempo: 105,
  timeSignature: 3,
  valence: 1,
});

const invalidFileCases = [
  {
    id: { "0": "5vYA1mW9g2Coh1HUFUSmlb" },
    title: { "0": "3AM", "1": "4 Walls" },
    danceability: { "0": 0.521 },
    energy: { "0": 0.673, "1": 0.849 },
    key: { "0": 8 },
    loudness: { "0": -8.685, "1": -4.308 },
    mode: { "0": 1 },
    acousticness: { "0": 0.00573 },
    instrumentalness: {},
    liveness: { "0": 0.12 },
    valence: { "0": 0.543 },
    tempo: { "0": 108.031 },
    duration_ms: { "0": 225947 },
    time_signature: {},
  },
  {
    id: { "0": "5vYA1mW9g2Coh1HUFUSmlb", "1": "2klCjJcucgGQysgH170npL" },
    title: { "0": "3AM" },
    danceability: {},
    energy: {},
    key: {},
    loudness: {},
    mode: {},
    acousticness: {},
    instrumentalness: {},
    liveness: {},
    valence: {},
    tempo: {},
    duration_ms: {},
  },
  {
    id: {},
    title: {},
    danceability: {},
    energy: {},
    key: {},
    loudness: {},
    mode: {},
    acousticness: {},
    instrumentalness: {},
    liveness: {},
    valence: {},
    tempo: {},
    duration_ms: {},
    // Expected to have at least one key for each property
  },
];
const validFile = {
  id: { "0": "1" },
  acousticness: { "0": 1 },
  class: { "0": 1 },
  danceability: { "0": 10 },
  duration_ms: { "0": 300000 },
  energy: { "0": 0.5 },
  instrumentalness: { "0": 0.1 },
  key: { "0": 1 },
  title: { "0": "21 Guns" },
  liveness: { "0": 0.25 },
  loudness: { "0": 0.5 },
  mode: { "0": 1 },
  num_bars: { "0": 100 },
  num_sections: { "0": 5 },
  num_segments: { "0": 600 },
  tempo: { "0": 105 },
  time_signature: { "0": 3 },
  valence: { "0": 1 },
};

describe("TracksBL", () => {
  let tracksDalMock: Mocked<TracksDAL>;
  let tracksBl: TracksBL;

  beforeEach(() => {
    tracksDalMock = {
      insert: jest.fn(),
      get: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
    } as unknown as Mocked<TracksDAL>;

    tracksBl = new TracksBL(tracksDalMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Tests for writeTracksFromFileToDb", () => {
    it("should throw a StartupError if file does not exist", async () => {
      const spy = jest.spyOn(fs, "existsSync");
      spy.mockImplementationOnce((path: string) => {
        return path !== "someFile.json";
      });
      try {
        await tracksBl.writeTracksFromFileToDb("someFile.json");
        throw new Error("Test failed");
      } catch (error) {
        expect(error).toBeInstanceOf(StartupError);
        expect(spy).toHaveBeenCalledOnce();
        expect(spy).toHaveBeenCalledWith("someFile.json");
      }
    });

    it.each(invalidFileCases)(
      "should throw StartupError if file data is invalid",
      async (invalidFile) => {
        const readFileSpy = jest.spyOn(tracksBl, "readFile");
        readFileSpy.mockImplementationOnce((path: string) => {
          return new Promise((resolve, reject) =>
            resolve(path === "someFile.json" ? invalidFile : validFile)
          );
        });
        try {
          await tracksBl.writeTracksFromFileToDb("someFile.json");
          throw new Error("Test Failed");
        } catch (error) {
          expect(error).toBeInstanceOf(StartupError);
          expect(error.message).toBe("Invalid File data format.");
          expect(readFileSpy).toHaveBeenCalledOnce();
          expect(readFileSpy).toHaveBeenCalledWith("someFile.json");
        }
      }
    );

    it.each([true, false])(
      "should call insert on tracksDal with valid tracks and return what DB returns",
      async (mockedDbReturnVal) => {
        const readFileSpy = jest.spyOn(tracksBl, "readFile");
        readFileSpy.mockImplementationOnce((path: string) => {
          return new Promise((resolve, reject) =>
            resolve(path === "someFile.json" ? validFile : {})
          );
        });
        tracksDalMock.insert.mockImplementation(
          () =>
            new Promise((resolve, reject) => {
              // @ts-ignore
              resolve(mockedDbReturnVal);
            })
        );
        const res = await tracksBl.writeTracksFromFileToDb("someFile.json");
        expect(res).toBe(mockedDbReturnVal);
        expect(tracksDalMock.insert).toHaveBeenCalledWith([mockedTrack]);
      }
    );
  });

  describe("get", () => {
    it("should call get on tracksDal with correct arguments", async () => {
      tracksDalMock.get.mockResolvedValue([mockedTrack]);

      const result = await tracksBl.get("21 Guns", 0, 10);

      expect(tracksDalMock.get).toHaveBeenCalledWith({
        title: "21 Guns",
        offset: 0,
        limit: 10,
      });
      expect(result).toEqual([mockedTrack]);
    });
  });

  describe("update", () => {
    it("should throw RequestError if track is not found", async () => {
      tracksDalMock.getById.mockResolvedValue(undefined);
      await expect(tracksBl.update("1", 0, [])).rejects.toThrow(RequestError);
      expect(tracksDalMock.getById).toHaveBeenCalledWith(0, "1");
    });

    it("should apply patch and update the track", async () => {
      tracksDalMock.getById.mockResolvedValue(mockedTrack);
      const ops: Operation[] = [
        { op: "replace", path: "/title", value: "Gravity" },
      ];
      await tracksBl.update("1", 0, ops);

      expect(tracksDalMock.update).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Gravity" })
      );
    });
  });
});
