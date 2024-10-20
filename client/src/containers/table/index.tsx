import React, { useMemo, useState } from "react";
import { Track } from "../../types/track";
import styles from "./styles.module.scss";
import Loader from "../../components/loader";
import { Tools } from "../../components/tools";

export interface TableProps {
  tracks?: Track[];
  loadingTracks?: boolean;
  errorLoadingTracks?: boolean;
}

export const Table: React.FC<TableProps> = ({
  tracks,
  loadingTracks,
  errorLoadingTracks,
}) => {
  const [activePage, setActivePage] = useState(0);

  const pages = useMemo(() => {
    if (!tracks || !tracks.length) {
      return [];
    }
    const nPages = Math.ceil(tracks.length / 10);
    const arr: Track[][] = [];
    let curArr: Track[] = [];
    for (let i = 0; i < tracks.length; i++) {
      curArr.push(tracks[i]);
      if (i !== 0 && (i + 1) % nPages === 0) {
        arr.push(curArr);
        curArr = [];
        continue;
      }
    }
    curArr.length && arr.push(curArr);
    return arr;
  }, [tracks]);
  const renderTable = () => {
    const { columnNameMap } = Track;
    const stickyIndices = new Set([1]);
    if (!pages || !pages.length) return;
    const tracks = pages[activePage];
    return (
      <table id={styles.track_table}>
        <thead>
          <tr>
            {Object.keys(columnNameMap).map((key, idx) => (
              <th
                key={key}
                className={(stickyIndices.has(idx) && styles.hor_fixed) || ""}
              >
                {columnNameMap[key as keyof Track]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tracks.map((track) => {
            const { id } = track;
            return (
              <tr key={id}>
                {Object.keys(columnNameMap).map((key, idx) => {
                  return (
                    <td
                      key={key}
                      data-title={key === "title"}
                      className={
                        (stickyIndices.has(idx) && styles.hor_fixed) || ""
                      }
                    >
                      {track[key as keyof Track]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderPageOpts = () => {
    return (
      <div id={styles.page_opts}>
        <p id={styles.page_opts_label}>Page:</p>
        {pages.map((_, idx) => (
          <div onClick={() => setActivePage(idx)} className={styles.page_no}>
            {idx + 1}
          </div>
        ))}
      </div>
    );
  };

  const renderBody = () => {
    return (
      <>
        <Tools tracks={tracks} />
        {pages && pages.length && (
          <>
            {renderTable()}
            {renderPageOpts()}
          </>
        )}
      </>
    );
  };
  return (
    <div id={styles.container} data-loading={loadingTracks}>
      {loadingTracks && <Loader />}
      {!loadingTracks && renderBody()}
    </div>
  );
};
