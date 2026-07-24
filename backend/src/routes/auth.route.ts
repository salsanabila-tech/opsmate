import { Router } from 'express';
import { getMeController, loginController, logoutController, refreshTokenController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';

const authRouter = Router();

authRouter.post('/login', loginController);
authRouter.post('/refresh', refreshTokenController);
authRouter.get('/me', authenticate, getMeController);
authRouter.post('/logout', authenticate, logoutController);

export default authRouter;
