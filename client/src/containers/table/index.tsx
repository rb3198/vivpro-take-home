import React from "react";
import { Track } from "../../types/track";

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
  return (
    <div>
      {tracks?.map((track) => (
        <p>{track.title}</p>
      ))}
    </div>
  );
};
