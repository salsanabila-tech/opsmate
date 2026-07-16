import { Router } from 'express';
<<<<<<< HEAD
import { getDatabaseHealthStatus , getHealthStatus } from '../controllers/health.controller.js';
=======
import { getHealthStatus } from '../controllers/health.controller.js';
>>>>>>> origin/main

const healthRouter = Router();

healthRouter.get('/', getHealthStatus);
healthRouter.get('/database', getDatabaseHealthStatus);

export default healthRouter;
