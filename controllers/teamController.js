import Team from "../models/Team.js";
import User from "../models/User.js";
import Task from "../models/Task.js";

const populate = (query) =>
  query.populate("owner", "name email").populate("members", "name email");

export const getTeams = async (req, res) => {
  try {
    const teams = await populate(
      Team.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }),
    );
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeam = async (req, res) => {
  try {
    const team = await populate(Team.findById(req.params.id));
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });

    const team = await Team.create({
      name,
      owner: req.user._id,
      members: [req.user._id],
    });

    const populated = await populate(Team.findById(team._id));
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });
    if (team.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can update" });

    if (req.body.name) team.name = req.body.name;
    await team.save();
    const populated = await populate(Team.findById(team._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });
    if (team.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can delete" });

    await team.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });
    if (team.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can invite" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No user with that email" });

    if (team.members.some((m) => m.toString() === user._id.toString()))
      return res.status(400).json({ message: "Already a member" });

    team.members.push(user._id);
    await team.save();

    const populated = await populate(Team.findById(team._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });
    if (team.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can remove" });

    if (req.params.userId === team.owner.toString())
      return res.status(400).json({ message: "Cannot remove owner" });

    team.members = team.members.filter(
      (m) => m.toString() !== req.params.userId,
    );
    await team.save();

    const populated = await populate(Team.findById(team._id));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeamProgress = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const tasks = await Task.find({ assignedTo: { $in: team.members } });

    const perMember = await Promise.all(
      team.members.map(async (m) => {
        const user = await User.findById(m).select("name email");
        const userTasks = tasks.filter(
          (t) => t.assignedTo?.toString() === m.toString(),
        );
        return {
          user: { _id: user._id, name: user.name, email: user.email },
          total: userTasks.length,
          completed: userTasks.filter((t) => t.status === "Completed").length,
          pending: userTasks.filter(
            (t) => t.status === "Pending" || t.status === "In Progress",
          ).length,
          overdue: userTasks.filter((t) => t.status === "Overdue").length,
        };
      }),
    );

    res.json({ perMember });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
