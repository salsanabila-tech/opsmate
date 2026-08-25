import { Router } from 'express';
import { UserRole } from '../generated/prisma/client.js';
import { createCustomerController, getCustomerDetailsController, listCustomersController, updateCustomerController } from '../controllers/customer.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { authorizeRoles } from '../middlewares/authorize-role.middleware.js';

const customerRouter = Router();

customerRouter.get('/', authenticate, authorizeRoles(UserRole.ADMIN), listCustomersController);
customerRouter.get('/:customerId', authenticate, authorizeRoles(UserRole.ADMIN), getCustomerDetailsController);
customerRouter.post('/', authenticate, authorizeRoles(UserRole.ADMIN), createCustomerController);
customerRouter.patch('/:customerId', authenticate, authorizeRoles(UserRole.ADMIN), updateCustomerController);

export default customerRouter;
