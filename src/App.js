import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const API = window.location.hostname === "localhost"
  ? "http://localhost:5000/api/expenses"
  : "https://expense-backend.onrender.com/api/expenses";

function App() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("");
  const [filterDate, setFilterDate] = useState("");


  const fetchExpenses = async () => {
    try {
      const res = await axios.get(API);
      setExpenses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ADD
  const handleAdd = async () => {
    try {
      await axios.post(API, {
        title,
        amount,
        category,
        date,
      });

      alert("Expense Added");

      setTitle("");
      setAmount("");
      setCategory("");
      setDate("");

      fetchExpenses();
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data || err.message);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      fetchExpenses();
    } catch (err) {
      console.log(err);
    }
  };

  // EDIT
    const handleEdit = async (id) => {
    const newTitle = prompt("Enter new title");
    const newAmount = prompt("Enter new amount");
    const newCategory = prompt("Enter new category");

    try {
      await axios.put(`${API}/${id}`, {
        title: newTitle,
        amount: newAmount,
        category: newCategory,
      });

      fetchExpenses();
    } catch (err) {
      console.log(err);
    }
  };

  // FILTER LOGIC
  const filteredExpenses = expenses
    .filter((item) => !filter || item.category === filter)
    .filter((item) => !filterDate || item.date?.slice(0, 10) === filterDate);

  // TOTAL
  const getTotal = () => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  };

  // CHART
  const getChartData = () => {
    const categoryMap = {};

    filteredExpenses.forEach((item) => {
      const amount = Number(item.amount) || 0;

      if (categoryMap[item.category]) {
        categoryMap[item.category] += amount;
      } else {
        categoryMap[item.category] = amount;
      }
    });

    return {
      labels: Object.keys(categoryMap),
      datasets: [
        {
          label: "Expenses",
          data: Object.values(categoryMap),
          backgroundColor: [
            "#ff6384",
            "#36a2eb",
            "#ffce56",
            "#4caf50",
            "#9c27b0",
          ],
        },
      ],
    };
  };

  return (
    <div className="container">
      <h1>Expense Tracker</h1>
      <h2>Total: ₹{getTotal()}</h2>

      {/* FORM */}
      <div className="card">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={handleAdd}>Add Expense</button>
      </div>

      {/* FILTERS */}
      <h3>Filter by Category</h3>
      <select onChange={(e) => setFilter(e.target.value)}>
        <option value="">All</option>
        <option value="Food">Food</option>
        <option value="Travel">Travel</option>
        <option value="Provisions">Provisions</option>
      </select>

      <h3>Filter by Date</h3>
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />

      {/* LIST */}
      <div style={{ marginTop: "30px" }}>
        <h3>Expenses List</h3>

        {filteredExpenses.length === 0 ? (
          <p>No expenses yet</p>
        ) : (
          filteredExpenses.map((item) => (
            <div key={item._id} style={{ margin: "10px" }}>
              {item.title} - ₹{item.amount} ({item.category})

              <button
                style={{ marginLeft: "10px", background: "red", color: "white" }}
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>

              <button
                style={{ marginLeft: "10px", background: "blue", color: "white" }}
                onClick={() => handleEdit(item._id)}
              >
                Edit
              </button>
            </div>
          ))
        )}
      </div>

      {/* CHART */}
      <div style={{ width: "400px", margin: "40px auto" }}>
        <h3>Expense Chart</h3>
        {filteredExpenses.length > 0 ? (
          <Pie data={getChartData()} />
        ) : (
          <p>No data for chart</p>
        )}
      </div>
    </div>
  );
}

export default App;