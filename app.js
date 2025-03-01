// API Configuration
const API_URL = 'https://tarks.karankhosla99.workers.dev';

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const projectsSection = document.getElementById('projects-section');
const tasksSection = document.getElementById('tasks-section');
const usersSection = document.getElementById('users-section');

// Navigation Elements
const dashboardLink = document.getElementById('dashboard-link');
const projectsLink = document.getElementById('projects-link');
const tasksLink = document.getElementById('tasks-link');
const usersLink = document.getElementById('users-link');
const logoutBtn = document.getElementById('logout-btn');

// Auth Elements
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginFormElement = document.getElementById('login-form-element');
const registerFormElement = document.getElementById('register-form-element');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const projectModal = document.getElementById('project-modal');
const taskModal = document.getElementById('task-modal');
const userModal = document.getElementById('user-modal');
const projectForm = document.getElementById('project-form');
const taskForm = document.getElementById('task-form');
const userForm = document.getElementById('user-form');
const closeModalButtons = document.querySelectorAll('.close-modal');
const cancelButtons = document.querySelectorAll('.cancel-btn');

// Action Buttons
const addProjectBtn = document.getElementById('add-project-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const addUserBtn = document.getElementById('add-user-btn');
const projectFilter = document.getElementById('project-filter');

// Current User State
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUIForLoggedInUser();
        loadDashboard();
    }

    // Set up event listeners
    setupEventListeners();
});

// Set up all event listeners
function setupEventListeners() {
    // Navigation
    dashboardLink.addEventListener('click', () => showSection(dashboardSection));
    projectsLink.addEventListener('click', () => {
        showSection(projectsSection);
        loadProjects();
    });
    tasksLink.addEventListener('click', () => {
        showSection(tasksSection);
        loadTasks();
        loadProjectsDropdown();
    });
    usersLink.addEventListener('click', () => {
        showSection(usersSection);
        loadUsers();
    });
    logoutBtn.addEventListener('click', logout);

    // Auth tabs
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });
    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    // Form submissions
    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegister);
    projectForm.addEventListener('submit', handleProjectSubmit);
    taskForm.addEventListener('submit', handleTaskSubmit);
    userForm.addEventListener('submit', handleUserSubmit);

    // Action buttons
    addProjectBtn.addEventListener('click', () => openProjectModal());
    addTaskBtn.addEventListener('click', () => openTaskModal());
    addUserBtn.addEventListener('click', () => openUserModal());
    projectFilter.addEventListener('change', filterTasks);

    // Close modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeAllModals);
    });
    cancelButtons.forEach(button => {
        button.addEventListener('click', closeAllModals);
    });
    modalOverlay.addEventListener('click', closeAllModals);
}

// Auth Functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email_Id: email, password: password })
        });

        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            updateUIForLoggedInUser();
            loadDashboard();
            showToast('Login successful!', 'success');
        } else {
            const error = await response.json();
            showToast(error.error || 'Invalid credentials', 'error');
        }
    } catch (error) {
        showToast('Error connecting to server', 'error');
        console.error('Login error:', error);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email_Id: email,
                phoneNumber: phone,
                password: password
            })
        });

        if (response.ok) {
            showToast('Registration successful! Please login.', 'success');
            // Switch to login tab
            loginTab.click();
            // Fill in login form with registered email
            document.getElementById('login-email').value = email;
        } else {
            const error = await response.json();
            showToast(error.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Error connecting to server', 'error');
        console.error('Registration error:', error);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    // Reset and show auth section
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    showSection(authSection);
    showToast('Logged out successfully', 'info');
}

function updateUIForLoggedInUser() {
    // Update username display
    document.getElementById('username').textContent = currentUser.username;

    // Hide auth section, show dashboard
    authSection.classList.add('hidden');
    // Reset active class on nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    dashboardLink.classList.add('active');
}

// Project Functions
async function loadProjects() {
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading projects...</div>';

    try {
        const response = await fetch(`${API_URL}/projects`);
        if (response.ok) {
            const projects = await response.json();
            displayProjects(projects);
        } else {
            showToast('Failed to load projects', 'error');
            projectsContainer.innerHTML = '<div class="error-message">Failed to load projects</div>';
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsContainer.innerHTML = '<div class="error-message">Error connecting to server</div>';
    }
}

function displayProjects(projects) {
    const projectsContainer = document.getElementById('projects-container');
    const recentProjectsList = document.getElementById('recent-projects-list');
    
    // Update project count on dashboard
    document.getElementById('project-count').textContent = projects.length;

    if (projects.length === 0) {
        projectsContainer.innerHTML = '<div class="empty-state">No projects found. Create your first project!</div>';
        if (recentProjectsList) {
            recentProjectsList.innerHTML = '<div class="empty-state">No projects found</div>';
        }
        return;
    }

    // Sort projects by ID (most recent first)
    projects.sort((a, b) => b.projectid - a.projectid);

    // Display in projects section
    projectsContainer.innerHTML = projects.map(project => `
        <div class="project-card" data-id="${project.projectid}">
            <div class="project-header">
                <h3 class="project-title">${project.project_name}</h3>
                <div class="project-actions">
                    <button class="btn btn-sm btn-outline-primary edit-project" data-id="${project.projectid}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-project" data-id="${project.projectid}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="project-description">${project.project_description}</p>
            <div class="project-footer">
                <span class="task-count">
                    <i class="fas fa-tasks"></i> Tasks: <span class="task-count-value" id="project-${project.projectid}-tasks">0</span>
                </span>
                <button class="btn btn-sm btn-outline-primary view-tasks" data-id="${project.projectid}">
                    View Tasks
                </button>
            </div>
        </div>
    `).join('');

    // Display recent projects on dashboard
    if (recentProjectsList) {
        recentProjectsList.innerHTML = projects.slice(0, 3).map(project => `
            <div class="project-card" data-id="${project.projectid}">
                <div class="project-header">
                    <h3 class="project-title">${project.project_name}</h3>
                </div>
                <p class="project-description">${project.project_description}</p>
                <button class="btn btn-sm btn-primary view-tasks" data-id="${project.projectid}">
                    View Tasks
                </button>
            </div>
        `).join('');
    }

    // Add event listeners to project buttons
    document.querySelectorAll('.edit-project').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const projectId = button.getAttribute('data-id');
            const project = projects.find(p => p.projectid == projectId);
            openProjectModal(project);
        });
    });

    document.querySelectorAll('.delete-project').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const projectId = button.getAttribute('data-id');
            confirmDelete('project', projectId);
        });
    });

    document.querySelectorAll('.view-tasks').forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.getAttribute('data-id');
            showSection(tasksSection);
            projectFilter.value = projectId;
            filterTasks();
        });
    });
}

async function loadProjectsDropdown() {
    const projectDropdown = document.getElementById('task-project');
    const filterDropdown = document.getElementById('project-filter');
    
    try {
        const response = await fetch(`${API_URL}/projects`);
        if (response.ok) {
            const projects = await response.json();
            
            // Clear existing options except the first one
            while (projectDropdown.options.length > 0) {
                projectDropdown.options.remove(0);
            }
            
            // Clear filter dropdown except for "All Projects" option
            while (filterDropdown.options.length > 1) {
                filterDropdown.options.remove(1);
            }
            
            // Add projects to dropdowns
            projects.forEach(project => {
                const option = new Option(project.project_name, project.projectid);
                const filterOption = new Option(project.project_name, project.projectid);
                projectDropdown.add(option);
                filterDropdown.add(filterOption);
            });
        }
    } catch (error) {
        console.error('Error loading projects for dropdown:', error);
    }
}

function openProjectModal(project = null) {
    const modalTitle = document.getElementById('project-modal-title');
    const projectIdInput = document.getElementById('project-id');
    const projectNameInput = document.getElementById('project-name');
    const projectDescInput = document.getElementById('project-description');
    
    if (project) {
        modalTitle.textContent = 'Edit Project';
        projectIdInput.value = project.projectid;
        projectNameInput.value = project.project_name;
        projectDescInput.value = project.project_description;
    } else {
        modalTitle.textContent = 'Add New Project';
        projectForm.reset();
        projectIdInput.value = '';
    }
    
    modalOverlay.style.display = 'block';
    projectModal.style.display = 'block';
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('project-id').value;
    const projectName = document.getElementById('project-name').value;
    const projectDesc = document.getElementById('project-description').value;
    
    const projectData = {
        project_name: projectName,
        project_description: projectDesc
    };
    
    try {
        let response;
        
        if (projectId) {
            // Update existing project
            response = await fetch(`${API_URL}/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
        } else {
            // Create new project
            response = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
        }
        
        if (response.ok) {
            closeAllModals();
            loadProjects();
            loadProjectsDropdown();
            showToast(projectId ? 'Project updated successfully!' : 'Project created successfully!', 'success');
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to save project', 'error');
        }
    } catch (error) {
        console.error('Project save error:', error);
        showToast('Error connecting to server', 'error');
    }
}

async function deleteProject(projectId) {
    try {
        const response = await fetch(`${API_URL}/projects/${projectId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadProjects();
            loadProjectsDropdown();
            showToast('Project deleted successfully!', 'success');
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to delete project', 'error');
        }
    } catch (error) {
        console.error('Project delete error:', error);
        showToast('Error connecting to server', 'error');
    }
}

// Task Functions
async function loadTasks(projectId = null) {
    const todoTasks = document.getElementById('todo-tasks');
    const inProgressTasks = document.getElementById('inprogress-tasks');
    const doneTasks = document.getElementById('done-tasks');
    const myTasksList = document.getElementById('my-tasks-list');
    
    // Clear task lists
    todoTasks.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>';
    inProgressTasks.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>';
    doneTasks.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>';
    
    if (myTasksList) {
        myTasksList.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading tasks...</div>';
    }
    
    try {
        let url = `${API_URL}/tasks`;
        if (projectId) {
            url += `?projectid=${projectId}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
            const tasks = await response.json();
            
            // Update task counts
            document.getElementById('task-count').textContent = tasks.length;
            document.getElementById('completed-count').textContent = tasks.filter(task => task.status === 'done').length;
            
            // Group tasks by status
            const todoList = tasks.filter(task => task.status === 'todo');
            const inProgressList = tasks.filter(task => task.status === 'inprogress');
            const doneList = tasks.filter(task => task.status === 'done');
            
            // Display tasks in their respective columns
            todoTasks.innerHTML = todoList.length ? renderTaskList(todoList) : '<div class="empty-column">No tasks</div>';
            inProgressTasks.innerHTML = inProgressList.length ? renderTaskList(inProgressList) : '<div class="empty-column">No tasks</div>';
            doneTasks.innerHTML = doneList.length ? renderTaskList(doneList) : '<div class="empty-column">No tasks</div>';
            
            // Update my tasks on dashboard
            if (myTasksList && currentUser) {
                const myTasks = tasks.filter(task => task.assigned_to === currentUser.username);
                myTasksList.innerHTML = myTasks.length 
                    ? renderTaskList(myTasks.slice(0, 3)) 
                    : '<div class="empty-state">No tasks assigned to you</div>';
            }
            
            // Add event listeners to task cards
            addTaskCardEventListeners(tasks);
            
            // Update project task counts
            updateProjectTaskCounts(tasks);
        } else {
            showToast('Failed to load tasks', 'error');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Error connecting to server', 'error');
    }
}

function renderTaskList(tasks) {
    return tasks.map(task => `
        <div class="task-card" data-id="${task.taskid}">
            <div class="task-header">
                <div class="task-title">${task.taskname}</div>
                <div class="task-project">${task.projectid}</div>
            </div>
            <div class="task-description">${task.taskdescription}</div>
            <div class="task-meta">
                <div class="task-deadline">
                    <i class="far fa-calendar-alt"></i> ${formatDate(task.deadline)}
                </div>
                <div class="task-assignee">
                    <i class="far fa-user"></i> ${task.assigned_to}
                </div>
            </div>
            <div class="task-actions mt-2">
                <button class="btn btn-sm btn-outline-primary edit-task" data-id="${task.taskid}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-task" data-id="${task.taskid}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function addTaskCardEventListeners(tasks) {
    document.querySelectorAll('.edit-task').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = button.getAttribute('data-id');
            const task = tasks.find(t => t.taskid == taskId);
            openTaskModal(task);
        });
    });
    
    document.querySelectorAll('.delete-task').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = button.getAttribute('data-id');
            confirmDelete('task', taskId);
        });
    });
    
    document.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('click', () => {
            const taskId = card.getAttribute('data-id');
            const task = tasks.find(t => t.taskid == taskId);
            openTaskModal(task);
        });
    });
}

function updateProjectTaskCounts(tasks) {
    // Group tasks by project
    const projectCounts = {};
    tasks.forEach(task => {
        if (!projectCounts[task.projectid]) {
            projectCounts[task.projectid] = 0;
        }
        projectCounts[task.projectid]++;
    });
    
    // Update count displays
    Object.keys(projectCounts).forEach(projectId => {
        const countElement = document.getElementById(`project-${projectId}-tasks`);
        if (countElement) {
            countElement.textContent = projectCounts[projectId];
        }
    });
}

function filterTasks() {
    const projectId = projectFilter.value;
    if (projectId) {
        loadTasks(projectId);
    } else {
        loadTasks();
    }
}

async function loadUsersDropdown() {
    const assignedToDropdown = document.getElementById('task-assigned-to');
    
    try {
        const response = await fetch(`${API_URL}/users`);
        if (response.ok) {
            const users = await response.json();
            
            // Clear existing options
            while (assignedToDropdown.options.length > 0) {
                assignedToDropdown.options.remove(0);
            }
            
            // Add users to dropdown
            users.forEach(user => {
                const option = new Option(user.username, user.username);
                assignedToDropdown.add(option);
            });
        }
    } catch (error) {
        console.error('Error loading users for dropdown:', error);
    }
}

function openTaskModal(task = null) {
    const modalTitle = document.getElementById('task-modal-title');
    const taskIdInput = document.getElementById('task-id');
    const taskNameInput = document.getElementById('task-name');
    const taskDescInput = document.getElementById('task-description');
    const taskProjectInput = document.getElementById('task-project');
    const taskAssignedToInput = document.getElementById('task-assigned-to');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const taskStatusInput = document.getElementById('task-status');
    
    // Load dropdowns
    loadProjectsDropdown();
    loadUsersDropdown();
    
    if (task) {
        modalTitle.textContent = 'Edit Task';
        taskIdInput.value = task.taskid;
        taskNameInput.value = task.taskname;
        taskDescInput.value = task.taskdescription;
        
        // Set values after dropdowns are loaded
        setTimeout(() => {
            taskProjectInput.value = task.projectid;
            taskAssignedToInput.value = task.assigned_to;
            taskStatusInput.value = task.status;
            
            // Format date for input (YYYY-MM-DD)
            const date = new Date(task.deadline);
            const formattedDate = date.toISOString().split('T')[0];
            taskDeadlineInput.value = formattedDate;
        }, 500);
    } else {
        modalTitle.textContent = 'Add New Task';
        taskForm.reset();
        taskIdInput.value = '';
        
        // Set current user as assigned_by
        setTimeout(() => {
            if (currentUser) {
                taskAssignedToInput.value = currentUser.username;
            }
            
            // Set default deadline to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            taskDeadlineInput.value = tomorrow.toISOString().split('T')[0];
        }, 500);
    }
    
    modalOverlay.style.display = 'block';
    taskModal.style.display = 'block';
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('task-id').value;
    const taskName = document.getElementById('task-name').value;
    const taskDesc = document.getElementById('task-description').value;
    const projectId = document.getElementById('task-project').value;
    const assignedTo = document.getElementById('task-assigned-to').value;
    const deadline = document.getElementById('task-deadline').value;
    const status = document.getElementById('task-status').value;
    
    const taskData = {
        taskname: taskName,
        taskdescription: taskDesc,
        projectid: projectId,
        assigned_to: assignedTo,
        assigned_by: currentUser.username,
        deadline: deadline,
        status: status
    };
    
    try {
        let response;
        
        if (taskId) {
            // Update existing task
            response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
        } else {
            // Create new task
            response = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
        }
        
        if (response.ok) {
            closeAllModals();
            loadTasks(projectFilter.value || null);
            showToast(taskId ? 'Task updated successfully!' : 'Task created successfully!', 'success');
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to save task', 'error');
        }
    } catch (error) {
        console.error('Task save error:', error);
        showToast('Error connecting to server', 'error');
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTasks(projectFilter.value || null);
            showToast('Task deleted successfully!', 'success');
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to delete task', 'error');
        }
    } catch (error) {
        console.error('Task delete error:', error);
        showToast('Error connecting to server', 'error');
    }
}

// User Functions
async function loadUsers() {
    const usersContainer = document.getElementById('users-container');
    usersContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading users...</div>';
    
    try {
        const response = await fetch(`${API_URL}/users`);
        if (response.ok) {
            const users = await response.json();
            displayUsers(users);
        } else {
            showToast('Failed to load users', 'error');
            usersContainer.innerHTML = '<div class="error-message">Failed to load users</div>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        usersContainer.innerHTML = '<div class="error-message">Error connecting to server</div>';
    }
}

function displayUsers(users) {
    const usersContainer = document.getElementById('users-container');
    
    if (users.length === 0) {
        usersContainer.innerHTML = '<div class="empty-state">No users found</div>';
        return;
    }
    
    usersContainer.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-header">
                <div class="user-info">
                    <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                    <div class="user-name">${user.username}</div>
                </div>
                <div class="user-actions">
                    <button class="btn btn-sm btn-outline-primary edit-user" data-id="${user.username}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-user" data-id="${user.username}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="user-contact">
                <div class="user-email">
                    <i class="far fa-envelope"></i> ${user.email_Id}
                </div>
                <div class="user-phone">
                    <i class="fas fa-phone"></i> ${user.phoneNumber}
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to user cards
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-id');
            const user = users.find(u => u.username === userId);
            openUserModal(user);
        });
    });
    
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-id');
            
            // Prevent deleting current user
            if (userId === currentUser.username) {
                showToast('You cannot delete your own account', 'error');
                return;
            }
            
            confirmDelete('user', userId);
        });
    });
}

function openUserModal(user = null) {
    const modalTitle = document.getElementById('user-modal-title');
    const userIdInput = document.getElementById('user-id');
    const usernameInput = document.getElementById('user-username');
    const emailInput = document.getElementById('user-email');
    const phoneInput = document.getElementById('user-phone');
    const passwordInput = document.getElementById('user-password');
    
    if (user) {
        modalTitle.textContent = 'Edit User';
        userIdInput.value = user.username;
        usernameInput.value = user.username;
        emailInput.value = user.email_Id;
        phoneInput.value = user.phoneNumber;
        passwordInput.value = user.password;
    } else {
        modalTitle.textContent = 'Add New User';
        userForm.reset();
        userIdInput.value = '';
    }
    
    modalOverlay.style.display = 'block';
    userModal.style.display = 'block';
}

async function handleUserSubmit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('user-id').value;
    const username = document.getElementById('user-username').value;
    const email = document.getElementById('user-email').value;
    const phone = document.getElementById('user-phone').value;
    const password = document.getElementById('user-password').value;
    
    const userData = {
        username: username,
        email_Id: email,
        phoneNumber: phone,
        password: password
    };
    
    try {
        let response;
        
        if (userId) {
            // Update existing user
            response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
