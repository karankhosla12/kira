const API_BASE_URL = "https://tarks.karankhosla99.workers.dev";

// DOM Elements
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const logoutButton = document.getElementById("logout-button");
const usernameSpan = document.getElementById("username");

let currentUser = null;

// Check login status
function checkLogin() {
  const userCookie = document.cookie.split("; ").find(row => row.startsWith("user="));
  if (userCookie) {
    currentUser = userCookie.split("=")[1];
    showDashboard(currentUser);
    loadProjects();
    loadTasks();
  } else {
    showAuthSection();
  }
}

// Show Auth Section
function showAuthSection() {
  authSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
}

// Show Dashboard Section
function showDashboard(email) {
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  usernameSpan.textContent = email; // Display the user's email
}

// Handle Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_Id: email, password: password }),
    });

    if (response.ok) {
      const user = await response.json();
      if (user) {
        // Set cookie with user's email
        document.cookie = `user=${email}; path=/; max-age=3600`; // Expires in 1 hour
        showDashboard(email);
      } else {
        alert("Invalid email or password");
      }
    } else {
      alert("Login failed");
    }
  } catch (error) {
    console.error("Login failed:", error);
  }
});

// Handle Signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;
  const email = document.getElementById("signup-email").value;
  const phone = document.getElementById("signup-phone").value;

  try {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email_Id: email, phoneNumber: phone }),
    });

    if (response.ok) {
      alert("Signup successful! Please log in.");
      loginForm.reset();
      signupForm.reset();
    } else {
      alert("Signup failed");
    }
  } catch (error) {
    console.error("Signup failed:", error);
  }
});

// Logout
logoutButton.addEventListener("click", () => {
  document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; // Delete cookie
  showAuthSection();
});

// Check login status on page load
checkLogin();
