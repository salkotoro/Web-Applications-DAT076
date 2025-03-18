import { Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import ProjectView from "./components/ProjectView";
import UserForm from "./UserForm";
import UserSearch from "./UserSearch";
import UserEditForm from "./UserEditForm";
import UserEditFormWrapper from "./UsersListWrapper";
import { Project } from "./components/Project";
import { Header } from "./components/Header";

function App() {
  return (
        <div>
        <Header />
        <div className="container mt-4">
        <UserSearch />        

        <Routes>

        <Route path="/" element={<Homepage />} />  
        <Route path="/projects/:id" element={<ProjectView />} />
       
        </Routes>
        </div>
      </div>
    );
      <Routes>
        
        <Route path="/" element={<Homepage />} />
        <Route path="/projects/:id" element={<ProjectView />} />
        <Route path="/userform" element={<UserForm />} />
        <Route path="/usersearch" element={<UserSearch />} />
        <Route path="/usereditform" element={<UserEditFormWrapper />} />

        </Routes>

}

export default App;
