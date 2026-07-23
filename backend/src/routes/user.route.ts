import { Router } from 'express';
import { UserRole } from '../generated/prisma/client.js';
import { createTechnicianController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { authorizeRoles } from '../middlewares/authorize-role.middleware.js';

const userRouter = Router();

userRouter.post('/technicians', authenticate, authorizeRoles(UserRole.ADMIN), createTechnicianController);

export default userRouter;
