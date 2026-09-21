import express from "express";
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  getTeamProgress,
} from "../controllers/teamController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", getTeams);
router.post("/", createTeam);
router.get("/:id", getTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);
router.get("/:id/progress", getTeamProgress);

export default router;
