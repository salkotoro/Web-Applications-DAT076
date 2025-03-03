import { useState, useEffect } from 'react';
import './Homepage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from "react-router-dom";

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
  
    useEffect(() => {
      fetch("http://localhost:3000/projects") 
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

  return (
    <>
    <header className='bg-primary text-white text-center py-4'>
     <h1>Project Employment Hub</h1>
     <p>Find exciting project roles in software and computer science.</p>
     </header>
     <main className="container mt-5">
        {loading ? (
          <p>Loading projects...</p>
        ) : (
          <div className="row">
            {projects.map((project) => (
              <div key={project.idProj} className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title text-primary">{project.name}</h5>
                    <p className="card-text"><strong>Description:</strong> {project.description}</p>
                    <p className="card-text"><strong>Salary:</strong> ${project.salary}</p>
                    
                    <Link to={`/projects/${project.idProj}`} className="btn btn-primary">View Details</Link>
                  
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      </>
    
  )
}

export default Homepage
