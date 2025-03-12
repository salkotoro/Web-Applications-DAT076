// ProjectForm.tsx
import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const ProjectForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    salary: 0,
    open: true,
    roles: user ? [user.id] : []  // default to include the creator's id
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      [name]: name === "salary" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure the creator's id is the first member of roles.
    const updatedData = { ...projectData, roles: user ? [user.id] : [] };
    try {
      const response = await axios.post("/api/projects", updatedData);
      console.log("Project created", response.data);
      navigate("/"); // Navigate to homepage or projects list after creation.
    } catch (error) {
      console.error("Error creating project", error);
    }
  };

  return (
    <div className="container">
      <h2>Create Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name">Project Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={projectData.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={projectData.description}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="salary">Salary</label>
          <input
            type="number"
            id="salary"
            name="salary"
            value={projectData.salary}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="open"
            name="open"
            checked={projectData.open}
            onChange={(e) =>
              setProjectData({ ...projectData, open: e.target.checked })
            }
          />
          <label className="form-check-label" htmlFor="open">
            Open Project
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          Create Project
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;
