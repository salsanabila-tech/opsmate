import { Router } from 'express';
import { UserRole } from '../generated/prisma/client.js';
import { createWorkOrderController, listTechnicianWorkOrdersController, listWorkOrdersController, getTechnicianWorkOrderDetailsController, getWorkOrderDetailsController } from '../controllers/work-order.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { authorizeRoles } from '../middlewares/authorize-role.middleware.js';

const workOrderRouter = Router();

workOrderRouter.post('/', authenticate, authorizeRoles(UserRole.ADMIN), createWorkOrderController);
workOrderRouter.get('/', authenticate, authorizeRoles(UserRole.ADMIN), listWorkOrdersController);
workOrderRouter.get('/my', authenticate, authorizeRoles(UserRole.TECHNICIAN), listTechnicianWorkOrdersController);
workOrderRouter.get('/my/:workOrderId', authenticate, authorizeRoles(UserRole.TECHNICIAN), getTechnicianWorkOrderDetailsController);
workOrderRouter.get('/:workOrderId', authenticate, authorizeRoles(UserRole.ADMIN), getWorkOrderDetailsController);

export default workOrderRouter;
