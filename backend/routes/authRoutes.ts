import { login, logout } from "../controllers/authController";
import { Router } from "express";
const router = Router();

router.route("/login").post(login);
router.route("/logout").get(logout);

export { router as authRouter };
