import { Router } from 'express';
import { UserRole } from '../generated/prisma/client.js';
import { createWorkOrderController, listTechnicianWorkOrdersController, listWorkOrderssController, getWorkOrderDetailsController } from '../controllers/work-order.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { authorizeRoles } from '../middlewares/authorize-role.middleware.js';

const workOrderRouter = Router();

workOrderRouter.post('/', authenticate, authorizeRoles(UserRole.ADMIN), createWorkOrderController);
workOrderRouter.get('/', authenticate, authorizeRoles(UserRole.ADMIN), listWorkOrderssController);
workOrderRouter.get('/my', authenticate, authorizeRoles(UserRole.TECHNICIAN), listTechnicianWorkOrdersController);
workOrderRouter.get('/:workOrderId', authenticate, authorizeRoles(UserRole.ADMIN), getWorkOrderDetailsController);

export default workOrderRouter;
