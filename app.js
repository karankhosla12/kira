const apiUrl = "https://tarks.karankhosla99.workers.dev"; // Your API URL

// DOM Elements
const showCreateTaskFormBtn = document.getElementById("show-create-task-form");
const createTaskForm = document.getElementById("create-task-form");
const createTaskBtn = document.getElementById("create-task-btn");
const showCreateProjectFormBtn = document.getElementById("show-create-project-form");
const createProjectForm = document.getElementById("create-project-form");
const createProjectBtn = document.getElementById("create-project-btn");
const tasksList = document.getElementById("tasks-list");
const projectsList = document.getElementById("projects-list");

// Filter Elements
const filterProject = document.getElementById("filter-project");
const filterStatus = document.getElementById("filter-status");
const filterAssignedTo = document.getElementById("filter-assigned-to");
const filterAssignedBy = document.getElementById("filter-assigned-by");
const applyFiltersBtn = document.getElementById("apply-filters-btn");

// Toggle the visibility of the Create Task Form
showCreateTaskFormBtn.addEventListener("click", () => {
    createTaskForm.classList.toggle("hidden");
});

// Toggle the visibility of the Create Project Form
showCreateProjectFormBtn.addEventListener("click", () => {
    createProjectForm.classList.toggle("hidden");
});

// Create a Task
createTaskBtn.addEventListener("click", async () => {
    const taskname = document.getElementById("task-name").value;
    const taskdescription = document.getElementById("task-description").value;
    const deadline = document.getElementById("task-deadline").value;
    const assigned_to = document.getElementById("task-assigned-to").value;
    const projectid = document.getElementById("task-project-id").value;
    const status = document.getElementById("task-status").value;

    const response = await fetch(`${apiUrl}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            taskname,
            taskdescription,
            assigned_to,
            deadline,
            projectid,
            status,
        }),
    });

    if (response.ok) {
        alert("Task created successfully!");
        getAllTasks(); // Refresh the task list
        createTaskForm.classList.add("hidden"); // Hide the form
    } else {
        alert("Error creating task");
    }
});

// Create a Project
createProjectBtn.addEventListener("click", async () => {
    const projectName = document.getElementById("project-name").value;
    const projectDescription = document.getElementById("project-description").value;

    const response = await fetch(`${apiUrl}/projects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            project_name: projectName,
            project_description: projectDescription,
        }),
    });

    if (response.ok) {
        alert("Project created successfully!");
        getAllProjects(); // Refresh the project list
        createProjectForm.classList.add("hidden"); // Hide the form
    } else {
        alert("Error creating project");
    }
});

// Fetch All Tasks
async function getAllTasks(filters = {}) {
    let url = `${apiUrl}/tasks`;
    if (filters.projectid) url += `?projectid=${filters.projectid}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.assigned_to) url += `&assigned_to=${filters.assigned_to}`;
    if (filters.assigned_by) url += `&assigned_by=${filters.assigned_by}`;

    const response = await fetch(url);
    const tasks = await response.json();

    if (response.ok) {
        tasksList.innerHTML = "<h2>All Tasks</h2>"; // Clear existing tasks
        tasks.forEach((task) => {
            const taskCard = document.createElement("div");
            taskCard.className = "task-card";
            taskCard.innerHTML = `
                <h3>${task.taskname}</h3>
                <p>${task.taskdescription}</p>
                <p>Status: ${task.status}</p>
                <p>Assigned to: ${task.assigned_to}</p>
                <button onclick="getTask(${task.taskid})">View</button>
                <button onclick="updateTask(${task.taskid})">Update</button>
                <button onclick="deleteTask(${task.taskid})">Delete</button>
            `;
            tasksList.appendChild(taskCard);
        });
    } else {
        alert("Error fetching tasks");
    }
}

// Fetch All Projects
async function getAllProjects() {
    const response = await fetch(`${apiUrl}/projects`);
    const projects = await response.json();

    if (response.ok) {
        projectsList.innerHTML = "<h2>All Projects</h2>"; // Clear existing projects
        projects.forEach((project) => {
            const projectCard = document.createElement("div");
            projectCard.className = "task-card"; // Using the same card style
            projectCard.innerHTML = `
                <h3>${project.project_name}</h3>
                <p>${project.project_description}</p>
                <button onclick="getProject(${project.projectid})">View</button>
                <button onclick="updateProject(${project.projectid})">Update</button>
                <button onclick="deleteProject(${project.projectid})">Delete</button>
            `;
            projectsList.appendChild(projectCard);

            // Add project to filter dropdown
            const option = document.createElement("option");
            option.value = project.projectid;
            option.textContent = project.project_name;
            filterProject.appendChild(option);
        });
    } else {
        alert("Error fetching projects");
    }
}

// Apply Filters
applyFiltersBtn.addEventListener("click", () => {
    const filters = {
        projectid: filterProject.value || undefined,
        status: filterStatus.value || undefined,
        assigned_to: filterAssignedTo.value || undefined,
        assigned_by: filterAssignedBy.value || undefined,
    };

    getAllTasks(filters); // Fetch tasks with filters
});

// Initial fetch to load tasks and projects
getAllTasks();
getAllProjects();
