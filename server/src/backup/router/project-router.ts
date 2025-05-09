import express, { Request, Response } from "express";
import { ProjectService } from "../service/project-service";

const projectService = new ProjectService();
export const projectRouter = express.Router();

//  Get all projects
projectRouter.get("/", async (req: Request, res: Response) => {
  const projects = await projectService.getProjects();
  res.json(projects);
});

//  Get a project by ID
projectRouter.get("/:idProj", async (req: Request, res: Response) => {
  const idProj = parseInt(req.params.idProj);
  const project = await projectService.getProjectById(idProj);

  if (project) res.json(project);
  else res.status(404).json({ message: "Project not found" });
});

//  Create a new project
projectRouter.post("/", async (req: Request, res: Response) => {
  const { name, description, salary, roles } = req.body;

  //Add exception handling
  const newProject = await projectService.createProject(
    name,
    description,
    salary,
    roles
  );
  res.status(201).json(newProject);
});

//  Update a project
projectRouter.put("/:idProj", async (req: Request, res: Response) => {
  const idProj = parseInt(req.params.idProj);
  const { name, description, salary, roles, open } = req.body;

  const updatedProject = await projectService.updateProject(
    idProj,
    name,
    description,
    salary,
    roles,
    open
  );

  if (updatedProject) res.json(updatedProject);
  else res.status(404).json({ message: "Project not found" });
});

//  Delete a project
projectRouter.delete("/:idProj", async (req: Request, res: Response) => {
  const idProj = parseInt(req.params.idProj);
  const deleted = await projectService.deleteProject(idProj);

  if (deleted) res.status(204).send(); // No content
  else res.status(404).json({ message: "Project not found" });
});

//  Add a user to a project
projectRouter.post(
  "/:idProj/users/:id",
  async (req: Request, res: Response) => {
    const idProj = parseInt(req.params.idProj);
    const id = parseInt(req.params.id);

    const updatedProject = await projectService.addUserToProject(idProj, id);

    if (updatedProject)
      res.json({ message: "User added to project", project: updatedProject });
    else res.status(404).json({ message: "Project not found" });
  }
);

//  Remove a user from a project
projectRouter.delete(
  "/:idProj/users/:id",
  async (req: Request, res: Response) => {
    const idProj = parseInt(req.params.idProj);
    const id = parseInt(req.params.id);

    const updatedProject = await projectService.removeUserFromProject(
      idProj,
      id
    );

    if (updatedProject)
      res.json({
        message: "User removed from project",
        project: updatedProject,
      });
    else res.status(404).json({ message: "Project not found" });
  }
);
