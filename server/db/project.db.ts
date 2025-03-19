import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes, ForeignKey, NonAttribute } from 'sequelize';
import { sequelize } from './conn';
import { User } from './user.db';

export class Project extends Model<InferAttributes<Project>, InferCreationAttributes<Project>> {
    declare idProj: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare salary: number;
    declare open: boolean;
    declare roles: string; // Storing as JSON string since Sequelize doesn't natively support arrays
    declare employerId: ForeignKey<User['id']>;
    
    // For association access
    declare employer?: NonAttribute<User>;
}

Project.init({
    idProj: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id' // Use 'id' as the column name in the database
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    salary: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    open: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    roles: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('roles');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value: string | string[] | any) {
            // Handle the case where roles is already a JSON string
            if (typeof value === 'string') {
                try {
                    // Check if it's a valid JSON string
                    JSON.parse(value);
                    this.setDataValue('roles', value);
                } catch (e) {
                    // If not valid JSON, stringify it as a single-item array
                    this.setDataValue('roles', JSON.stringify([value]));
                }
            } else {
                // Handle arrays and other values
                this.setDataValue('roles', JSON.stringify(value));
            }
        }
    },
    employerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    sequelize,
    tableName: 'Projects'
});

// Define ProjectEmployee join table for Many-to-Many relationship between Projects and Employees
export class ProjectEmployee extends Model<InferAttributes<ProjectEmployee>, InferCreationAttributes<ProjectEmployee>> {
    declare id: CreationOptional<number>;
    declare projectId: ForeignKey<Project['idProj']>;
    declare employeeId: ForeignKey<User['id']>;
    declare joinedAt: Date;
    declare status: 'pending' | 'accepted' | 'rejected';
    
    // For association access
    declare Project?: NonAttribute<Project>;
    declare User?: NonAttribute<User>;
}

ProjectEmployee.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Project,
            key: 'id'
        },
        field: 'project_id'
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        field: 'employee_id'
    },
    joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'joined_at'
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        field: 'status'
    }
}, {
    sequelize,
    tableName: 'project_employees',
    timestamps: true
});

// Set up associations

// A Project belongs to one Employer (User)
Project.belongsTo(User, { as: 'employer', foreignKey: 'employerId' });

// A User (Employer) can have many Projects
User.hasMany(Project, { as: 'projects', foreignKey: 'employerId' });

// Many-to-Many relationship between Projects and Users (Employees)
Project.belongsToMany(User, { 
    through: ProjectEmployee,
    as: 'employees',
    foreignKey: 'projectId',
    otherKey: 'employeeId'
});

User.belongsToMany(Project, {
    through: ProjectEmployee,
    as: 'appliedProjects',
    foreignKey: 'employeeId',
    otherKey: 'projectId'
});

// Enable direct access to ProjectEmployee from both models
ProjectEmployee.belongsTo(Project, { foreignKey: 'projectId' });
ProjectEmployee.belongsTo(User, { foreignKey: 'employeeId' }); 