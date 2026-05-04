import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(ArcElement, Tooltip, Legend);

const API =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/expenses"
    : "https://backend-expenseapp-7.onrender.com/api/expenses";

function App() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [date, setDate] = useState("");

  const [filter, setFilter] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // NEW BUDGET STATE
  const [budget, setBudget] = useState("");

  // FETCH EXPENSES
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

  // ADD EXPENSE
  const handleAdd = async () => {
    if (!title || !amount || !category || !date) {
      alert("Please fill all fields");
      return;
    }

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

  // FILTER
  const filteredExpenses = expenses
    .filter((item) => !filter || item.category === filter)
    .filter(
      (item) => !filterDate || item.date?.slice(0, 10) === filterDate
    );

  // TOTAL EXPENSE
  const getTotal = () => {
    return filteredExpenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
  };

  // DASHBOARD VALUES
  const totalExpenses = getTotal();
  const totalBudget = Number(budget) || 0;
  const remaining = totalBudget - totalExpenses;

  // THIS MONTH EXPENSE
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthExpense = expenses.reduce((sum, item) => {
    const expenseDate = new Date(item.date);

    if (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    ) {
      return sum + Number(item.amount);
    }

    return sum;
  }, 0);

  // CHART DATA
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
            "#ff9800",
          ],
        },
      ],
    };
  };

  // DOWNLOAD PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Expense Report", 14, 20);

    const tableColumn = ["Title", "Amount", "Category", "Date"];

    const tableRows = [];

    filteredExpenses.forEach((expense) => {
      const expenseData = [
        expense.title,
        `₹${expense.amount}`,
        expense.category,
        expense.date?.slice(0, 10),
      ];

      tableRows.push(expenseData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.text(
      `Total Expense: ₹${getTotal()}`,
      14,
      doc.lastAutoTable.finalY + 15
    );

    doc.save("Expense_Report.pdf");
  };

  return (
    <div className="logo-container">
      <h1>Expense Tracker💰</h1>
      
      {/* DASHBOARD SECTION */}

      <div className="dashboard">

        <div className="dashboard-card total-card">
          <h3>Total Expenses</h3>
          <h2>₹{totalExpenses}</h2>
        </div>

        <div className="dashboard-card month-card">
          <h3>This Month</h3>
          <h2>₹{thisMonthExpense}</h2>
        </div>

        <div className="dashboard-card budget-card">
          <h3>Total Budget</h3>
          <h2>₹{totalBudget}</h2>
        </div>

        <div className="dashboard-card remaining-card">
          <h3>Remaining</h3>
          <h2>₹{remaining}</h2>
        </div>

      </div>
      {/* FORM */}

      <div className="card">

        <input
          type="text"
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* BUDGET INPUT */}

        <input
          type="number"
          placeholder="Enter Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />

        <button onClick={handleAdd}>Add Expense</button>

      </div>

      {/* FILTERS */}

      <div className="card" style={{ marginTop: "25px" }}>

        <h3>Filter by Category</h3>

        <select onChange={(e) => setFilter(e.target.value)}>

          <option value="">All</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Provisions">Provisions</option>

        </select>

        <h3>Filter by Date</h3>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />

        <button
          onClick={downloadPDF}
          style={{
            background: "#673ab7",
            marginTop: "15px",
          }}
        >
          Download Expense
        </button>

      </div>

      {/* EXPENSE LIST */}

      <div className="expense-list">

        <h3>Expenses List</h3>

        {filteredExpenses.length === 0 ? (
          <p>No expenses found</p>
        ) : (
          filteredExpenses.map((item) => (
            <div className="expense-item" key={item._id}>

              <div className="expense-info">
                <strong>{item.title}</strong>

              <p>
                {item.category} - ₹{item.amount}
              </p>

              <p>
                Date - {item.date?.slice(0, 10)}
              </p>
              </div>

              <div className="btn-group">

                <button
                  className="edit-btn"
                  onClick={() => handleEdit(item._id)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>

              </div>

            </div>
          ))
        )}

      </div>

      {/* CHART */}

      <div className="chart-container">

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