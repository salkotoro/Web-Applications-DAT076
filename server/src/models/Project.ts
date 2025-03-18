export interface ProjectDTO {
    name: string;
    description: string;
    salary: number;
    roles: number[];
    open: boolean;
  }
  
  export interface Project extends ProjectDTO {
    idProj: number;
  }
  

  export type ProjectResponse = Project;
  
      export const toDTO = (project: Project): ProjectDTO => {
    return {
      name: project.name,
      description: project.description,
      salary: project.salary,
      roles: project.roles,
      open: project.open,
    };
  };
  