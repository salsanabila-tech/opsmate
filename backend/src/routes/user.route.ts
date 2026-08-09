import { Router } from 'express';
import { UserRole } from '../generated/prisma/client.js';
import { createTechnicianController, getTechnicianDetailController, listTechniciansController, updateTechnicianController, updateTechnicianStatusController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { authorizeRoles } from '../middlewares/authorize-role.middleware.js';

const userRouter = Router();

userRouter.get('/technicians', authenticate, authorizeRoles(UserRole.ADMIN), listTechniciansController);
userRouter.get('/technicians/:technicianId', authenticate, authorizeRoles(UserRole.ADMIN), getTechnicianDetailController);
userRouter.patch('/technicians/:technicianId/status', authenticate, authorizeRoles(UserRole.ADMIN), updateTechnicianStatusController);
userRouter.patch('/technicians/:technicianId', authenticate, authorizeRoles(UserRole.ADMIN), updateTechnicianController);
userRouter.post('/technicians', authenticate, authorizeRoles(UserRole.ADMIN), createTechnicianController);

export default userRouter;
