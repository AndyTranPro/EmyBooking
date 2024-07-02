import {
  createOrder,
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  updateOrder,
} from "../controllers/orderController";

import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/full-auth";

import { Router } from "express";

const router = Router();
// router
//   .route("/")
//   .get(authorizePermissions("admin"), getAllOrders)
//   .post(createOrder);

router.route("/showAllMyOrders").get(getCurrentUserOrders);

router.route("/:id").get(getSingleOrder).patch(authenticateUser, updateOrder);

export { router as orderRouter };
