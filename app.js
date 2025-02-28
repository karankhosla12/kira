const API_BASE_URL = "https://tarks.karankhosla99.workers.dev";

// DOM Elements
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const logoutButton = document.getElementById("logout-button");
const usernameSpan = document.getElementById("username");
const updateUserButton = document.getElementById("update-user-button");
const deleteUserButton = document.getElementById("delete-user-button");
const projectNameInput = document.getElementById("project-name");
const projectDescriptionInput = document.getElementById("project-description");
const addProjectButton = document.getElementById("add-project-button");
const projectList = document.getElementById("project-list");
const taskNameInput = document.getElementById("task-name");
const taskDescriptionInput = document.getElementById("task-description");
const taskAssignedToInput = document.getElementById("task-assigned-to");
const taskDeadlineInput = document.getElementById("task-deadline");
const taskProjectSelect = document.getElementById("task-project");
const addTaskButton = document.getElementById("add-task-button");
const taskList = document.getElementById("task-list");

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
function showDashboard(username) {
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  usernameSpan.textContent = username;
}

// Load Projects
function loadProjects() {
  fetch(`${API_BASE_URL}/projects`)
    .then(response => response.json())
    .then(projects => {
      projectList.innerHTML = "";
      projects.forEach(project => addProjectToDOM(project));
      updateProjectDropdown(projects);
    });
}

// Add Project to DOM
function addProjectToDOM(project) {
  const li = document.createElement("li");
  li.textContent = `${project.project_name}: ${project.project_description}`;
  projectList.appendChild(li);
}

// Update Project Dropdown
function updateProjectDropdown(projects) {
  taskProjectSelect.innerHTML = '<option value="">Select Project</option>';
  projects.forEach(project => {
    const option = document.createElement("option");
    option.value = project.projectid;
    option.textContent = project.project_name;
    taskProjectSelect.appendChild(option);
  });
}

// Load Tasks
function loadTasks() {
  fetch(`${API_BASE_URL}/tasks/assigned/${currentUser}`)
    .then(response => response.json())
    .then(tasks => {
      taskList.innerHTML = "";
      tasks.forEach(task => addTaskToDOM(task));
    });
}

// Add Task to DOM
function addTaskToDOM(task) {
  const li = document.createElement("li");
  li.textContent = `${task.taskname}: ${task.taskdescription} (Deadline: ${task.deadline})`;
  taskList.appendChild(li);
}

// Logout
logoutButton.addEventListener("click", () => {
  document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  showAuthSection();
});

// Check login status on page load
checkLogin();
