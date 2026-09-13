import Team from "../models/Team.js";

export const getTeams = async (req, res) => {
  const teams = await Team.find({
    $or: [{ owner: req.user._id }, { members: req.user._id }],
  })
    .populate("owner", "name email")
    .populate("members", "name email");
  res.json(teams);
};

export const createTeam = async (req, res) => {
  const team = await Team.create({
    name: req.body.name,
    owner: req.user._id,
    members: [req.user._id],
  });
  res.status(201).json(team);
};

export const updateTeam = async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(team);
};

export const deleteTeam = async (req, res) => {
  await Team.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
