import { Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import ProjectView from "./ProjectView";
import UserForm from "./UserForm";
import UserSearch from "./UserSearch";
import UserEditForm from "./UserEditForm";
import UserEditFormWrapper from "./UsersListWrapper";

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/projects/:id" element={<ProjectView />} />
        <Route path="/userform" element={<UserForm />} />
        <Route path="/usersearch" element={<UserSearch />} />
        <Route path="/usereditform" element={<UserEditFormWrapper />} />

        </Routes>
    
  );
}

export default App;
