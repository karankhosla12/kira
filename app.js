const API_BASE_URL = "https://tarks.karankhosla99.workers.dev";

// DOM Elements
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const usernameDisplay = document.getElementById("username-display");

// Check authentication status on page load
document.addEventListener("DOMContentLoaded", function () {
  checkAuthStatus();
});

// Login or Signup
async function loginOrSignup(isSignup) {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  const endpoint = isSignup ? `${API_BASE_URL}/users` : `${API_BASE_URL}/login`;
  const method = isSignup ? "POST" : "POST";

  try {
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      document.cookie = `auth_status=true; username=${username}; path=/`;
      showDashboard(username);
    } else {
      alert(isSignup ? "Signup failed." : "Invalid login.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

// Show Dashboard
function showDashboard(username) {
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  usernameDisplay.textContent = username;
}

// Logout
function logout() {
  document.cookie = "auth_status=; username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
  authSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
}

// Check Authentication Status
function checkAuthStatus() {
  const cookies = document.cookie.split("; ");
  const authStatus = cookies.find((cookie) => cookie.startsWith("auth_status=true"));
  const username = cookies.find((cookie) => cookie.startsWith("username="))?.split("=")[1];

  if (authStatus && username) {
    showDashboard(username);
  } else {
    authSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
  }
}

// Perform Actions (Create, Delete, View, Filter, Update)
async function performAction(action) {
  let endpoint = "";
  let method = "";
  let body = null;

  switch (action) {
    case "createUser":
      const newUsername = prompt("Enter new username:");
      const newPassword = prompt("Enter password:");
      if (!newUsername || !newPassword) return;
      endpoint = `${API_BASE_URL}/users`;
      method = "POST";
      body = JSON.stringify({ username: newUsername, password: newPassword });
      break;
    case "deleteUser":
      const username = prompt("Enter username to delete:");
      if (!username) return;
      endpoint = `${API_BASE_URL}/users/${username}`;
      method = "DELETE";
      break;
    case "createProject":
      const projectName = prompt("Enter project name:");
      const projectDescription = prompt("Enter project description:");
      if (!projectName) return;
      endpoint = `${API_BASE_URL}/projects`;
      method = "POST";
      body = JSON.stringify({ project_name: projectName, project_description: projectDescription });
      break;
    case "deleteProject":
      const projectId = prompt("Enter project ID to delete:");
      if (!projectId) return;
      endpoint = `${API_BASE_URL}/projects/${projectId}`;
      method = "DELETE";
      break;
    case "createTask":
      const taskName = prompt("Enter task name:");
      const taskDescription = prompt("Enter task description:");
      const assignedTo = prompt("Assign task to (username):");
      const assignedBy = prompt("Assigned by (your username):");
      const deadline = prompt("Enter deadline (YYYY-MM-DD):");
      const projectID = prompt("Enter project ID:");
      const status = prompt("Enter task status (0=Pending, 1=In Progress, 2=Completed):");
      if (!taskName || !assignedTo || !projectID) return;
      endpoint = `${API_BASE_URL}/tasks`;
      method = "POST";
      body = JSON.stringify({
        taskname: taskName,
        taskdescription: taskDescription,
        assigned_to: assignedTo,
        assigned_by: assignedBy,
        deadline: deadline,
        projectid: projectID,
        status: status,
      });
      break;
    case "deleteTask":
      const taskId = prompt("Enter task ID to delete:");
      if (!taskId) return;
      endpoint = `${API_BASE_URL}/tasks/${taskId}`;
      method = "DELETE";
      break;
    case "viewTasks":
      endpoint = `${API_BASE_URL}/tasks`;
      method = "GET";
      break;
    case "filterTasksByProject":
      const projectIdFilter = prompt("Enter project ID to filter tasks:");
      if (!projectIdFilter) return;
      endpoint = `${API_BASE_URL}/tasks?projectid=${projectIdFilter}`;
      method = "GET";
      break;
    case "getTasksAssignedToUser":
      const assignedToUser = prompt("Enter username to view assigned tasks:");
      if (!assignedToUser) return;
      endpoint = `${API_BASE_URL}/tasks/assigned/${assignedToUser}`;
      method = "GET";
      break;
    case "getTasksAssignedByUser":
      const assignedByUser = prompt("Enter username to view tasks assigned by:");
      if (!assignedByUser) return;
      endpoint = `${API_BASE_URL}/tasks/assigned_by/${assignedByUser}`;
      method = "GET";
      break;
    case "getTask":
      const taskIdView = prompt("Enter task ID to view:");
      if (!taskIdView) return;
      endpoint = `${API_BASE_URL}/tasks/${taskIdView}`;
      method = "GET";
      break;
    case "updateTask":
      const taskIdUpdate = prompt("Enter task ID to update:");
      if (!taskIdUpdate) return;
      const updatedTaskName = prompt("Enter updated task name:");
      const updatedTaskDescription = prompt("Enter updated task description:");
      const updatedAssignedTo = prompt("Enter updated assigned to (username):");
      const updatedAssignedBy = prompt("Enter updated assigned by (username):");
      const updatedDeadline = prompt("Enter updated deadline (YYYY-MM-DD):");
      const updatedProjectID = prompt("Enter updated project ID:");
      const updatedStatus = prompt("Enter updated task status (0=Pending, 1=In Progress, 2=Completed):");
      endpoint = `${API_BASE_URL}/tasks/${taskIdUpdate}`;
      method = "PUT";
      body = JSON.stringify({
        taskname: updatedTaskName,
        taskdescription: updatedTaskDescription,
        assigned_to: updatedAssignedTo,
        assigned_by: updatedAssignedBy,
        deadline: updatedDeadline,
        projectid: updatedProjectID,
        status: updatedStatus,
      });
      break;
    default:
      alert("Invalid action.");
      return;
  }

  try {
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? body : null,
    });

    const data = await response.json();
    alert(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}
