import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || 'default_secret';

export default {
  JWT_SECRET
};
