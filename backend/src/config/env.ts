import dotenv from 'dotenv';
 
dotenv.config();

const port = Number(process.env.PORT ?? 3000);
const nodeEnv = process.env.NODE_ENV ?? 'development';

if (Number.isNaN(port)) {
  throw new Error("PORT harus berupa angka");
}

export const env = {
  port,
  nodeEnv,
};