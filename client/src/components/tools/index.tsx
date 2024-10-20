import React, { useCallback, useMemo } from "react";
import styles from "./styles.module.scss";
import { BiSearch } from "react-icons/bi";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { Track } from "../../types/track";

export interface ToolProps {
  tracks?: Track[];
}

export const Tools: React.FC<ToolProps> = ({ tracks }) => {
  const Search = useMemo(() => {
    return (
      <div id={styles.search_container}>
        <div id={styles.search_box}>
          <BiSearch />
          <input placeholder="Search for a song by title..." />
        </div>
        <button className={styles.button}>Get Song</button>
      </div>
    );
  }, []);

  const constructAndDownloadCsv = useCallback(() => {
    if (!tracks || !tracks.length) {
      return;
    }
    const rows: string[] = [];
    rows.push(Object.keys(Track.columnNameMap).join(","));
    tracks.forEach((track) => {
      rows.push(
        Object.keys(Track.columnNameMap)
          .map((key) => track[key as keyof Track])
          .join(",")
      );
    });
    const toWrite = rows.join("\n");
    const blob = new Blob([toWrite], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "playlist.csv";
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }, [tracks]);

  const DownloadButton = useMemo(() => {
    return (
      <button
        id={styles.download}
        className={styles.button}
        onClick={constructAndDownloadCsv}
      >
        <FaCloudDownloadAlt />
        Download CSV
      </button>
    );
  }, [constructAndDownloadCsv]);
  return (
    <div id={styles.container}>
      {Search}
      {tracks && tracks.length && DownloadButton}
    </div>
  );
};