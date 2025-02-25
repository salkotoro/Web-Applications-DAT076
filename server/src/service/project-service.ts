import { Project } from "../model/project-model";

export class ProjectService {
  private projects: Project[] = [];

  // Returns the current list of profiles
  async getProjects(): Promise<Project[]> {
    return JSON.parse(JSON.stringify(this.projects));
  }

  // Get a user by ID
  async getProjectById(idProj: number): Promise<Project | null> {
    const user = this.projects.find((project) => project.idProj === idProj);
    return user ? JSON.parse(JSON.stringify(user)) : null;
  }

  // Create a new user profile
  async createProject(
    name: string,
    description: string,
    salary: number,
    roles: number[]
  ): Promise<Project> {
    const newProject: Project = {
      idProj: Date.now(),
      name: name,
      description: description,
      salary: salary,
      roles: roles,
      open: true,
    };
    this.projects.push(newProject);
    return JSON.parse(JSON.stringify(newProject));
  }

  // Update a user profile
  async updateProject(
    idProj: number,
    name?: string,
    description?: string,
    salary?: number,
    roles?: [],
    open?: boolean
  ): Promise<Project | null> {
    const projectIndex = this.projects.findIndex(
      (project) => project.idProj === idProj
    );
    if (projectIndex === -1) return null;

    if (name) this.projects[projectIndex].name = name;
    if (description) this.projects[projectIndex].description = description;
    if (salary) this.projects[projectIndex].salary = salary;
    if (roles) this.projects[projectIndex].roles = roles;
    if (open) this.projects[projectIndex].open = open;

    return JSON.parse(JSON.stringify(this.projects[projectIndex]));
  }

  // Delete a project
  async deleteProject(idProj: number): Promise<boolean> {
    const projectIndex = this.projects.findIndex(
      (project) => project.idProj === idProj
    );
    if (projectIndex === -1) return false;

    this.projects.splice(projectIndex, 1);
    return true;
  }
  // Add a user to a project
  async addUserToProject(idProj: number, id: number): Promise<Project | null> {
    const project = this.projects.find((project) => project.idProj === idProj);
    if (!project) return null;

    if (!project.roles.includes(id)) {
      project.roles.push(id); // Add user to the roles list
    }

    return JSON.parse(JSON.stringify(project));
  }

  // Remove a user from a project
  async removeUserFromProject(
    idProj: number,
    id: number
  ): Promise<Project | null> {
    const project = this.projects.find((project) => project.idProj === idProj);
    if (!project) return null;

    project.roles = project.roles.filter((idProj) => idProj !== id); // Remove user from roles list
    return JSON.parse(JSON.stringify(project));
  }
}

export default new ProjectService();
