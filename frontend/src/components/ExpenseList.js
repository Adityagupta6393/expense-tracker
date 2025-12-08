import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = async () => {
    const res = await axios.get("https://expense-tracker-backend-neml.onrender.com/expenses");
    setExpenses(res.data);
  };

  const deleteExpense = async (id) => {
    await axios.delete(`https://expense-tracker-backend-neml.onrender.com/expense/${id}`);
    fetchExpenses();
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div>
      <h2>🧾 All Expenses</h2>
      {expenses.map((exp) => (
        <div key={exp._id} style={{ border: "1px solid #ccc", margin: 5, padding: 5 }}>
          <b>{exp.title}</b> — ₹{exp.amount} ({exp.category})
          <button onClick={() => deleteExpense(exp._id)}>❌</button>
        </div>
      ))}
    </div>
  );
}
