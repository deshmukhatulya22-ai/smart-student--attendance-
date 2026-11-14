
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "data.json";

function readData() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, "[]");
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

app.get("/", (req, res) => {
  res.send("Smart Student Attendance Backend Running!");
});

app.post("/api/attendance", (req, res) => {
  const { name, roll, email, branch, date, status } = req.body;

  if (!name || !roll || !email || !branch || !date || !status) {
    return res.status(400).json({ message: "All fields required" });
  }

  const data = readData();

  const exists = data.some(
    item => item.roll === roll && item.date === date
  );

  if (exists) {
    return res.status(409).json({ message: "Attendance already marked" });
  }

  data.push({ name, roll, email, branch, date, status });
  saveData(data);

  res.json({ message: "Attendance saved successfully" });
});

app.get("/api/attendance", (req, res) => {
  let data = readData();

  if (req.query.date) {
    data = data.filter(item => item.date === req.query.date);
  }

  res.json(data);
});

app.get("/api/dashboard", (req, res) => {
  const data = readData();

  const total = data.length;
  const present = data.filter(item => item.status === "Present").length;
  const absent = data.filter(item => item.status === "Absent").length;

  res.json({
    total,
    present,
    absent,
    percentage: total ? ((present / total) * 100).toFixed(2) : 0
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
