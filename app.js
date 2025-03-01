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

// Current User
let currentUser = null;

// Initialize the application
function initApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showLoggedInUI();
        loadDashboard();
    } else {
        showLoginUI();
    }

    // Set up event listeners
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
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

    // Navigation
    dashboardLink.addEventListener('click', () => navigateTo('dashboard'));
    projectsLink.addEventListener('click', () => navigateTo('projects'));
    tasksLink.addEventListener('click', () => navigateTo('tasks'));
    usersLink.addEventListener('click', () => navigateTo('users'));
    logoutBtn.addEventListener('click', handleLogout);

    // Add new buttons
    document.getElementById('add-project-btn').addEventListener('click', () => openProjectModal());
    document.getElementById('add-task-btn').addEventListener('click', () => openTaskModal());
    document.getElementById('add-user-btn').addEventListener('click', () => openUserModal());

    // Project filter for tasks
    document.getElementById('project-filter').addEventListener('change', filterTasks);

    // Modal close buttons
    document.querySelectorAll('.close-modal, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
}

// API Calls
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        // For successful DELETE operations that return empty response
        if (response.status === 200 && method === 'DELETE') {
            return { success: true };
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Error connecting to the server', 'error');
        return null;
    }
}

// Authentication Handlers
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const user = await apiRequest('/login', 'POST', { email_Id: email, password: password });
        
        if (user && !user.error) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showLoggedInUI();
            loadDashboard();
            showNotification('Login successful', 'success');
        } else {
            showNotification('Invalid email or password', 'error');
        }
    } catch (error) {
        showNotification('Login failed', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    
    try {
        await apiRequest('/users', 'POST', {
            username,
            password,
            email_Id: email,
            phoneNumber: phone
        });
        
        showNotification('Registration successful. Please login.', 'success');
        loginTab.click();
        document.getElementById('login-email').value = email;
    } catch (error) {
        showNotification('Registration failed', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginUI();
    showNotification('Logged out successfully', 'success');
}

// UI State Management
function showLoginUI() {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    projectsSection.classList.add('hidden');
    tasksSection.classList.add('hidden');
    usersSection.classList.add('hidden');
    
    document.getElementById('username').textContent = 'Guest';
}

function showLoggedInUI() {
    authSection.classList.add('hidden');
    document.getElementById('username').textContent = currentUser.username;
}

function navigateTo(section) {
    // Hide all sections
    dashboardSection.classList.add('hidden');
    projectsSection.classList.add('hidden');
    tasksSection.classList.add('hidden');
    usersSection.classList.add('hidden');
    
    // Remove active class from all links
    dashboardLink.classList.remove('active');
    projectsLink.classList.remove('active');
    tasksLink.classList.remove('active');
    usersLink.classList.remove('active');
    
    // Show selected section and highlight nav link
    switch (section) {
        case 'dashboard':
            dashboardSection.classList.remove('hidden');
            dashboardLink.classList.add('active');
            loadDashboard();
            break;
        case 'projects':
            projectsSection.classList.remove('hidden');
            projectsLink.classList.add('active');
            loadProjects();
            break;
        case 'tasks':
            tasksSection.classList.remove('hidden');
            tasksLink.classList.add('active');
            loadTasks();
            loadProjectsForFilter();
            break;
        case 'users':
            usersSection.classList.remove('hidden');
            usersLink.classList.add('active');
            loadUsers();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        // Load counts
        const projectsData = await apiRequest('/projects', 'GET');
        const tasksData = await apiRequest('/tasks', 'GET');
        
        // Set counts
        document.getElementById('project-count').textContent = projectsData.length || 0;
        document.getElementById('task-count').textContent = tasksData.length || 0;
        
        // Calculate completed tasks
        const completedTasks = tasksData.filter(task => task.status === 'done').length;
        document.getElementById('completed-count').textContent = completedTasks || 0;
        
        // Load my tasks
        const myTasksContainer = document.getElementById('my-tasks-list');
        myTasksContainer.innerHTML = '';
        
        const myTasks = await apiRequest(`/tasks/assigned/${currentUser.username}`, 'GET');
        
        if (myTasks && myTasks.length > 0) {
            myTasks.forEach(task => {
                myTasksContainer.appendChild(createTaskCard(task, false));
            });
        } else {
            myTasksContainer.innerHTML = '<p>No tasks assigned to you</p>';
        }
        
        // Load recent projects
        const projectsContainer = document.getElementById('recent-projects-list');
        projectsContainer.innerHTML = '';
        
        const recentProjects = projectsData.slice(0, 3);
        
        if (recentProjects && recentProjects.length > 0) {
            recentProjects.forEach(project => {
                projectsContainer.appendChild(createProjectCard(project, false));
            });
        } else {
            projectsContainer.innerHTML = '<p>No projects found</p>';
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Projects Management
async function loadProjects() {
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading projects...</div>';
    
    try {
        const projects = await apiRequest('/projects', 'GET');
        
        projectsContainer.innerHTML = '';
        
        if (projects && projects.length > 0) {
            projects.forEach(project => {
                projectsContainer.appendChild(createProjectCard(project));
            });
        } else {
            projectsContainer.innerHTML = '<p>No projects found</p>';
        }
    } catch (error) {
        projectsContainer.innerHTML = '<p>Error loading projects</p>';
        console.error('Error loading projects:', error);
    }
}

function createProjectCard(project, showActions = true) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
        <div class="project-header">
            <h3 class="project-title">${project.project_name}</h3>
            ${showActions ? `
            <div class="project-actions">
                <button class="btn btn-sm btn-outline-primary edit-project" data-id="${project.projectid}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-project" data-id="${project.projectid}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            ` : ''}
        </div>
        <p class="project-description">${project.project_description}</p>
        <div class="project-footer">
            <span class="project-id">ID: ${project.projectid}</span>
            <span class="task-count"><i class="fas fa-tasks"></i> <span id="project-task-count-${project.projectid}">0</span> tasks</span>
        </div>
    `;

    // Add event listeners to action buttons if they exist
    if (showActions) {
        setTimeout(() => {
            const editBtn = card.querySelector('.edit-project');
            if (editBtn) {
                editBtn.addEventListener('click', () => openProjectModal(project));
            }
            
            const deleteBtn = card.querySelector('.delete-project');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deleteProject(project.projectid));
            }
        }, 0);
    }
    
    // Get task count for this project
    setTimeout(async () => {
        try {
            const tasks = await apiRequest(`/tasks?projectid=${project.projectid}`, 'GET');
            const countElement = document.getElementById(`project-task-count-${project.projectid}`);
            if (countElement) {
                countElement.textContent = tasks.length || 0;
            }
        } catch (error) {
            console.error('Error fetching task count:', error);
        }
    }, 0);
    
    return card;
}

function openProjectModal(project = null) {
    const modalTitle = document.getElementById('project-modal-title');
    const projectIdInput = document.getElementById('project-id');
    const projectNameInput = document.getElementById('project-name');
    const projectDescriptionInput = document.getElementById('project-description');
    
    if (project) {
        modalTitle.textContent = 'Edit Project';
        projectIdInput.value = project.projectid;
        projectNameInput.value = project.project_name;
        projectDescriptionInput.value = project.project_description;
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
    const projectDescription = document.getElementById('project-description').value;
    
    const projectData = {
        project_name: projectName,
        project_description: projectDescription
    };
    
    try {
        if (projectId) {
            // Update existing project
            await apiRequest(`/projects/${projectId}`, 'PUT', projectData);
            showNotification('Project updated successfully', 'success');
        } else {
            // Create new project
            await apiRequest('/projects', 'POST', projectData);
            showNotification('Project created successfully', 'success');
        }
        
        closeAllModals();
        loadProjects();
    } catch (error) {
        showNotification('Failed to save project', 'error');
        console.error('Error saving project:', error);
    }
}

async function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
        try {
            await apiRequest(`/projects/${projectId}`, 'DELETE');
            showNotification('Project deleted successfully', 'success');
            loadProjects();
        } catch (error) {
            showNotification('Failed to delete project', 'error');
            console.error('Error deleting project:', error);
        }
    }
}

// Tasks Management
async function loadTasks() {
    const todoContainer = document.getElementById('todo-tasks');
    const inProgressContainer = document.getElementById('inprogress-tasks');
    const doneContainer = document.getElementById('done-tasks');
    
    todoContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>';
    inProgressContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>';
    doneContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>';
    
    try {
        // Get tasks
        const tasks = await apiRequest('/tasks', 'GET');
        
        // Clear containers
        todoContainer.innerHTML = '';
        inProgressContainer.innerHTML = '';
        doneContainer.innerHTML = '';
        
        if (tasks && tasks.length > 0) {
            tasks.forEach(task => {
                const taskCard = createTaskCard(task);
                
                // Sort by status
                switch (task.status) {
                    case 'todo':
                        todoContainer.appendChild(taskCard);
                        break;
                    case 'inprogress':
                        inProgressContainer.appendChild(taskCard);
                        break;
                    case 'done':
                        doneContainer.appendChild(taskCard);
                        break;
                    default:
                        todoContainer.appendChild(taskCard);
                }
            });
        } else {
            todoContainer.innerHTML = '<p>No tasks found</p>';
            inProgressContainer.innerHTML = '<p>No tasks in progress</p>';
            doneContainer.innerHTML = '<p>No completed tasks</p>';
        }
    } catch (error) {
        todoContainer.innerHTML = '<p>Error loading tasks</p>';
        inProgressContainer.innerHTML = '<p>Error loading tasks</p>';
        doneContainer.innerHTML = '<p>Error loading tasks</p>';
        console.error('Error loading tasks:', error);
    }
}

async function filterTasks() {
    const projectId = document.getElementById('project-filter').value;
    
    const todoContainer = document.getElementById('todo-tasks');
    const inProgressContainer = document.getElementById('inprogress-tasks');
    const doneContainer = document.getElementById('done-tasks');
    
    todoContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>';
    inProgressContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>';
    doneContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i></div>';
    
    try {
        let tasks;
        
        if (projectId) {
            tasks = await apiRequest(`/tasks?projectid=${projectId}`, 'GET');
        } else {
            tasks = await apiRequest('/tasks', 'GET');
        }
        
        // Clear containers
        todoContainer.innerHTML = '';
        inProgressContainer.innerHTML = '';
        doneContainer.innerHTML = '';
        
        if (tasks && tasks.length > 0) {
            tasks.forEach(task => {
                const taskCard = createTaskCard(task);
                
                // Sort by status
                switch (task.status) {
                    case 'todo':
                        todoContainer.appendChild(taskCard);
                        break;
                    case 'inprogress':
                        inProgressContainer.appendChild(taskCard);
                        break;
                    case 'done':
                        doneContainer.appendChild(taskCard);
                        break;
                    default:
                        todoContainer.appendChild(taskCard);
                }
            });
        } else {
            todoContainer.innerHTML = '<p>No tasks found</p>';
            inProgressContainer.innerHTML = '<p>No tasks in progress</p>';
            doneContainer.innerHTML = '<p>No completed tasks</p>';
        }
    } catch (error) {
        todoContainer.innerHTML = '<p>Error loading tasks</p>';
        inProgressContainer.innerHTML = '<p>Error loading tasks</p>';
        doneContainer.innerHTML = '<p>Error loading tasks</p>';
        console.error('Error filtering tasks:', error);
    }
}

function createTaskCard(task, showActions = true) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.setAttribute('data-id', task.taskid);
    
    // Format date if it exists
    const deadlineDate = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline';
    
    card.innerHTML = `
        <div class="task-header">
            <h4 class="task-title">${task.taskname}</h4>
            <span class="task-project">Project ID: ${task.projectid}</span>
        </div>
        <p class="task-description">${task.taskdescription}</p>
        <div class="task-meta">
            <span class="task-deadline"><i class="far fa-calendar-alt"></i> ${deadlineDate}</span>
            <span class="task-assignee"><i class="far fa-user"></i> ${task.assigned_to}</span>
        </div>
        ${showActions ? `
        <div class="task-actions mt-2">
            <button class="btn btn-sm btn-outline-primary edit-task" data-id="${task.taskid}">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-outline-danger delete-task" data-id="${task.taskid}">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
        ` : ''}
    `;
    
    // Add event listeners to action buttons if they exist
    if (showActions) {
        setTimeout(() => {
            // Edit task
            const editBtn = card.querySelector('.edit-task');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openTaskModal(task);
                });
            }
            
            // Delete task
            const deleteBtn = card.querySelector('.delete-task');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteTask(task.taskid);
                });
            }
            
            // Add click event to card
            card.addEventListener('click', () => openTaskModal(task));
        }, 0);
    }
    
    return card;
}

async function loadProjectsForFilter() {
    const projectFilter = document.getElementById('project-filter');
    const taskProjectSelect = document.getElementById('task-project');
    
    try {
        const projects = await apiRequest('/projects', 'GET');
        
        // Clear options except the default one
        projectFilter.innerHTML = '<option value="">All Projects</option>';
        taskProjectSelect.innerHTML = '<option value="">Select Project</option>';
        
        if (projects && projects.length > 0) {
            projects.forEach(project => {
                // Add to filter dropdown
                const filterOption = document.createElement('option');
                filterOption.value = project.projectid;
                filterOption.textContent = project.project_name;
                projectFilter.appendChild(filterOption);
                
                // Add to task form dropdown
                const taskOption = document.createElement('option');
                taskOption.value = project.projectid;
                taskOption.textContent = project.project_name;
                taskProjectSelect.appendChild(taskOption);
            });
        }
    } catch (error) {
        console.error('Error loading projects for filter:', error);
    }
}

async function loadUsersForTaskAssignment() {
    const taskAssignedToSelect = document.getElementById('task-assigned-to');
    
    try {
        const users = await apiRequest('/users', 'GET');
        
        // Clear options
        taskAssignedToSelect.innerHTML = '<option value="">Select User</option>';
        
        if (users && users.length > 0) {
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.username;
                option.textContent = user.username;
                taskAssignedToSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading users for task assignment:', error);
    }
}

function openTaskModal(task = null) {
    const modalTitle = document.getElementById('task-modal-title');
    const taskIdInput = document.getElementById('task-id');
    const taskNameInput = document.getElementById('task-name');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskProjectSelect = document.getElementById('task-project');
    const taskAssignedToSelect = document.getElementById('task-assigned-to');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const taskStatusSelect = document.getElementById('task-status');
    
    // Load projects and users for dropdowns
    loadProjectsForFilter();
    loadUsersForTaskAssignment();
    
    if (task) {
        modalTitle.textContent = 'Edit Task';
        taskIdInput.value = task.taskid;
        taskNameInput.value = task.taskname;
        taskDescriptionInput.value = task.taskdescription;
        
        // Set deadline if it exists
        if (task.deadline) {
            // Format date to YYYY-MM-DD for input
            const date = new Date(task.deadline);
            const formattedDate = date.toISOString().split('T')[0];
            taskDeadlineInput.value = formattedDate;
        } else {
            taskDeadlineInput.value = '';
        }
        
        // Wait for options to load, then set selected values
        setTimeout(() => {
            taskProjectSelect.value = task.projectid;
            taskAssignedToSelect.value = task.assigned_to;
            taskStatusSelect.value = task.status || 'todo';
        }, 500);
    } else {
        modalTitle.textContent = 'Add New Task';
        taskForm.reset();
        taskIdInput.value = '';
        
        // Set current user as assigned_by
        setTimeout(() => {
            taskStatusSelect.value = 'todo';
        }, 500);
    }
    
    modalOverlay.style.display = 'block';
    taskModal.style.display = 'block';
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('task-id').value;
    const taskName = document.getElementById('task-name').value;
    const taskDescription = document.getElementById('task-description').value;
    const projectId = document.getElementById('task-project').value;
    const assignedTo = document.getElementById('task-assigned-to').value;
    const deadline = document.getElementById('task-deadline').value;
    const status = document.getElementById('task-status').value;
    
    const taskData = {
        taskname: taskName,
        taskdescription: taskDescription,
        assigned_to: assignedTo,
        assigned_by: currentUser.username,
        deadline: deadline,
        projectid: projectId,
        status: status
    };
    
    try {
        if (taskId) {
            // Update existing task
            await apiRequest(`/tasks/${taskId}`, 'PUT', taskData);
            showNotification('Task updated successfully', 'success');
        } else {
            // Create new task
            await apiRequest('/tasks', 'POST', taskData);
            showNotification('Task created successfully', 'success');
        }
        
        closeAllModals();
        loadTasks();
    } catch (error) {
        showNotification('Failed to save task', 'error');
        console.error('Error saving task:', error);
    }
}

async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task? This cannot be undone.')) {
        try {
            await apiRequest(`/tasks/${taskId}`, 'DELETE');
            showNotification('Task deleted successfully', 'success');
            loadTasks();
        } catch (error) {
            showNotification('Failed to delete task', 'error');
            console.error('Error deleting task:', error);
        }
    }
}

// Users Management
async function loadUsers() {
    const usersContainer = document.getElementById('users-container');
    usersContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading users...</div>';
    
    try {
        const users = await apiRequest('/users', 'GET');
        
        usersContainer.innerHTML = '';
        
        if (users && users.length > 0) {
            users.forEach(user => {
                usersContainer.appendChild(createUserCard(user));
            });
        } else {
            usersContainer.innerHTML = '<p>No users found</p>';
        }
    } catch (error) {
        usersContainer.innerHTML = '<p>Error loading users</p>';
        console.error('Error loading users:', error);
    }
}

function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';
    
    // Get first letter of username for avatar
    const firstLetter = user.username.charAt(0).toUpperCase();
    
    card.innerHTML = `
        <div class="user-header">
            <div class="user-info">
                <div class="user-avatar">${firstLetter}</div>
                <span class="user-name">${user.username}</span>
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
            <div><i class="fas fa-envelope"></i> ${user.email_Id}</div>
            <div><i class="fas fa-phone"></i> ${user.phoneNumber}</div>
        </div>
    `;
    
    // Add event listeners
    setTimeout(() => {
        // Edit user
        const editBtn = card.querySelector('.edit-user');
        if (editBtn) {
            editBtn.addEventListener('click', () => openUserModal(user));
        }
        
        // Delete user
        const deleteBtn = card.querySelector('.delete-user');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteUser(user.username));
        }
    }, 0);
    
    return card;
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
        passwordInput.value = user.password || '';
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
        if (userId) {
            // Update existing user
            await apiRequest(`/users/${userId}`, 'PUT', userData);
            showNotification('User updated successfully', 'success');
            
            // Update current user if editing themselves
            if (currentUser && currentUser.username === userId) {
                currentUser = { ...currentUser, ...userData };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                document.getElementById('username').textContent = currentUser.username;
            }
        } else {
            // Create new user
            await apiRequest('/users', 'POST', userData);
            showNotification('User created successfully', 'success');
        }
        
        closeAllModals();
        loadUsers();
    } catch (error) {
        showNotification('Failed to save user', 'error');
        console.error('Error saving user:', error);
    }
}

    async function deleteUser(username) {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
        try {
            await apiRequest(`/users/${username}`, 'DELETE');
            showNotification('User deleted successfully', 'success');
            loadUsers();
            
            // If the deleted user is the current user, log them out
            if (currentUser && currentUser.username === username) {
                handleLogout();
            }
        } catch (error) {
            showNotification('Failed to delete user', 'error');
            console.error('Error deleting user:', error);
        }
    }
}

// Notification Function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="close-notification">×</button>
    `;
    
    // Append to body
    document.body.appendChild(notification);
    
    // Add event listener to close button
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// Helper function to get notification icon
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        default:
            return 'fa-info-circle';
    }
}

// Modal Management


function openModal() {
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('project-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('project-modal').style.display = 'none';
}



// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initApp);
