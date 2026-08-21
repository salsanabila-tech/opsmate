import cors from 'cors';
import path from 'node:path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import openApiSpec from './docs/openapi.js';
import { fileURLToPath } from 'node:url';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import apiRouter from './routes/index.js';

const app = express();
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const backendRootDirectory = path.resolve(currentDirectory, '..');
const uploadsDirectory = path.join(backendRootDirectory, 'uploads');

console.log('Uploads directory:', uploadsDirectory);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/uploads',
  express.static(uploadsDirectory, {
    dotfiles: 'deny',
    index: false,
  }),
);

app.get('/api-docs/openapi.json', (_request, response) => {
  response.json(openApiSpec);
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    customSiteTitle: 'OpsMate API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
);

app.use('/api', apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
