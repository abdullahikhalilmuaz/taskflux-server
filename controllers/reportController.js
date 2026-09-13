import Task from "../models/Task.js";

export const getDashboard = async (req, res) => {
  const tasks = await Task.find({ createdBy: req.user._id });

  const now = new Date();
  tasks.forEach((t) => {
    if (t.status !== "Completed" && t.deadline && new Date(t.deadline) < now) {
      t.status = "Overdue";
    }
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status === "Pending" || t.status === "In Progress").length;
  const overdue = tasks.filter((t) => t.status === "Overdue").length;

  const productivity = total ? Math.round((completed / total) * 100) : 0;
  let level = "Poor";
  if (productivity >= 90) level = "Excellent";
  else if (productivity >= 70) level = "Good";
  else if (productivity >= 50) level = "Average";

  const statusDist = ["Pending", "In Progress", "Completed", "Overdue"].map((s) => ({
    name: s,
    value: tasks.filter((t) => t.status === s).length,
  }));

  const catMap = {};
  tasks.forEach((t) => {
    catMap[t.category] = (catMap[t.category] || 0) + 1;
  });
  const categoryDist = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekly = days.map((d, i) => {
    const count = tasks.filter((t) => {
      const dt = new Date(t.updatedAt);
      return dt.getDay() === i && t.status === "Completed";
    }).length;
    return { day: d, completed: count };
  });

  res.json({
    cards: { total, pending, completed, overdue },
    productivity,
    level,
    statusDist,
    categoryDist,
    weekly,
  });
};

export const getReports = getDashboard;
