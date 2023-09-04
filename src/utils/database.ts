const { Sequelize } = require('sequelize');
import * as dotenv from 'dotenv';
dotenv.config();

const url: string = process.env.SQL_URL as string;
const sequelize = new Sequelize(url);

export default sequelize;