import { TracksDAL } from "../dal/tracks.js";
import { Track } from "../entities/track.js";
import jsonPatch from "fast-json-patch";
import { RequestError } from "../entities/errors/request_error.js";
import fs from "fs";
import { StartupError } from "../entities/errors/startup_error.js";

const { applyPatch, validate } = jsonPatch;

export class TracksBL {
  tracksDal: TracksDAL;
  constructor(tracksDal: TracksDAL) {
    this.tracksDal = tracksDal;
  }

  /**
   * Validates whether the file has all the expected keys. Also validates that each of the key has equal-length array values.
   * @param data
   * @returns
   */
  private validateFileData(data?: any) {
    if (!data) {
      return false;
    }
    const requiredKeys = [
      "id",
      "title",
      "danceability",
      "energy",
      "key",
      "loudness",
      "mode",
      "acousticness",
      "instrumentalness",
      "liveness",
      "valence",
      "tempo",
      "duration_ms",
      "time_signature",
      "num_bars",
      "num_sections",
      "num_segments",
      "class",
    ];
    const idLength = data["id"] && Object.keys(data["id"]).length;
    return requiredKeys.every(
      (key) =>
        key in data &&
        Object.keys(data[key]).length === idLength &&
        Object.keys(data[key]).every((key) => !isNaN(parseInt(key)))
    );
  }
  private readFile(filePath: string) {
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
      throw new StartupError("The specified file does not exist.");
    }
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, {}, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data.toString()));
        }
      });
    });
  }

  async writeTracksFromFileToDb(filePath: string) {
    const data = (await this.readFile(filePath)) as Object;
    if (!this.validateFileData(data)) {
      throw new StartupError("Invalid File data format.");
    }
    const tracks: Track[] = [];
    Object.keys(data["id"]).forEach((idx) => {
      const id = data["id"][idx];
      const title = data["title"][idx];
      const danceability = data["danceability"][idx];
      const energy = data["energy"][idx];
      const key = data["key"][idx];
      const loudness = data["loudness"][idx];
      const mode = data["mode"][idx];
      const acousticness = data["acousticness"][idx];
      const instrumentalness = data["instrumentalness"][idx];
      const liveness = data["liveness"][idx];
      const valence = data["valence"][idx];
      const tempo = data["tempo"][idx];
      const duration = data["duration_ms"][idx];
      const timeSignature = data["time_signature"][idx];
      const numBars = data["num_bars"][idx];
      const numSections = data["num_sections"][idx];
      const numSegments = data["num_segments"][idx];
      const trackClass = data["class"][idx];
      tracks.push(
        new Track({
          idx: parseInt(idx),
          id,
          title,
          danceability,
          energy,
          key,
          loudness,
          mode,
          acousticness,
          instrumentalness,
          liveness,
          valence,
          tempo,
          duration,
          timeSignature,
          numBars,
          numSections,
          numSegments,
          class: trackClass,
          rating: -1,
        })
      );
    });
    return await this.tracksDal.insert(tracks);
  }
  async get(title?: string | null, offset?: number, limit?: number) {
    const tracks: Track[] = await this.tracksDal.get({ title, offset, limit });
    return tracks;
  }

  async update(id: string, idx: number, ops: jsonPatch.Operation[]) {
    const track = await this.tracksDal.getById(idx, id);
    if (!track) {
      throw new RequestError("Track to be updated does not exist");
    }
    const validationError = validate<Track>(ops, track);
    if (validationError) throw validationError;
    applyPatch(track, ops);
    await this.tracksDal.update(track);
    return true;
  }
}
