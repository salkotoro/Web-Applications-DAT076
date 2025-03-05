import { Project } from "./components/Project";
import { UserSearch } from "./components/UserSearch";
import { Header } from "./components/Header";

const App = () => {
  return (
    <div>
      <Header />
      <div className="container mt-4">
        <Project />
        <UserSearch />
      </div>
    </div>
  );
};

export default App;
