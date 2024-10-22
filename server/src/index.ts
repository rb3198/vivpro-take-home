import * as http from "http";
import * as argparse from "argparse";
import { connectToDatabase, setupTables, TracksDAL } from "./dal/index.js";
import { StatusCodes } from "http-status-codes";
import { TracksController } from "./service/tracks.js";
import { TRACKS_ENDPOINT } from "./constants/endpoints.js";
import { TracksBL } from "./business/index.js";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { CLIENT_PORT } from "./constants/ports.js";

const { ArgumentParser } = argparse;

const PORT = process.env.PORT || 3000;

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
  const { url: urlString, method } = req;
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Access-Control-Allow-Origin",
    `http://localhost:${CLIENT_PORT}`
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (method === "OPTIONS") {
    res.statusCode = StatusCodes.NO_CONTENT;
    res.end();
    return;
  }
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
        Location: "http://localhost:" + PORT + TRACKS_ENDPOINT,
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

server.listen(PORT, () => {
  console.info("Server running on port", PORT);
});
