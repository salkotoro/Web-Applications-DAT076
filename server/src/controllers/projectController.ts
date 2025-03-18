import { Request, Response } from "express";
import { projectService } from "../services/projectService";

export const projectController = {
  // Retrieve all projects
  getAllProjects: async (req: Request, res: Response): Promise<void> => {
    try {
      const projects = await projectService.getAllProjects();
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving projects" });
    }
  },

  // Retrieve a single project by ID
  getProjectById: async (req: Request, res: Response): Promise<void> => {
    try {
      const project = await projectService.getProjectById(Number(req.params.id));
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving project" });
    }
  },

  // Create a new project
  createProject: async (req: Request, res: Response): Promise<void> => {
    try {
      const project = await projectService.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Error creating project" });
    }
  },

  // Update an existing project
  updateProject: async (req: Request, res: Response): Promise<void> => {
    try {
      const project = await projectService.updateProject(Number(req.params.id), req.body);
      res.status(200).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  },

  // Delete a project
  deleteProject: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await projectService.deleteProject(id);
      res.status(200).json({ message: `Project ${id} deleted successfully` });
    } catch (error) {
      res.status(404).json({ message: "Project not found" });
    }
  },
};
