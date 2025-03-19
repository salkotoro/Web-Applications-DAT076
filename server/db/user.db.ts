import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from 'sequelize';
import { sequelize } from './conn';
import { UserType } from '../src/models/User';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;
    declare username: string;
    declare password: string;
    declare firstName: string;
    declare lastName: string;
    declare email: string;
    declare userType: string; // Store as string, will be converted to enum
    declare companyName: string | null;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    userType: {
        type: DataTypes.ENUM(UserType.EMPLOYER, UserType.EMPLOYEE),
        allowNull: false,
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: true, // Required for employers, null for employees
    },
}, {
    sequelize,
    tableName: 'Users',
});
