import Category from "../models/Category.js";

const DEFAULTS = [
  { name: "Academic", color: "#7C3AED" },
  { name: "Work", color: "#2563EB" },
  { name: "Personal", color: "#10B981" },
  { name: "Health", color: "#EF4444" },
  { name: "Religious", color: "#F59E0B" },
];

export const getCategories = async (req, res) => {
  let cats = await Category.find({ userId: req.user._id });
  if (cats.length === 0) {
    cats = await Category.insertMany(
      DEFAULTS.map((c) => ({ ...c, userId: req.user._id }))
    );
  }
  res.json(cats);
};

export const createCategory = async (req, res) => {
  const cat = await Category.create({ ...req.body, userId: req.user._id });
  res.status(201).json(cat);
};

export const updateCategory = async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(cat);
};

export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
