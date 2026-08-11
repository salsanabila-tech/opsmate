import { Router } from 'express';
import { UserRole } from '../generated/prisma/client.js';
import { createCustomerController } from '../controllers/customer.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { authorizeRoles } from '../middlewares/authorize-role.middleware.js';

const customerRouter = Router();

customerRouter.post('/', authenticate, authorizeRoles(UserRole.ADMIN), createCustomerController);

export default customerRouter;
