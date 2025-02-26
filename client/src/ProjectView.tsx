import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ProjectView.css"

import "bootstrap/dist/css/bootstrap.min.css";

interface Project {
  idProj: number;
  name: string;
  description: string;
  salary: number;
  roles: number[];
  open: boolean;
}

function ProjectView() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/projects/${id}`) 
      .then((response) => response.json())
      .then((data) => setProject(data))
      .catch((error) => console.error("Error fetching project:", error));
  }, [id]);

  return (
    <div className="container mt-5">
      <button onClick={() => navigate(-1)} className="btn btn-primary mb-3">
        ⬅ Back to Homepage
      </button>

      {project ? (
        <>
          <h2 className="mb-3 text-center">{project.name}</h2>
          <p><strong>Description:</strong> {project.description}</p>
          <p><strong>Salary:</strong> ${project.salary}</p>
          <p><strong>Status:</strong> {project.open ? "Open" : "Closed"}</p>

          <div className="text-center mt-4">
            <a href="chat.html" className="btn btn-success">Chat with Company</a>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ProjectView;
