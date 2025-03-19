export interface Project {
    idProj: number;
    name: string;
    description: string;
    salary: number;
    roles: number[];
    open: boolean;
    employerId: number;
}

export interface ProjectDTO {
    name: string;
    description: string;
    salary: number;
    roles: number[];
    open: boolean;
    employerId: number;
}

// Interface for storing project-employee relationships
export interface ProjectEmployee {
    projectId: number;
    employeeId: number;
    joinedAt: Date;
} 