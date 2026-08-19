import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import openApiSpec from './docs/openapi.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import apiRouter from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
