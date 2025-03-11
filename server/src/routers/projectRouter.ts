import express, { Request, Response, RequestHandler } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { projectService } from "../services/projectService";

export const projectRouter = express.Router();

// Create a new project
projectRouter.post("/", async (req: Request, res: Response) => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

// Get all projects
projectRouter.get("/", async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Get a project by ID
projectRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectById(Number(req.params.id));
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.status(200).json(project);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update a project by ID
projectRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const project = await projectService.updateProject(Number(req.params.id), req.body);
    res.status(200).json(project);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

// Delete a project by ID
projectRouter.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    await projectService.deleteProject(Number(req.params.id));
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    }
  }
});
