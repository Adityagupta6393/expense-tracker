const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Expense = require('./models/Expense');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
app.post('/add', async (req, res) => {
  const { title, amount, category } = req.body;
  const expense = new Expense({ title, amount, category });
  await expense.save();
  res.json({ message: 'Expense Added', expense });
});

app.get('/expenses', async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

app.delete('/expense/:id', async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: 'Expense Deleted' });
});

app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));
