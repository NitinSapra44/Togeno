import { Router } from "express";
import { authController } from "@/controllers";
import { authenticate, validateBody } from "@/middleware";
import { signUpSchema, signInSchema, refreshTokenSchema, changePasswordSchema } from "@/schemas";

const router = Router();

// Email/password auth with validation
router.post(
  "/signup",
  validateBody(signUpSchema),
  authController.signUp.bind(authController),
);

router.post(
  "/login",
  validateBody(signInSchema),
  authController.signIn.bind(authController),
);

// Google OAuth - returns URL for frontend to redirect to
router.get("/google", authController.googleOAuth.bind(authController));

// Session management
router.post("/logout", authController.signOut.bind(authController));

router.post(
  "/refresh",
  validateBody(refreshTokenSchema),
  authController.refreshToken.bind(authController),
);

// OAuth completion - creates profile if needed after OAuth callback
router.post(
  "/oauth/complete",
  authController.completeOAuth.bind(authController),
);

// Change password (authenticated users only)
router.patch(
  "/change-password",
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword.bind(authController),
);

export { router as authRouter };
