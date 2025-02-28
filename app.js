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

    const endpoint = isSignup ? "/users" : "/login";
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
            loadAllUsers(); // Load all users for task assignment
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
        loadAllUsers(); // Load all users for task assignment
    }
}

// Load All Users for Task Assignment
async function loadAllUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const users = await response.json();
        const userSelect = document.getElementById("assignTo");
        userSelect.innerHTML = "<option value=''>Select User</option>";
        users.forEach(user => {
            const option = document.createElement("option");
            option.value = user.email_Id;
            option.text = user.email_Id;
            userSelect.appendChild(option);
        });
    } catch (error) {
        showToast("Failed to load users.", "error");
    }
}

// Load Tasks
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/assigned/${currentUser}`);
        const tasks = await response.json();

        const taskList = document.getElementById("taskList");
        taskList.innerHTML = "";

        tasks.forEach(task => {
            const li = document.createElement("li");
            li.innerText = `${task.taskname} - ${task.taskdescription} (Due: ${task.deadline}) - Status: ${task.status}`;
            const editBtn = document.createElement("button");
            editBtn.innerText = "Edit";
            editBtn.onclick = () => openEditTaskModal(task);
            li.appendChild(editBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "Delete";
            deleteBtn.onclick = () => deleteTask(task.taskid);
            li.appendChild(deleteBtn);

            taskList.appendChild(li);
        });
    } catch (error) {
        showToast("Failed to load tasks.", "error");
    }
}

// Open Edit Task Modal
function openEditTaskModal(task) {
    document.getElementById("editTaskId").value = task.taskid;
    document.getElementById("editTaskName").value = task.taskname;
    document.getElementById("editTaskDesc").value = task.taskdescription;
    document.getElementById("editTaskDeadline").value = task.deadline;
    document.getElementById("editTaskStatus").value = task.status;
    document.getElementById("assignTo").value = task.assigned_to;
    document.getElementById("editTaskModal").style.display = "block";
}

// Close Edit Task Modal
function closeEditTaskModal() {
    document.getElementById("editTaskModal").style.display = "none";
}

// Update Task
async function updateTask() {
    const taskId = document.getElementById("editTaskId").value;
    const taskname = document.getElementById("editTaskName").value;
    const taskdescription = document.getElementById("editTaskDesc").value;
    const deadline = document.getElementById("editTaskDeadline").value;
    const status = document.getElementById("editTaskStatus").value;
    const assigned_to = document.getElementById("assignTo").value;

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskname, taskdescription, deadline, status, assigned_to }),
        });

        if (response.ok) {
            loadTasks();
            closeEditTaskModal();
            showToast("Task updated successfully!", "success");
        } else {
            showToast("Failed to update task.", "error");
        }
    } catch (error) {
        showToast("An error occurred.", "error");
    }
}

// Delete Task
async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: "DELETE" });
        if (response.ok) {
            loadTasks();
            showToast("Task deleted successfully!", "success");
        } else {
            showToast("Failed to delete task.", "error");
        }
    } catch (error) {
        showToast("An error occurred.", "error");
    }
}

// Load Projects
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const projects = await response.json();

        const projectList = document.getElementById("projectList");
        projectList.innerHTML = "";

        projects.forEach(project => {
            const li = document.createElement("li");
            li.innerText = `${project.project_name}`;
            const viewTasksBtn = document.createElement("button");
            viewTasksBtn.innerText = "View Tasks";
            viewTasksBtn.onclick = () => viewTasksByProject(project.projectid);
            li.appendChild(viewTasksBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "Delete";
            deleteBtn.onclick = () => deleteProject(project.projectid);
            li.appendChild(deleteBtn);

            projectList.appendChild(li);
        });
    } catch (error) {
        showToast("Failed to load projects.", "error");
    }
}

// View Tasks by Project
async function viewTasksByProject(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks?projectid=${projectId}`);
        const tasks = await response.json();

        const taskList = document.getElementById("taskList");
        taskList.innerHTML = "";

        tasks.forEach(task => {
            const li = document.createElement("li");
            li.innerText = `${task.taskname} - ${task.taskdescription} (Due: ${task.deadline}) - Status: ${task.status}`;
            taskList.appendChild(li);
        });
    } catch (error) {
        showToast("Failed to load tasks for this project.", "error");
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
            body: JSON.stringify({ project_name: projectName, project_description: "A new project" }),
        });

        if (response.ok) {
            loadProjects();
            showToast("Project created successfully!", "success");
        } else {
            showToast("Failed to create project.", "error");
        }
    } catch (error) {
        showToast("An error occurred.", "error");
    }
}

// Delete Project
async function deleteProject(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, { method: "DELETE" });
        if (response.ok) {
            loadProjects();
            showToast("Project deleted successfully!", "success");
        } else {
            showToast("Failed to delete project.", "error");
        }
    } catch (error) {
        showToast("An error occurred.", "error");
    }
}
