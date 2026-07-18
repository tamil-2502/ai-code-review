import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createReview,
  getReviews,
  getReview,
  deleteReview,
  getDashboard
} from "../controllers/reviewController.js";

const router = Router();

router.use(authMiddleware);
router.get("/dashboard", getDashboard);
router.post("/", createReview);
router.get("/", getReviews);
router.get("/:id", getReview);
router.delete("/:id", deleteReview);

export default router;