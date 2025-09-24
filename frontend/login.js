const BASE_URL = "http://localhost:5000";

// ===== Signup =====
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;

  if (password !== confirm) {
    document.getElementById("signupMsg").textContent = "Passwords do not match!";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById("signupMsg").textContent = "✅ Account created!";
    } else {
      document.getElementById("signupMsg").textContent = data.error;
    }
  } catch (err) {
    document.getElementById("signupMsg").textContent = "⚠️ Signup failed";
  }
});

// ===== Login =====
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("loggedInUser", data.username); // store login session
      document.getElementById("container").style.display = "none";
      document.getElementById("welcomePage").style.display = "block";
      document.getElementById("welcomeMsg").textContent = `Welcome 🎉 ${data.username}`;
    } else {
      document.getElementById("loginMsg").textContent = data.error;
    }
  } catch (err) {
    document.getElementById("loginMsg").textContent = "⚠️ Login failed";
  }
});

// ===== Logout =====
function logout() {
  localStorage.removeItem("loggedInUser");
  document.getElementById("welcomePage").style.display = "none";
  document.getElementById("container").style.display = "flex";
}



const container = document.getElementById('container');
const signUpBtn = document.getElementById('signUp');
const signInBtn = document.getElementById('signIn');

signUpBtn.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

signInBtn.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

// Signup
// Signup
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const confirm = document.getElementById("signupConfirm").value.trim();
  const signupMsg = document.getElementById("signupMsg");

  // ✅ Username validation: 6–10 chars, must have letters and numbers
  const usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,10}$/;
  if (!usernameRegex.test(username)) {
    signupMsg.textContent = "Username must be 6-10 characters with letters and numbers!";
    return;
  }

  // ✅ Password validation: 7–10 chars, must have numbers & special characters
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,10}$/;
  if (!passwordRegex.test(password)) {
    signupMsg.textContent = "Password must be 7-10 characters with numbers & special characters!";
    return;
  }

  if (password !== confirm) {
    signupMsg.textContent = "Passwords do not match!";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const exists = users.some(user => user.username === username);

  if (exists) {
    signupMsg.textContent = "Username already exists!";
    return;
  }

  users.push({ username, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup successful! Please login.");
  container.classList.remove("right-panel-active");
});


// Login
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const loginMsg = document.getElementById("loginMsg");

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    showWelcome(user);
  } else {
    loginMsg.textContent = "Invalid username or password!";
  }
});

// Show Welcome Page
function showWelcome(user) {
  document.querySelector(".container").style.display = "none";
  const welcome = document.getElementById("welcomePage");
  document.getElementById("welcomeMsg").textContent = "Welcome, " + user.username + " 🎉";
  welcome.style.display = "block";
}

// Logout
function logout() {
  localStorage.removeItem("loggedInUser");
  document.querySelector(".container").style.display = "block";
  document.getElementById("welcomePage").style.display = "none";
  container.classList.remove("right-panel-active");
}

// Dark/Light mode toggle
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    themeToggle.textContent = "☀️ Light Mode";
  } else {
    themeToggle.textContent = "🌙 Dark Mode";
  }
});


