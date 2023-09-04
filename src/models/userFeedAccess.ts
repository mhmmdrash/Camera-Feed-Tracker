import { DataTypes } from "sequelize";
import sequelize from '../utils/database';

const UserFeedAccess = sequelize.define('userFeedAccess', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    feedId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    canDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

export default UserFeedAccess;