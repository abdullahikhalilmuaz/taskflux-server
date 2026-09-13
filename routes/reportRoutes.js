import express from "express";
import { getDashboard, getReports } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);
router.get("/", getReports);
router.get("/dashboard", getDashboard);
export default router;
