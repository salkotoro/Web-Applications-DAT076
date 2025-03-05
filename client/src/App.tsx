import { useAuth } from "./context/useAuth";
import { Navigate } from "react-router-dom";
import { Project } from "./components/Project";
import { UserSearch } from "./components/UserSearch";
import { Header } from "./components/Header";

const App = () => {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

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
