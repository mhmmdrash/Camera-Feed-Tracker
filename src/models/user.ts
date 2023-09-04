import { DataTypes } from "sequelize";
import sequelize from '../utils/database';

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    role: {
        type: DataTypes.ENUM('super-admin', 'admin', 'basic'),
        allowNull: false

    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

export default User;