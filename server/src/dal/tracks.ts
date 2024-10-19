import sqlite3 from "sqlite3";
import { Track } from "../entities/track.js";
import { TrackQueryArgs } from "../entities/types/track_query_args.js";

export class TracksDAL {
  db: sqlite3.Database;
  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  async get(args: TrackQueryArgs) {
    const { title, offset, limit } = args;
    let sql = `SELECT
            idx,
            id,
            title,
            rating,
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
            duration_ms AS duration,
            time_signature AS timeSignature,
            num_bars AS numBars,
            num_sections AS numSections,
            num_segments AS numSegments,
            class
        FROM tracks
        WHERE 1 = 1`;
    const params: (string | number)[] = [];
    if (title) {
      sql += ` AND title = ?`;
      params.push(title);
    }
    if (typeof offset === "number" && !isNaN(offset)) {
      sql += ` AND idx >= ?`;
      params.push(offset);
    }
    if (typeof limit === "number" && !isNaN(limit)) {
      sql += ` LIMIT ?`;
      params.push(limit);
    }
    sql += ";";
    return new Promise<Track[]>((resolve, reject) => {
      this.db.all<Track>(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getById(idx: number, id: string) {
    let sql = `
    SELECT
        idx,
        id,
        title,
        rating,
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
        duration_ms AS duration,
        time_signature AS timeSignature,
        num_bars AS numBars,
        num_sections AS numSections,
        num_segments AS numSegments,
        class
    FROM tracks
    WHERE id = ? AND idx = ?`;
    const params = [id, idx];
    return new Promise<Track | undefined>((resolve, reject) => {
      this.db.get<Track>(sql, params, (err, track) => {
        if (err) {
          reject(err);
        } else {
          resolve(track);
        }
      });
    });
  }

  async update(track: Track) {
    const {
      idx,
      id,
      title,
      rating,
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
    } = track;
    const sql = `UPDATE tracks SET 
        title = ?,
        rating = ?,
        danceability = ?,
        energy = ?,
        key = ?,
        loudness = ?,
        mode = ?,
        acousticness = ?,
        instrumentalness = ?,
        liveness = ?,
        valence = ?,
        tempo = ?,
        duration_ms = ?,
        time_signature = ?,
        num_bars = ?,
        num_sections = ?,
        num_segments = ?,
        class = ?
        WHERE id = ? AND idx = ?
    `;
    const params = [
      title,
      rating,
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
      trackClass,
      id,
      idx,
    ];
    return new Promise<void>((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  insert(tracks: Track[]) {
    const rows = tracks.map((track) => [
      track.idx,
      track.id,
      track.title,
      track.danceability,
      track.energy,
      track.key,
      track.loudness,
      track.mode,
      track.acousticness,
      track.instrumentalness,
      track.liveness,
      track.valence,
      track.tempo,
      track.duration,
      track.timeSignature,
      track.numBars,
      track.numSections,
      track.numSegments,
      track.class,
    ]);
    const placeholders = rows
      .map((row) => `(${row.map(() => "?").join(", ")})`)
      .join(", ");
    const sql = `
    INSERT OR IGNORE INTO tracks (idx,
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
        duration_ms,
        time_signature,
        num_bars,
        num_sections,
        num_segments,
        class
      ) VALUES
        ${placeholders}
    `;
    const values = rows.flat();
    return new Promise<void>((resolve, reject) => {
      this.db.run(sql, values, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
