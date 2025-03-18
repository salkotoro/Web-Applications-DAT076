import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Homepage.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";

interface Project {
  idProj: number;
  name: string;
  description: string;
  salary: number;
  roles: number[];
  open: boolean;
}

function Homepage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Extract the "search" parameter from the URL (if present)
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    fetch("http://localhost:3000/api/projects")
      .then((response) => response.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      });
  }, []);

  // Filter projects based on the search query (by name or description)
  const filteredProjects = projects.filter((project) => {
    return (
      project.name.toLowerCase().includes(searchQuery) ||
      project.description.toLowerCase().includes(searchQuery)
    );
  });

  return (
    <main className="container mt-5">
      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="row">
          {filteredProjects.map((project) => (
            <div key={project.idProj} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title text-primary">{project.name}</h5>
                  <p className="card-text">
                    <strong>Description:</strong> {project.description}
                  </p>
                  <p className="card-text">
                    <strong>Salary:</strong> ${project.salary}
                  </p>
                  <Link to={`/projects/${project.idProj}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Homepage;
