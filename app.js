const API_BASE_URL = "https://tarks.karankhosla99.workers.dev";

// DOM Elements
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const logoutButton = document.getElementById("logout-button");
const usernameSpan = document.getElementById("username");
const taskInput = document.getElementById("task-input");
const addTaskButton = document.getElementById("add-task-button");
const taskList = document.getElementById("task-list");

// Check login status
function checkLogin() {
  const userCookie = document.cookie.split("; ").find(row => row.startsWith("user="));
  if (userCookie) {
    const username = userCookie.split("=")[1];
    showDashboard(username);
    loadTasks(username);
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
function showDashboard(username) {
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  usernameSpan.textContent = username;
}

// Load Tasks
function loadTasks(username) {
  // Fetch tasks from the API (you need to implement this endpoint)
  fetch(`${API_BASE_URL}/tasks/assigned/${username}`)
    .then(response => response.json())
    .then(tasks => {
      taskList.innerHTML = "";
      tasks.forEach(task => addTaskToDOM(task));
    });
}

// Add Task to DOM
function addTaskToDOM(task) {
  const li = document.createElement("li");
  li.textContent = task.taskname;
  if (task.status === "completed") {
    li.classList.add("completed");
  }

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteTask(task.taskid));

  li.appendChild(deleteButton);
  taskList.appendChild(li);
}

// Add Task
addTaskButton.addEventListener("click", () => {
  const taskName = taskInput.value.trim();
  if (taskName) {
    const username = document.cookie.split("; ").find(row => row.startsWith("user=")).split("=")[1];
    fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskname: taskName, assigned_to: username }),
    })
      .then(response => response.json())
      .then(task => {
        addTaskToDOM(task);
        taskInput.value = "";
      });
  }
});

// Delete Task
function deleteTask(taskId) {
  fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: "DELETE" })
    .then(() => loadTasks(usernameSpan.textContent));
}

// Logout
logoutButton.addEventListener("click", () => {
  document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  showAuthSection();
});

// Check login status on page load
checkLogin();
