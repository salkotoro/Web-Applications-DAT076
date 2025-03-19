import Header from "./components/Header";
import { AppRoutes } from "./components/ProtectedRoutes";
import { useLocation } from "react-router-dom";

const App = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div>
      {!isAuthPage && <Header />}
      <AppRoutes />
    </div>
  );
};

export default App;
