// ==================== CONFIGURATION ====================
const BASE_URL = "http://localhost:5000";  // Backend API base URL

// Global arrays to hold data from backend
let teamMembers = [];   
let expenses = [];      


// ==================== HELPER FUNCTIONS ====================

// Generate a unique ID (used for temporary purposes if needed)
const uid = () => Date.now() + Math.floor(Math.random() * 100000);

// Filter expenses by status (approved / cancelled / pending)
const byStatus = (status) => expenses.filter(e => e.status === status);


// ==================== UI NAVIGATION ====================

// Switch between different sections (Home, Approvals, Reports, etc.)
function showSection(sectionId, element) {
  // Hide all sections
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));

  // Show selected section
  document.getElementById(sectionId).classList.add("active");

  // Update active menu highlight
  document.querySelectorAll(".menu li").forEach(li => li.classList.remove("active"));
  element.classList.add("active");

  // Render content depending on section
  if (sectionId === "home") renderSummary();
  if (sectionId === "approvals") renderApprovals();
  if (sectionId === "reports") generateReport();
}


// ==================== SUMMARY DASHBOARD ====================

// Display summary cards (total expenses, approved, cancelled, pending, team members)
function renderSummary() {
  const total = expenses.length;
  const approved = byStatus("approved").length;
  const cancelled = byStatus("cancelled").length;
  const pending = byStatus("pending").length;

  document.getElementById("summaryCards").innerHTML = `
    <div class="card"><h3>Total Expenses</h3><div class="num">${total}</div></div>
    <div class="card"><h3>Approved</h3><div class="num">${approved}</div></div>
    <div class="card"><h3>Cancelled</h3><div class="num">${cancelled}</div></div>
    <div class="card"><h3>Pending</h3><div class="num">${pending}</div></div>
    <div class="card"><h3>Team Members</h3><div class="num">${teamMembers.length}</div></div>
  `;
}


// ==================== TEAM MEMBERS ====================

// Render team list on UI
function renderTeam() {
  const list = document.getElementById("teamList");
  list.innerHTML = "";
  teamMembers.forEach((m, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${m.name} (Age: ${m.age}, Phone: ${m.phone})`;
    list.appendChild(li);
  });
  document.getElementById("memberCount").textContent = teamMembers.length;
}

// Render dropdown for assigning expenses to team members
function renderTeamDropdown() {
  const dd = document.getElementById("assignedTo");
  dd.innerHTML = "";
  teamMembers.forEach(m => {
    const o = document.createElement("option");
    o.value = m._id || m.id;  // Use MongoDB _id
    o.textContent = m.name;
    dd.appendChild(o);
  });
}

// Add a new team member (POST request to backend)
async function addTeamMember() {
  const name = document.getElementById("teamMemberName").value.trim();
  const age = document.getElementById("teamMemberAge").value.trim();
  const phone = document.getElementById("teamMemberPhone").value.trim();

  // ✅ Input validation
  if (!name) return alert("Name required");
  const ageNum = Number(age);
  if (!ageNum || ageNum < 18 || ageNum > 80) return alert("Age must be 18-80");
  if (!/^\d{10}$/.test(phone)) return alert("Phone must be 10 digits");

  // ✅ Send request to backend
  const response = await fetch(`${BASE_URL}/api/team`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, age: ageNum, phone })
  });

  if (response.ok) {
    const member = await response.json();
    teamMembers.push(member);   // Add to local array
    renderTeam();               // Update UI
    renderTeamDropdown();       
    renderSummary();            
  } else {
    alert("Error saving member");
  }

  // ✅ Clear input fields
  document.getElementById("teamMemberName").value = "";
  document.getElementById("teamMemberAge").value = "";
  document.getElementById("teamMemberPhone").value = "";
}

// Load all team members from backend (GET request)
async function loadTeamMembers() {
  try {
    const res = await fetch(`${BASE_URL}/api/team`);
    teamMembers = await res.json();
    renderTeam();
    renderTeamDropdown();
    renderSummary();
  } catch (err) {
    console.error(err);
    alert("Cannot load team members from backend");
  }
}


// ==================== EXPENSES ====================

// Submit new expense (POST request to backend)
async function submitExpense() {
  const amount = Number(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const assignedToId = document.getElementById("assignedTo").value;
  const description = document.getElementById("description").value.trim();

  // ✅ Input validation
  if (!amount || amount <= 0) return alert("Amount must be > 0");
  if (!date) return alert("Date required");
  if (!category) return alert("Category required");
  if (!assignedToId) return alert("Select team member");
  if (description.length < 3) return alert("Description too short");

  // Find the selected team member
  const member = teamMembers.find(m => String(m._id || m.id) === String(assignedToId));
  if (!member) return alert("Selected member not found");

  // Data to send to backend
  const payload = {
    amount, date, category, assignedTo: member.name, description, status: "pending"
  };

  try {
    // Send POST request
    const res = await fetch(`${BASE_URL}/api/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Save in local array
    const saved = await res.json();
    expenses.push({
      id: saved._id,
      ...payload
    });

    // Clear form fields
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
    document.getElementById("description").value = "";

    renderApprovals();
    renderSummary();
    alert("Expense submitted for approval!");
  } catch (err) {
    console.error(err);
    alert("Error submitting expense to backend");
  }
}

// Create an approval row for expense
function approvalRow(exp) {
  const div = document.createElement("div");
  div.className = "approval";
  div.innerHTML = `
    <span><b>${exp.assignedTo}</b> | ${exp.category} | ₹${exp.amount} | ${exp.date}<br>
    <span class="muted">${exp.description}</span></span>
    <div>
      <button onclick="updateStatus('${exp.id}','approved')">Approve</button>
      <button onclick="updateStatus('${exp.id}','cancelled')">Cancel</button>
    </div>
  `;
  return div;
}

// Render all pending approvals
function renderApprovals() {
  const container = document.getElementById("approvalList");
  container.innerHTML = "";

  expenses.filter(e => e.status === "pending")
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .forEach(exp => container.appendChild(approvalRow(exp)));

  if (!container.children.length) container.innerHTML = "<p class='muted'>No pending approvals.</p>";
}

// Update expense status (Approve / Cancel)
async function updateStatus(id, status) {
  try {
    const res = await fetch(`${BASE_URL}/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const updated = await res.json();
    const exp = expenses.find(e => e.id === id);
    if (exp) exp.status = updated.status;

    renderApprovals();
    renderSummary();
  } catch (err) {
    console.error(err);
    alert("Error updating status");
  }
}


// ===============================
// REPORTS FUNCTIONS
// ===============================

// Generate a report and display it in the Reports section
async function generateReport() {
  const filter = document.getElementById("reportFilter").value;  // Get selected filter
  const container = document.getElementById("reportOutput");     // Output div for the report

  try {
    // 1. Fetch ALL expenses from backend (MongoDB)
    const res = await fetch(`${BASE_URL}/api/expenses`);
    let data = await res.json();

    // 2. Apply filter (approved, cancelled, or all)
    if (filter !== "all") {
      data = data.filter(e => e.status === filter);
    }

    // 3. If no data found, show a message
    if (!data.length) {
      container.innerHTML = "<p class='muted'>No expenses found for this filter.</p>";
      return;
    }

    // 4. Build an HTML table
    let table = `
      <table border="1" cellspacing="0" cellpadding="6" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th>Date</th>
            <th>Category</th>
            <th>Amount (₹)</th>
            <th>Assigned To</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Loop through all expenses and add rows
    data.forEach(exp => {
      table += `
        <tr>
          <td>${exp.date}</td>
          <td>${exp.category}</td>
          <td>${exp.amount}</td>
          <td>${exp.assignedTo}</td>
          <td>${exp.description}</td>
          <td>${exp.status}</td>
        </tr>
      `;
    });

    table += `</tbody></table>`;

    // 5. Insert the table into the container
    container.innerHTML = table;

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p class='muted'>⚠️ Error loading report from backend</p>";
  }
}

// Export the same report as a CSV file
async function exportCSV() {
  const filter = document.getElementById("reportFilter").value;

  try {
    // 1. Fetch all expenses again from backend
    const res = await fetch(`${BASE_URL}/api/expenses`);
    let data = await res.json();

    // 2. Apply filter (same as in generateReport)
    if (filter !== "all") {
      data = data.filter(e => e.status === filter);
    }

    // 3. If no data, stop
    if (!data.length) {
      alert("No data to export");
      return;
    }

    // 4. Convert to CSV format
    let csv = "Date,Category,Amount,Assigned To,Description,Status\n";
    data.forEach(e => {
      csv += `${e.date},${e.category},${e.amount},${e.assignedTo},"${e.description}",${e.status}\n`;
    });

    // 5. Create a file download for CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expense_report.csv";   // File name
    a.click();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    alert("⚠️ Error exporting report from backend");
  }
}

// const totals = data.reduce((acc, e) => {
//   acc[e.category] = (acc[e.category] || 0) + e.amount;
//   return acc;
// }, {});





// ==================== INITIALIZATION ====================

// Load everything on page start
async function init() {
  // Load expenses from backend
  try {
    const res = await fetch(`${BASE_URL}/api/expenses`);
    const data = await res.json();
    expenses = data.map(e => ({
      id: e._id,
      amount: e.amount,
      date: e.date,
      category: e.category,
      assignedTo: e.assignedTo,
      description: e.description,
      status: e.status
    }));
  } catch (err) {
    console.error(err);
    alert("Cannot load expenses from backend");
  }

  // Load team members from backend
  await loadTeamMembers();

  // Render UI
  renderApprovals();
  renderSummary();
}




// Run init when page loads
init();

