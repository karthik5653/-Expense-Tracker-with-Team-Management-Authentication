const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/expenseDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// ================================
// Define Schemas & Models
// ================================

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  phone: String
});
const TeamMember = mongoose.model("TeamMember", teamSchema);

const expenseSchema = new mongoose.Schema({
  amount: Number,
  date: String,
  category: String,
  assignedTo: String,
  description: String,
  status: { type: String, default: "pending" } // pending | approved | cancelled
});
const Expense = mongoose.model("Expense", expenseSchema);

// ================================
// Routes
// ================================

// ===== TEAM MEMBERS =====
app.post("/api/team", async (req, res) => {
  try {
    const member = new TeamMember(req.body);
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/team", async (req, res) => {
  try {
    const members = await TeamMember.find();
    res.json(members);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== EXPENSES =====
app.post("/api/expenses", async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// login



// ================================
// Start Server
// ================================

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

