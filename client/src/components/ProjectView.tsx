import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./project.css";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/projects/${id}`)
      .then((response) => response.json())
      .then((data) => {
        // Ensure roles is defined
        data.roles = data.roles || [];
        setProject(data);
      })
      .catch((error) => {
        console.error("Error fetching project:", error);
        setError("Project not found");
      });
  }, [id]);

  const handleDelete = async () => {
    // Confirm deletion with the user
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/projects/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      // After deletion, navigate back to the homepage
      navigate("/");
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Error deleting project");
    }
  };

  return (
    <div className="container mt-5">
      <button onClick={() => navigate(-1)} className="btn btn-primary mb-3">
        ⬅ Back to Homepage
      </button>
      {error ? (
        <p>{error}</p>
      ) : project ? (
        <>
          <h2 className="mb-3 text-center">{project.name}</h2>
          <p>
            <strong>Description:</strong> {project.description}
          </p>
          <p>
            <strong>Salary:</strong> ${project.salary}
          </p>
          <p>
            <strong>Status:</strong> {project.open ? "Open" : "Closed"}
          </p>
          <p>
            <strong>Members:</strong>{" "}
            {project.roles?.length > 0 ? project.roles.join(", ") : "No members yet"}
          </p>
          <div className="text-center mt-4">
            <a href="chat.html" className="btn btn-success me-2">
              Chat with Company
            </a>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete Project
            </button>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ProjectView;
