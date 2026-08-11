import { Router } from 'express';
import authRouter from './auth.route.js';
import healthRouter from './health.route.js';
import userRouter from './user.route.js';
import customerRouter from './customer.route.js';
import workOrderRouter from './work-order.route.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/work-orders', workOrderRouter);
apiRouter.use('/customers', customerRouter);
apiRouter.use('/users', userRouter);

export default apiRouter;
