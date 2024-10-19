import * as http from "http";
import * as argparse from "argparse";
import { connectToDatabase, setupTables, TracksDAL } from "./dal/index.js";
import { StatusCodes } from "http-status-codes";
import { TracksController } from "./service/tracks.js";
import { TRACKS_ENDPOINT } from "./constants/endpoints.js";
import { TracksBL } from "./business/index.js";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const { ArgumentParser } = argparse;

const parser = new ArgumentParser({
  description:
    "The backend server for the viv-tracks app. Serves data describing the tracks (songs).",
  add_help: true,
});

parser.add_argument("-f", "--file", {
  help: "The path of the file containing the formatted tracks data relative to the cwd.",
  required: true,
});
const { file } = parser.parse_args();
const db = await connectToDatabase();
await setupTables(db);
const tracksDal = new TracksDAL(db);
const tracksBl = new TracksBL(tracksDal);
await tracksBl.writeTracksFromFileToDb(
  resolve(dirname(fileURLToPath(import.meta.url)), file)
);
const tracksController = new TracksController(tracksBl);

const server = http.createServer(async (req, res) => {
  const { url: urlString } = req;
  res.setHeader("Content-Type", "application/json");
  if (!urlString) {
    res.statusCode = StatusCodes.BAD_REQUEST;
    return res.end(
      JSON.stringify({
        data: null,
        error: "Bad Request. Non-existent endpoint.",
      })
    );
  }
  const url = new URL(urlString, "http://localhost");
  const { pathname } = url;
  switch (pathname) {
    case TRACKS_ENDPOINT:
      tracksController.handle(req, res);
      break;
    case "/api/tracks":
      res.writeHead(StatusCodes.MOVED_PERMANENTLY, {
        Location: "http://localhost:3000" + TRACKS_ENDPOINT,
      });
      return res.end();
    default:
      res.statusCode = StatusCodes.NOT_FOUND;
      return res.end(
        JSON.stringify({
          err: "Bad Request: This endpoint does not exist.",
          data: null,
        })
      );
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.info("Server running on port", PORT);
});
