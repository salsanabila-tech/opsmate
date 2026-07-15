import { Router } from 'express';
import { getDatabaseHealthStatus , getHealthStatus } from '../controllers/health.controller.js';

const healthRouter = Router();

healthRouter.get('/', getHealthStatus);
healthRouter.get('/database', getDatabaseHealthStatus);

export default healthRouter;
