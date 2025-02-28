const API_BASE_URL = "https://tarks.karankhosla99.workers.dev";
let currentUser = null;

// Check Authentication Status
document.addEventListener("DOMContentLoaded", checkAuthStatus);

// Login or Sign Up
async function loginOrSignup(isSignup) {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Enter email and password");
        return;
    }

    const endpoint = isSignup ? "/users" : `/login`;
    const method = isSignup ? "POST" : "POST"; 

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_Id: email, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem("user", email);
        currentUser = email;
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        loadTasks();
        loadProjects();
    } else {
        alert(data.error || "Login failed");
    }
}

// Logout
function logout() {
    localStorage.removeItem("user");
    currentUser = null;
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
}

// Check Authentication
function checkAuthStatus() {
    const user = localStorage.getItem("user");
    if (user) {
        currentUser = user;
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        loadTasks();
        loadProjects();
    }
}

// Load Tasks
async function loadTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks/assigned/${currentUser}`);
    const tasks = await response.json();

    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.innerText = `${task.taskname} - ${task.taskdescription} (Due: ${task.deadline})`;
        const btn = document.createElement("button");
        btn.innerText = "Delete";
        btn.onclick = () => deleteTask(task.taskid);
        li.appendChild(btn);
        taskList.appendChild(li);
    });
}

// Create Task
async function createTask() {
    const taskname = document.getElementById("taskName").value;
    const taskdescription = document.getElementById("taskDesc").value;
    const deadline = document.getElementById("taskDeadline").value;

    const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskname, taskdescription, assigned_to: currentUser, assigned_by: currentUser, deadline, projectid: 1, status: 0 })
    });

    if (response.ok) {
        loadTasks();
    } else {
        alert("Failed to create task");
    }
}

// Delete Task
async function deleteTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: "DELETE" });
    if (response.ok) {
        loadTasks();
    } else {
        alert("Failed to delete task");
    }
}

// Load Projects
async function loadProjects() {
    const response = await fetch(`${API_BASE_URL}/projects`);
    const projects = await response.json();

    const projectList = document.getElementById("projectList");
    projectList.innerHTML = "";

    projects.forEach(project => {
        const li = document.createElement("li");
        li.innerText = `${project.project_name}`;
        const btn = document.createElement("button");
        btn.innerText = "Delete";
        btn.onclick = () => deleteProject(project.projectid);
        li.appendChild(btn);
        projectList.appendChild(li);
    });
}

// Create Project
async function createProject() {
    const projectName = document.getElementById("projectName").value;
    const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_name: projectName, project_description: "A new project" })
    });

    if (response.ok) {
        loadProjects();
    } else {
        alert("Failed to create project");
    }
}

// Delete Project
async function deleteProject(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, { method: "DELETE" });
    if (response.ok) {
        loadProjects();
    } else {
        alert("Failed to delete project");
    }
}
