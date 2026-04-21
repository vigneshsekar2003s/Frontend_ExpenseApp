import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);


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
    const res = await axios.get("https://expense-backend.onrender.com/api/expenses");
    setExpenses(res.data);
  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAdd = async () => {
    try {
      const res = await axios.post("https://expense-backend.onrender.com/api/expenses", {
        title,
        amount,
        category,
        date,
      });

      alert("Expense Added");

      setTitle("");
      setAmount("");
      setCategory("");

      fetchExpenses();
    } catch (err) {
      console.log(err);
      alert("Error");
    }
  };

  const handleDelete = async (id) => {
  try {
    await axios.delete(`https://expense-backend.onrender.com/api/expenses/${id}`);
    fetchExpenses(); 
  } catch (err) {
    console.log(err);
  }
};

const handleEdit = async (id) => {
  const newTitle = prompt("Enter new title");
  const newAmount = prompt("Enter new amount");
  const newCategory = prompt("Enter new category");

  try {
    await axios.put(`https://expense-backend.onrender.com/api/expenses/${id}`, {
      title: newTitle,
      amount: newAmount,
      category: newCategory,
    });

    fetchExpenses();
  } catch (err) {
    console.log(err);
  }
};

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
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4caf50", "#9c27b0"],
      },
    ],
  };
};

const getTotal = () => {
  return filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
};

const filteredExpenses = expenses
  .filter((item) => !filter || item.category === filter)
  .filter((item) => !filterDate || item.date?.slice(0, 10) === filterDate);

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

    <h3>Filter by Category</h3>
    <select onChange={(e) => setFilter(e.target.value)}>
      <option value="">All</option>
      <option value="Food">Food</option>
      <option value="Travel">Travel</option>
      <option value="Provisions">Provisions</option>
    </select>

    <div style={{ marginTop: "30px" }}>
      <h3>Expenses List</h3>

      {expenses.length === 0 ? (
        <p>No expenses yet</p>
      ) : (
       expenses
    .filter((item) => !filter || item.category === filter)
    .map((item) => (
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

    <div style={{ width: "400px", margin: "40px auto" }}>
      <h3>Expense Chart</h3>
      {filteredExpenses.length > 0 && (
      <Pie data={getChartData()} />
      )}
    </div>
</div>
);
}

export default App;