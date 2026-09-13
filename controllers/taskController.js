import Task from "../models/Task.js";

const smartPriority = (deadline) => {
  if (!deadline) return "Medium";
  const days = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24);
  if (days <= 2) return "High";
  if (days <= 7) return "Medium";
  return "Low";
};

const autoOverdue = (t) => {
  if (t.status !== "Completed" && t.deadline && new Date(t.deadline) < new Date()) {
    t.status = "Overdue";
  }
  return t;
};

export const getTasks = async (req, res) => {
  const tasks = await Task.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
  res.json(tasks.map(autoOverdue));
};

export const createTask = async (req, res) => {
  try {
    const { title, description, category, deadline, progress } = req.body;
    const task = await Task.create({
      title,
      description,
      category,
      deadline,
      progress: progress || 0,
      priority: smartPriority(deadline),
      status: progress === 100 ? "Completed" : progress > 0 ? "In Progress" : "Pending",
      createdBy: req.user._id,
      assignedTo: req.user._id,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Not found" });
  if (task.createdBy.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Forbidden" });

  Object.assign(task, req.body);
  if (req.body.deadline) task.priority = smartPriority(req.body.deadline);
  if (task.progress === 100) task.status = "Completed";

  const saved = await task.save();
  res.json(autoOverdue(saved));
};

export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Not found" });
  if (task.createdBy.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Forbidden" });
  await task.deleteOne();
  res.json({ message: "Deleted" });
};
