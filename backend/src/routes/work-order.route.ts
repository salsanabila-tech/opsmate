import { Router } from 'express';
import { UserRole } from '../generated/prisma/client.js';
import {
  createTechnicianWorkOrderAttachmentController,
  createWorkOrderController,
  listTechnicianWorkOrdersController,
  listWorkOrdersController,
  getTechnicianWorkOrderDetailsController,
  getWorkOrderDetailsController,
  updateTechnicianWorkOrderStatusController,
} from '../controllers/work-order.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { authorizeRoles } from '../middlewares/authorize-role.middleware.js';
import { uploadWorkOrderAttachment } from '../middlewares/work-order-upload.middleware.js';

const workOrderRouter = Router();

workOrderRouter.post('/', authenticate, authorizeRoles(UserRole.ADMIN), createWorkOrderController);
workOrderRouter.get('/', authenticate, authorizeRoles(UserRole.ADMIN), listWorkOrdersController);
workOrderRouter.get('/my', authenticate, authorizeRoles(UserRole.TECHNICIAN), listTechnicianWorkOrdersController);
workOrderRouter.patch('/my/:workOrderId/status', authenticate, authorizeRoles(UserRole.TECHNICIAN), updateTechnicianWorkOrderStatusController);
workOrderRouter.post('/my/:workOrderId/attachments', authenticate, authorizeRoles(UserRole.TECHNICIAN), uploadWorkOrderAttachment, createTechnicianWorkOrderAttachmentController);
workOrderRouter.get('/my/:workOrderId', authenticate, authorizeRoles(UserRole.TECHNICIAN), getTechnicianWorkOrderDetailsController);
workOrderRouter.get('/:workOrderId', authenticate, authorizeRoles(UserRole.ADMIN), getWorkOrderDetailsController);

export default workOrderRouter;
