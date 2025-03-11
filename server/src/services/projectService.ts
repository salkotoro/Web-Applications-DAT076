import { Project, ProjectDTO, ProjectResponse } from "../models/Project";

export class ProjectService {
  private projects: Project[] = [];
  private nextId = 1;

  // Create a new project (similar to register)
  async createProject(projectData: ProjectDTO): Promise<ProjectResponse> {
    const newProject: Project = {
      idProj: this.nextId++,
      ...projectData,
    };

    this.projects.push(newProject);
    return newProject;
  }

  // Get all projects (similar to getAllUsers)
  async getAllProjects(): Promise<ProjectResponse[]> {
    // Return a shallow copy of the projects array
    return this.projects.map(project => ({ ...project }));
  }

  // Get a project by ID (similar to getUserById)
  async getProjectById(idProj: number): Promise<ProjectResponse | undefined> {
    const project = this.projects.find((p) => p.idProj === idProj);
    return project ? { ...project } : undefined;
  }

  // Update an existing project (similar to updateUser)
  async updateProject(
    idProj: number,
    updates: Partial<ProjectDTO>
  ): Promise<ProjectResponse> {
    const index = this.projects.findIndex((p) => p.idProj === idProj);
    if (index === -1) {
      throw new Error("Project not found");
    }

    const project = this.projects[index];
    const updatedProject = { ...project, ...updates };
    this.projects[index] = updatedProject;
    return { ...updatedProject };
  }

  // Delete a project (similar to deleteUser)
  async deleteProject(idProj: number): Promise<void> {
    const index = this.projects.findIndex((p) => p.idProj === idProj);
    if (index === -1) {
      throw new Error("Project not found");
    }
    this.projects.splice(index, 1);
  }
}

export const projectService = new ProjectService();
