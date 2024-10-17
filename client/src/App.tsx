import { Header } from "./components/header";
import { withTheme } from "./hocs/withTheme";
import { ThemedProps } from "./types/interfaces/themed_props";
import styles from "./app.module.scss";

interface AppProps extends ThemedProps {}
const App: React.FC<AppProps> = (props) => {
  const { theme, toggleTheme } = props;
  return (
    <div id={styles.root}>
      <Header theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
};

export default withTheme(App);
