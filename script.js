const STORAGE_KEY = "nexa-task-planner";

const sampleTasks = [
  {
    id: crypto.randomUUID(),
    title: "Revise database concepts for BSCS class",
    description: "Spend 1 hour reviewing ER diagrams, normalization, and SQL joins.",
    topic: "BSCS Study",
    priority: "High",
    dueDate: "",
    status: "pending",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Build a responsive portfolio section",
    description: "Practice layout improvements using Flexbox and CSS Grid for web development skills.",
    topic: "Web Development",
    priority: "High",
    dueDate: "",
    status: "pending",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Update internship landing page content",
    description: "Complete assigned content and UI changes for the web development internship.",
    topic: "Internship: Web Development",
    priority: "Medium",
    dueDate: "",
    status: "completed",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Prepare weekly campaign summary",
    description: "Create a short performance report for the marketing manager internship.",
    topic: "Internship: Marketing Manager",
    priority: "Medium",
    dueDate: "",
    status: "pending",
    createdAt: new Date().toISOString()
  }
];

const state = {
  tasks: loadTasks(),
  filters: {
    search: "",
    status: "all",
    topic: "all"
  },
  editingTaskId: null
};

const elements = {
  taskForm: document.querySelector("#taskForm"),
  taskId: document.querySelector("#taskId"),
  titleInput: document.querySelector("#titleInput"),
  descriptionInput: document.querySelector("#descriptionInput"),
  topicInput: document.querySelector("#topicInput"),
  priorityInput: document.querySelector("#priorityInput"),
  dueDateInput: document.querySelector("#dueDateInput"),
  statusInput: document.querySelector("#statusInput"),
  resetFormBtn: document.querySelector("#resetFormBtn"),
  clearCompletedBtn: document.querySelector("#clearCompletedBtn"),
  highPriorityList: document.querySelector("#highPriorityList"),
  mediumPriorityList: document.querySelector("#mediumPriorityList"),
  lowPriorityList: document.querySelector("#lowPriorityList"),
  emptyState: document.querySelector("#emptyState"),
  searchInput: document.querySelector("#searchInput"),
  filterStatus: document.querySelector("#filterStatus"),
  filterTopic: document.querySelector("#filterTopic"),
  formTitle: document.querySelector("#formTitle"),
  totalTasks: document.querySelector("#totalTasks"),
  completedTasks: document.querySelector("#completedTasks"),
  pendingTasks: document.querySelector("#pendingTasks"),
  highPriorityTasks: document.querySelector("#highPriorityTasks")
};

initializeApp();

function initializeApp() {
  bindEvents();
  renderApp();
}

function bindEvents() {
  elements.taskForm.addEventListener("submit", handleFormSubmit);
  elements.resetFormBtn.addEventListener("click", resetForm);
  elements.clearCompletedBtn.addEventListener("click", clearCompletedTasks);
  elements.searchInput.addEventListener("input", handleSearch);
  elements.filterStatus.addEventListener("change", handleStatusFilter);
  elements.filterTopic.addEventListener("change", handleTopicFilter);
  elements.highPriorityList.addEventListener("click", handleTaskActions);
  elements.mediumPriorityList.addEventListener("click", handleTaskActions);
  elements.lowPriorityList.addEventListener("click", handleTaskActions);
}

function loadTasks() {
  const storedTasks = localStorage.getItem(STORAGE_KEY);
  return storedTasks ? JSON.parse(storedTasks) : sampleTasks;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(elements.taskForm);
  const title = formData.get("title").trim();
  const description = formData.get("description").trim();

  if (!title) {
    elements.titleInput.focus();
    return;
  }

  const taskData = {
    id: elements.taskId.value || crypto.randomUUID(),
    title,
    description,
    topic: formData.get("topic"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status"),
    createdAt: elements.taskId.value
      ? findTaskById(elements.taskId.value)?.createdAt || new Date().toISOString()
      : new Date().toISOString()
  };

  if (state.editingTaskId) {
    state.tasks = state.tasks.map((task) => (task.id === state.editingTaskId ? taskData : task));
  } else {
    state.tasks.unshift(taskData);
  }

  saveTasks();
  resetForm();
  renderApp();
}

function handleSearch(event) {
  state.filters.search = event.target.value.trim().toLowerCase();
  renderApp();
}

function handleStatusFilter(event) {
  state.filters.status = event.target.value;
  renderApp();
}

function handleTopicFilter(event) {
  state.filters.topic = event.target.value;
  renderApp();
}

function handleTaskActions(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const { action, taskId } = button.dataset;

  if (action === "toggle") {
    toggleTaskStatus(taskId);
  }

  if (action === "edit") {
    startEditing(taskId);
  }

  if (action === "delete") {
    deleteTask(taskId);
  }
}

function toggleTaskStatus(taskId) {
  state.tasks = state.tasks.map((task) =>
    task.id === taskId
      ? { ...task, status: task.status === "completed" ? "pending" : "completed" }
      : task
  );

  saveTasks();
  renderApp();
}

function startEditing(taskId) {
  const task = findTaskById(taskId);

  if (!task) {
    return;
  }

  state.editingTaskId = task.id;
  elements.formTitle.textContent = "Edit task";
  elements.taskId.value = task.id;
  elements.titleInput.value = task.title;
  elements.descriptionInput.value = task.description;
  elements.topicInput.value = task.topic;
  elements.priorityInput.value = task.priority;
  elements.dueDateInput.value = task.dueDate;
  elements.statusInput.value = task.status;
  elements.titleInput.focus();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);

  if (state.editingTaskId === taskId) {
    resetForm();
  }

  saveTasks();
  renderApp();
}

function clearCompletedTasks() {
  state.tasks = state.tasks.filter((task) => task.status !== "completed");
  saveTasks();
  renderApp();
}

function resetForm() {
  state.editingTaskId = null;
  elements.taskForm.reset();
  elements.taskId.value = "";
  elements.statusInput.value = "pending";
  elements.priorityInput.value = "Medium";
  elements.topicInput.value = "BSCS Study";
  elements.formTitle.textContent = "Create a task";
}

function findTaskById(taskId) {
  return state.tasks.find((task) => task.id === taskId);
}

function getFilteredTasks() {
  return state.tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(state.filters.search) ||
      task.description.toLowerCase().includes(state.filters.search) ||
      task.topic.toLowerCase().includes(state.filters.search);

    const matchesStatus = state.filters.status === "all" || task.status === state.filters.status;
    const matchesTopic = state.filters.topic === "all" || task.topic === state.filters.topic;

    return matchesSearch && matchesStatus && matchesTopic;
  });
}

function renderApp() {
  const filteredTasks = getFilteredTasks();
  renderTaskList(filteredTasks);
  renderStats();
}

function renderTaskList(tasks) {
  elements.highPriorityList.innerHTML = "";
  elements.mediumPriorityList.innerHTML = "";
  elements.lowPriorityList.innerHTML = "";
  elements.emptyState.classList.toggle("is-hidden", tasks.length > 0);

  if (!tasks.length) {
    return;
  }

  tasks.forEach((task, index) => {
    const card = document.createElement("article");
    card.className = `task-card ${getCardPalette(index)}`;

    card.innerHTML = `
      <div class="task-top">
        <span class="status-pill ${task.status}">${capitalize(task.status)}</span>
        <span class="meta-chip">${task.priority} Priority</span>
      </div>
      <div>
        <h4 class="task-title">${escapeHtml(task.title)}</h4>
        <p class="task-description">${escapeHtml(task.description || "No description added.")}</p>
      </div>
      <div class="task-meta">
        <span class="meta-chip">${escapeHtml(task.topic)}</span>
        <span class="meta-chip">${task.dueDate ? formatDate(task.dueDate) : "No due date"}</span>
      </div>
      <div class="task-actions">
        <button class="small-button" type="button" data-action="toggle" data-task-id="${task.id}">
          ${task.status === "completed" ? "Mark Pending" : "Mark Complete"}
        </button>
        <button class="small-button" type="button" data-action="edit" data-task-id="${task.id}">
          Edit
        </button>
        <button class="small-button danger" type="button" data-action="delete" data-task-id="${task.id}">
          Delete
        </button>
      </div>
    `;

    getLaneForTask(task.priority).append(card);
  });
}

function getLaneForTask(priority) {
  if (priority === "High") {
    return elements.highPriorityList;
  }

  if (priority === "Low") {
    return elements.lowPriorityList;
  }

  return elements.mediumPriorityList;
}

function renderStats() {
  const completedCount = state.tasks.filter((task) => task.status === "completed").length;
  const pendingCount = state.tasks.filter((task) => task.status === "pending").length;
  const highPriorityCount = state.tasks.filter((task) => task.priority === "High").length;

  elements.totalTasks.textContent = String(state.tasks.length);
  elements.completedTasks.textContent = String(completedCount);
  elements.pendingTasks.textContent = String(pendingCount);
  elements.highPriorityTasks.textContent = String(highPriorityCount);
}

function getCardPalette(index) {
  const palettes = ["blue", "green", "amber", "violet", "rose"];
  return palettes[index % palettes.length];
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
