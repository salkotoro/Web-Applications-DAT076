import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface Project {
  idProj: number;
  name: string;
  description: string;
  salary: number;
  roles: number[];
  open: boolean;
}

// A custom hook to get query parameters from the URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ProjectSearch: React.FC = () => {
  const query = useQuery();
  const searchTerm = query.get("query") || "";
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Replace this URL with your backend endpoint that supports search
    fetch(`http://localhost:3000/api/projects?search=${encodeURIComponent(searchTerm)}`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        return response.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        setError("Error fetching projects");
        setLoading(false);
      });
  }, [searchTerm]);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-5">
      <h2>Search Results for "{searchTerm}"</h2>
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map((project) => (
          <div key={project.idProj} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{project.name}</h5>
              <p className="card-text">{project.description}</p>
              <p className="card-text">
                <strong>Salary:</strong> ${project.salary}
              </p>
              <p className="card-text">
                <strong>Status:</strong> {project.open ? "Open" : "Closed"}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProjectSearch;
