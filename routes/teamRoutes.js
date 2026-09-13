import express from "express";
import { getTeams, createTeam, updateTeam, deleteTeam } from "../controllers/teamController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);
router.get("/", getTeams);
router.post("/", createTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);
export default router;
