import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import ProjectView from "./ProjectView";

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/projects/:id" element={<ProjectView />} />
      </Routes>
    
  );
}

export default App;
