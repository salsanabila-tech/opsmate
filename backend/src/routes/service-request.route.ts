import { Router } from 'express';

import { UserRole } from '../generated/prisma/client.js';

import { authenticate } from '../middlewares/authenticate.middleware.js';

import { authorizeRoles } from '../middlewares/authorize-role.middleware.js';

import {
  cancelMyServiceRequestController,
  createServiceRequestController,
  getMyServiceRequestController,
  getServiceRequestDetailsController,
  listMyServiceRequestsController,
  listServiceRequestsController,
  updateServiceRequestStatusController,
} from '../controllers/service-request.controller.js';

const serviceRequestRouter = Router();

serviceRequestRouter.post('/', authenticate, authorizeRoles(UserRole.CUSTOMER), createServiceRequestController);

serviceRequestRouter.get('/my', authenticate, authorizeRoles(UserRole.CUSTOMER), listMyServiceRequestsController);

serviceRequestRouter.get('/my/:serviceRequestId', authenticate, authorizeRoles(UserRole.CUSTOMER), getMyServiceRequestController);

serviceRequestRouter.patch('/my/:serviceRequestId/cancel', authenticate, authorizeRoles(UserRole.CUSTOMER), cancelMyServiceRequestController);

serviceRequestRouter.get('/', authenticate, authorizeRoles(UserRole.ADMIN), listServiceRequestsController);

serviceRequestRouter.get('/:serviceRequestId', authenticate, authorizeRoles(UserRole.ADMIN), getServiceRequestDetailsController);

serviceRequestRouter.patch('/:serviceRequestId/status', authenticate, authorizeRoles(UserRole.ADMIN), updateServiceRequestStatusController);

export default serviceRequestRouter;
