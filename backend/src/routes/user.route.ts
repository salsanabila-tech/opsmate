import { Router } from 'express';
import { UserRole } from '../generated/prisma/client.js';
import { createTechnicianController, getTechnicianDetailController, listTechniciansController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { authorizeRoles } from '../middlewares/authorize-role.middleware.js';

const userRouter = Router();

userRouter.get('/technicians', authenticate, authorizeRoles(UserRole.ADMIN), listTechniciansController);
userRouter.get('/technicians/:technicianId', authenticate, authorizeRoles(UserRole.ADMIN), getTechnicianDetailController);
userRouter.post('/technicians', authenticate, authorizeRoles(UserRole.ADMIN), createTechnicianController);

export default userRouter;
