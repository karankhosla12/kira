document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login');
  const signupForm = document.getElementById('signup');
  const dashboard = document.getElementById('dashboard');
  const createTaskBtn = document.getElementById('create-task-btn');
  const createProjectBtn = document.getElementById('create-project-btn');
  const listProjectsBtn = document.getElementById('list-projects-btn');
  const tasksList = document.getElementById('tasks-list');
  const statusFilter = document.getElementById('status-filter');
  const assignedByFilter = document.getElementById('assigned-by-filter');
  const createTaskModal = document.getElementById('create-task-modal');
  const createProjectModal = document.getElementById('create-project-modal');
  const closeModals = document.querySelectorAll('.close');

  const API_BASE_URL = 'https://tarks.karankhosla99.workers.dev';

  // Show Signup Form
  document.getElementById('show-signup').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
  });

  // Show Login Form
  document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
  });

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_Id: email, password: password }),
    });

    if (response.ok) {
      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      showDashboard();
    } else {
      alert('Login failed');
    }
  });

  // Signup
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const phone = document.getElementById('signup-phone').value;

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email_Id: email, password, phoneNumber: phone }),
    });

    if (response.ok) {
      alert('Signup successful! Please login.');
      document.getElementById('signup-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'block';
    } else {
      alert('Signup failed');
    }
  });

  // Show Dashboard
  function showDashboard() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
    dashboard.style.display = 'block';
    loadTasks();
  }

  // Load Tasks
  async function loadTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const tasks = await response.json();
      displayTasks(tasks);
    } else {
      alert('Failed to load tasks');
    }
  }

  // Display Tasks
  function displayTasks(tasks) {
    tasksList.innerHTML = tasks.map(task => `
      <div class="task">
        <h3>${task.taskname}</h3>
        <p>${task.taskdescription}</p>
        <p>Assigned to: ${task.assigned_to}</p>
        <p>Deadline: ${task.deadline}</p>
        <button onclick="editTask('${task.taskid}')">Edit</button>
      </div>
    `).join('');
  }

  // Open Create Task Modal
  createTaskBtn.addEventListener('click', () => {
    createTaskModal.style.display = 'block';
  });

  // Create Task
  document.getElementById('create-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskName = document.getElementById('task-name').value;
    const taskDescription = document.getElementById('task-description').value;
    const assignedTo = document.getElementById('assigned-to').value;
    const deadline = document.getElementById('deadline').value;
    const projectId = document.getElementById('project-id').value;

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskname: taskName,
        taskdescription: taskDescription,
        assigned_to: assignedTo,
        assigned_by: JSON.parse(localStorage.getItem('user')).email_Id,
        deadline,
        projectid: projectId,
        status: 0, // Default status: Open
      }),
    });

    if (response.ok) {
      alert('Task created successfully!');
      createTaskModal.style.display = 'none';
      loadTasks();
    } else {
      alert('Failed to create task');
    }
  });

  // Open Create Project Modal
  createProjectBtn.addEventListener('click', () => {
    createProjectModal.style.display = 'block';
  });

  // Create Project
  document.getElementById('create-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectName = document.getElementById('project-name').value;
    const projectDescription = document.getElementById('project-description').value;

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_name: projectName,
        project_description: projectDescription,
      }),
    });

    if (response.ok) {
      alert('Project created successfully!');
      createProjectModal.style.display = 'none';
    } else {
      alert('Failed to create project');
    }
  });

  // Close Modals
  closeModals.forEach(close => {
    close.addEventListener('click', () => {
      createTaskModal.style.display = 'none';
      createProjectModal.style.display = 'none';
    });
  });

  // List All Projects
  listProjectsBtn.addEventListener('click', async () => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const projects = await response.json();
      alert(JSON.stringify(projects, null, 2));
    } else {
      alert('Failed to load projects');
    }
  });
});
