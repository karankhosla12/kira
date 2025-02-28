const API_BASE_URL = "https://tarks.karankhosla99.workers.dev";
let currentUser = null;

// Toast Notification Function
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Check Authentication Status
document.addEventListener("DOMContentLoaded", checkAuthStatus);

// Login or Sign Up
async function loginOrSignup(isSignup) {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showToast("Please enter both email and password.", "error");
        return;
    }

    const endpoint = isSignup ? "/users" : `/login`;
    const method = isSignup ? "POST" : "POST";

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email_Id: email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("user", email);
            currentUser = email;
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            loadTasks();
            loadProjects();
            showToast(isSignup ? "Signup successful!" : "Login successful!", "success");
        } else {
            showToast(data.error || "Login failed. Please try again.", "error");
        }
    } catch (error) {
        showToast("An error occurred. Please try again.", "error");
    }
}

// Logout
function logout() {
    localStorage.removeItem("user");
    currentUser = null;
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
    showToast("Logged out successfully.", "success");
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
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/assigned/${currentUser}`);
        const tasks = await response.json();

        const taskList = document.getElementById("taskList");
        taskList.innerHTML = "";

        tasks.forEach((task) => {
            const li = document.createElement("li");
            li.innerText = `${task.taskname} - ${task.taskdescription} (Due: ${task.deadline})`;
            const btn = document.createElement("button");
            btn.innerText = "Delete";
            btn.onclick = () => deleteTask(task.taskid);
            li.appendChild(btn);
            taskList.appendChild(li);
        });
    } catch (error) {
        showToast("Failed to load tasks. Please try again.", "error");
    }
}

// Create Task
async function createTask() {
    const taskname = document.getElementById("taskName").value;
    const taskdescription = document.getElementById("taskDesc").value;
    const deadline = document.getElementById("taskDeadline").value;

    if (!taskname || !taskdescription || !deadline) {
        showToast("Please fill in all task details.", "error");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                taskname,
                taskdescription,
                assigned_to: currentUser,
                assigned_by: currentUser,
                deadline,
                projectid: 1,
                status: 0,
            }),
        });

        if (response.ok) {
            loadTasks();
            showToast("Task created successfully!", "success");
        } else {
            showToast("Failed to create task. Please try again.", "error");
        }
    } catch (error) {
        showToast("An error occurred. Please try again.", "error");
    }
}

// Delete Task
async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            loadTasks();
            showToast("Task deleted successfully!", "success");
        } else {
            showToast("Failed to delete task. Please try again.", "error");
        }
    } catch (error) {
        showToast("An error occurred. Please try again.", "error");
    }
}

// Load Projects
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const projects = await response.json();

        const projectList = document.getElementById("projectList");
        projectList.innerHTML = "";

        projects.forEach((project) => {
            const li = document.createElement("li");
            li.innerText = `${project.project_name}`;
            const btn = document.createElement("button");
            btn.innerText = "Delete";
            btn.onclick = () => deleteProject(project.projectid);
            li.appendChild(btn);
            projectList.appendChild(li);
        });
    } catch (error) {
        showToast("Failed to load projects. Please try again.", "error");
    }
}

// Create Project
async function createProject() {
    const projectName = document.getElementById("projectName").value;

    if (!projectName) {
        showToast("Please enter a project name.", "error");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                project_name: projectName,
                project_description: "A new project",
            }),
        });

        if (response.ok) {
            loadProjects();
            showToast("Project created successfully!", "success");
        } else {
            showToast("Failed to create project. Please try again.", "error");
        }
    } catch (error) {
        showToast("An error occurred. Please try again.", "error");
    }
}

// Delete Project
async function deleteProject(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            loadProjects();
            showToast("Project deleted successfully!", "success");
        } else {
            showToast("Failed to delete project. Please try again.", "error");
        }
    } catch (error) {
        showToast("An error occurred. Please try again.", "error");
    }
}
