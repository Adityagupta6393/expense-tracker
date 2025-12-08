import React, { useState } from "react";
import axios from "axios";

export default function AddExpense() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/add", { title, amount, category });
    alert("Expense Added!");
    setTitle(""); setAmount(""); setCategory("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
      <input placeholder="Amount" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} required />
      <input placeholder="Category" value={category} onChange={(e)=>setCategory(e.target.value)} required />
      <button type="submit">Add Expense</button>
    </form>
  );
}
