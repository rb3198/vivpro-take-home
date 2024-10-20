import { withTheme } from "./hocs/withTheme";
import { ThemedProps } from "./types/interfaces/themed_props";
import styles from "./app.module.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Root } from "./Root";
import { Table } from "./containers/table";
import { Analysis } from "./containers/analysis";
import { useFetch } from "./hooks/useFetch";
import { Track } from "./types/track";
import { useEffect, useState } from "react";
import { TRACKS_ENDPOINT } from "./constants/endpoints";

interface AppProps extends ThemedProps {}
const App: React.FC<AppProps> = (props) => {
  const { theme, toggleTheme } = props;
  const [tracks, setTracks] = useState<Track[]>([]);
  const {
    fetch: fetchTracks,
    data,
    error,
    loading: loadingTracks,
  } = useFetch<Track[]>();
  useEffect(() => {
    fetchTracks(TRACKS_ENDPOINT, "get");
  }, []);
  useEffect(() => {
    data && setTracks(data);
  }, [data]);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root theme={theme} toggleTheme={toggleTheme} />,
      children: [
        {
          path: "",
          element: (
            <Table
              tracks={tracks}
              errorLoadingTracks={error}
              loadingTracks={loadingTracks}
              setTracks={setTracks}
            />
          ),
        },
        {
          path: "analysis",
          element: <Analysis />,
        },
      ],
    },
  ]);
  return (
    <div id={styles.root}>
      <RouterProvider router={router} />
    </div>
  );
};

export default withTheme(App);
