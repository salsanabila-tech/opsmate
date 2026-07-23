import { Router } from 'express';
import authRouter from './auth.route.js';
import healthRouter from './health.route.js';
import userRouter from './user.route.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);

export default apiRouter;
