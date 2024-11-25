import sqlite3 from "sqlite3";
import { dirname, resolve as pathResolve } from "path";
import { fileURLToPath } from "url";

export { TracksDAL } from "./tracks.js";
export const connectToDatabase = (): Promise<sqlite3.Database> => {
  return new Promise((resolve, reject) => {
    // Declare db outside of the callback
    const pathToDb = pathResolve(
      dirname(fileURLToPath(import.meta.url)),
      "tracks.db"
    );
    const db = new sqlite3.Database(pathToDb, (err) => {
      if (err) {
        reject(err); // Reject the promise with the error
      } else {
        resolve(db); // Resolve with the db object
      }
    });
  });
};

export const setupTables = (db: sqlite3.Database): Promise<void> => {
  const sql = `
          CREATE TABLE IF NOT EXISTS tracks
          (
            idx INTEGER,
            id VARCHAR,
            title VARCHAR,
            rating INTEGER DEFAULT -1,
            danceability REAL,
            energy REAL,
            key INTEGER,
            loudness REAL,
            mode INTEGER,
            acousticness REAL,
            instrumentalness REAL,
            liveness REAL,
            valence REAL,
            tempo REAL,
            duration_ms INTEGER,
            time_signature INTEGER,
            num_bars INTEGER,
            num_sections INTEGER,
            num_segments INTEGER,
            class INTEGER,
            PRIMARY KEY (idx, id)
          )
      `;
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
