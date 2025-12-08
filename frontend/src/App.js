import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import dayjs from 'dayjs';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function Sidebar({ onNav, active }){
  return (
    <aside className="sidebar">
      <div className="brand">ExpenseTracker</div>
      <nav>
        <button className={active==='dashboard'? 'active':''} onClick={()=>onNav('dashboard')}>Dashboard</button>
        <button className={active==='list'? 'active':''} onClick={()=>onNav('list')}>Expenses</button>
        <button className={active==='reports'? 'active':''} onClick={()=>onNav('reports')}>Reports</button>
      </nav>
      <div className="sidebar-foot">Student Project</div>
    </aside>
  );
}

function Topbar({ total }){
  return (
    <header className="topbar">
      <div className="search">📊 Expense Dashboard</div>
      <div className="top-actions">Total Spent: <span className="top-total">₹{total}</span></div>
    </header>
  );
}

function AddExpense({ onAdd }){
  const [form, setForm] = useState({ title:'', amount:'', category:'' });
  const [loading, setLoading] = useState(false);

  const submit = async (e)=>{
    e.preventDefault();
    if(!form.title || !form.amount) return alert('Add title and amount');
    try{
      setLoading(true);
      const res = await axios.post(`${API_BASE}/add`, { ...form, amount: Number(form.amount) });
      onAdd(res.data.expense);
      setForm({ title:'', amount:'', category:'' });
    }catch(err){
      console.error(err); alert('Add failed');
    }finally{ setLoading(false); }
  };

  return (
    <motion.form onSubmit={submit} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} className="card add-card">
      <h3>Add Expense</h3>
      <input name="title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Title" />
      <input name="amount" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} placeholder="Amount" type="number" />
      <input name="category" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} placeholder="Category (eg. Food)" />
      <button className="btn" type="submit" disabled={loading}>{loading? 'Adding...' : 'Add'}</button>
    </motion.form>
  );
}

function ExpenseItem({ e, onDelete }){
  return (
    <motion.div layout initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.98}} className="expense-row">
      <div>
        <strong>{e.title}</strong>
        <div className="meta">{e.category} • {dayjs(e.date).format('DD MMM YYYY')}</div>
      </div>
      <div className="row-right">
        <div className="amount">₹{e.amount}</div>
        <button className="del" onClick={()=>onDelete(e._id)}>Delete</button>
      </div>
    </motion.div>
  );
}

function ExpensesList({ items, onDelete }){
  return (
    <div className="card list-card">
      <h3>Expenses</h3>
      <AnimatePresence>
        {items.map(item=> (
          <ExpenseItem key={item._id} e={item} onDelete={onDelete} />
        ))}
      </AnimatePresence>
      {items.length===0 && <div className="empty">No expenses yet — add some to start.</div>}
    </div>
  );
}

function DashboardCharts({ expenses }){
  // Prepare last 6 months totals
  const monthsMap = {};
  for(let i=5;i>=0;i--){
    const m = dayjs().subtract(i, 'month').format('YYYY-MM');
    monthsMap[m] = 0;
  }
  expenses.forEach(ex => {
    const k = dayjs(ex.date).format('YYYY-MM');
    if(k in monthsMap) monthsMap[k] += Number(ex.amount || 0);
  });
  const labels = Object.keys(monthsMap).map(k=> dayjs(k+'-01').format('MMM'));
  const data = Object.values(monthsMap);

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Monthly spending',
        data,
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
      }
    ]
  };

  // category breakdown (pie)
  const byCat = {};
  expenses.forEach(ex => { const c = ex.category || 'Other'; byCat[c] = (byCat[c]||0) + Number(ex.amount||0); });
  const catLabels = Object.keys(byCat);
  const catValues = Object.values(byCat);

  return (
    <div className="charts-grid">
      <div className="card chart-card">
        <h4>Spending (last 6 months)</h4>
        <Line data={lineData} />
      </div>

      <div className="card chart-card">
        <h4>Category break-up</h4>
        <div className="pie-placeholder">
          <table className="cat-table">
            <thead><tr><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              {catLabels.map((c,i)=> (
                <tr key={c}><td>{c}</td><td>₹{Math.round(catValues[i])}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [view, setView] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async ()=>{
    try{
      setLoading(true);
      const res = await axios.get(`${API_BASE}/expenses`);
      setExpenses(res.data.sort((a,b)=> new Date(b.date) - new Date(a.date)));
    }catch(err){
      console.error(err);
      alert('Failed to fetch — start backend & MongoDB');
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchExpenses(); }, []);

  const handleAdd = (newExp) => {
    setExpenses(prev => [newExp, ...prev]);
  };

  const handleDelete = async (id) =>{
    if(!window.confirm('Delete this expense?')) return;
    try{
      await axios.delete(`${API_BASE}/expense/${id}`);
      setExpenses(prev=> prev.filter(p=>p._id !== id));
    }catch(err){ console.error(err); alert('Delete failed'); }
  };

  const total = expenses.reduce((s,e)=> s + Number(e.amount||0), 0);

  return (
    <div className="app-root">
      <Sidebar onNav={setView} active={view} />
      <div className="main">
        <Topbar total={total} />
        <main className="content">
          <div className="grid-two">
            <AddExpense onAdd={handleAdd} />
            <div className="card summary-card">
              <h3>Summary</h3>
              <div className="summary-item">
                <div className="label">Total Expenses</div>
                <div className="value">₹{total}</div>
              </div>
              <div className="summary-item">
                <div className="label">Records</div>
                <div className="value">{expenses.length}</div>
              </div>
              <button className="btn" onClick={fetchExpenses}>Refresh</button>
            </div>
          </div>

          <div style={{marginTop:16}}>
            {view==='dashboard' && <DashboardCharts expenses={expenses} />}
            {view==='list' && <ExpensesList items={expenses} onDelete={handleDelete} />}
            {view==='reports' && <div className="card"><h3>Reports</h3><p>Export and more (coming soon)</p></div>}
          </div>

          {loading && <div className="loader">Loading...</div>}
        </main>
      </div>
    </div>
  );
}
