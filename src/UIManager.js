/**
 * UI class
 * Handles all DOM manipulation and UI updates
 */
class UIManager {
  static FILTER_TYPES = {
    TODAY: 'Today',
    ALL: 'All',
    FLAGGED: 'Flagged'
  };

  constructor(taskManager) {
    // Store reference to the task manager
    this.taskManager = taskManager;

    // Cache DOM elements
    this.elements = this.cacheDOMElements();

    // Initialize UI
    this.init();
  }

  /**
   * Cache all DOM elements for better performance
   * @returns {Object} Object containing DOM elements
   */
  cacheDOMElements() {
    return {
      taskList: document.querySelector('.tasks'),
      taskListTitle: document.querySelector('.task-list-title'),
      addTaskBtn: document.querySelector('.add-task-btn'),
      filterList: document.querySelector('.filters'),
      filterBtns: document.querySelectorAll('.filter-btn'),
      todayBtn: document.querySelector('#filter-today'),
      sidebar: document.querySelector('.sidebar'),
      listsContainer: document.querySelector('.lists'),
      addListBtn: document.querySelector('.add-list-btn'),
      // Task form modal elements
      taskFormModal: document.querySelector('#taskFormModal'),
      closeTaskModalBtn: document.querySelector('#closeTaskModal'),
      addTaskForm: document.querySelector('#addTaskForm'),
      cancelTaskBtn: document.querySelector('#cancelTaskBtn'),
      taskListSelect: document.querySelector('#taskList')
    };
  }

  /**
   * Initialize the UI
   */
  init() {
    this.setupEventListeners();
    this.populateListsDropdown()
    this.renderInitialView();
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Event Delegation: Task actions (edit, delete)
    this.elements.taskList.addEventListener('click', (e) => {
      // Handle task checkbox
      if (e.target.closest('.task-checkbox')) {
        const taskItem = e.target.closest('.task-item');
        const taskId = taskItem.dataset.id;

        // Toggle complete status
        this.taskManager.toggleTaskCompleteStatus(taskId);
        // Toggle styling
        taskItem.classList.toggle('completed');
      }

      //TODO: Handle edit button clicks

      // Handle delete button clicks
      const deleteBtn = e.target.closest('.task-delete');
      if (deleteBtn) {
        const taskItem = e.target.closest(".task-item");
        const taskId = taskItem.dataset.id;
        if (confirm('Are you sure you want to delete this task?')) {
          const deleted = this.taskManager.deleteTask(taskId);
          this.removeTaskElement(taskItem);
        }
      }
    });

    // Add new task
    this.elements.addTaskBtn.addEventListener('click', () => {
      this.showAddTaskForm();
      // this.renderTasks();
    });

    // Close modal when clicking the close button
    this.elements.closeTaskModalBtn.addEventListener('click', this.closeTaskModal.bind(this));

    // Close modal when clicking the cancel button
    this.elements.cancelTaskBtn.addEventListener('click', this.closeTaskModal.bind(this));

    // Close modal when clicking outside the modal
    this.elements.taskFormModal.addEventListener('click', (e) => {
      if (e.target === this.elements.taskFormModal) {
        this.closeTaskModal();
      }
    });

    // Handle form submission
    this.elements.addTaskForm.addEventListener('submit', this.handleTaskFormSubmit.bind(this));

    // Handle filter view change
    this.elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.updateActiveButton(btn);
        const currentView = btn.querySelector('.filter-name').textContent;
        // Update tasks displayed
        this.elements.taskListTitle.textContent = currentView;
        this.renderTasks();
      });
    });

  }

  /**
   * Render the initial view
   */
  renderInitialView() {
    this.updateActiveButton(this.elements.todayBtn);
    this.renderTasks();
  }

  /**
   * Update the active button in the sidebar
   * @param {HTMLElement} activeBtn - The button to set as active
   */
  updateActiveButton(activeBtn) {
    // Remove active class from all buttons
    this.elements.filterBtns.forEach(btn => {
      btn.classList.remove('active');
    });

    // Add active class to the clicked button
    activeBtn.classList.add('active');
  }


  /**
   * Render tasks in the task list
   */
  renderTasks() {
    // Clear existing tasks
    this.elements.taskList.innerHTML = '';

    // Render the current view
    const currentView = this.elements.taskListTitle.textContent;
    let tasks;
    //TODO: delete
    console.log(currentView);
    if (Object.values(UIManager.FILTER_TYPES).includes(currentView)) {
      tasks = this.applyFilter(currentView);
    } else {
      tasks = this.showList(currentView);
    }
    // Empty tasks
    if (tasks.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Add each task
    tasks.forEach((task, index) => {
      const taskElement = this.createTaskElement(task, index);
      this.elements.taskList.appendChild(taskElement);
    });
  }

  /**
   * Render empty state message
   */
  renderEmptyState() {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-tasks-message';
    emptyMessage.textContent = 'No tasks to display';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.padding = '2rem';
    emptyMessage.style.color = 'var(--color-text-muted)';
    emptyMessage.style.fontStyle = 'italic';
    this.elements.taskList.appendChild(emptyMessage);
  }

  /**
   * Apply a filter to the task list
   * @param {UIManager.FILTER_TYPES} filterType - The type of filter to apply
   */
  applyFilter(filterType) {
    // Update the title
    this.elements.taskListTitle.textContent = filterType;
    // Get filtered tasks from the task manager
    switch (filterType) {
      case UIManager.FILTER_TYPES.TODAY:
        return this.taskManager.getTasksDueToday();
      case UIManager.FILTER_TYPES.ALL:
        return this.taskManager.getAllTasks();
      case UIManager.FILTER_TYPES.FLAGGED:
        return this.taskManager.getFlaggedTasks();
      default:
        console.error("wrong filterType");
    }
  }

  /**
   * Show tasks for a specific list
   * @param {string} listName - The name of the list to show
   */
  showList(listName) {
    // Get tasks for this list from the task manager
    return tasks = this.taskManager.getTasksByList(listName);

  }


  /**
   * Create a task element
   * @param {Object} task - The task data
   * @param {number} index - The task index
   * @returns {HTMLElement} The task element
   */
  createTaskElement(task, index) {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.dataset.id = task.id;

    if (task.completed) {
      taskItem.classList.add('completed');
    }

    // Determine if we should show priority indicator
    const priorityClass = task.priority !== 'normal' ? `priority-${task.priority}` : '';
    const flaggedIcon = task.flagged ? '<span class="material-icons task-flag">flag</span>' : '';

    taskItem.innerHTML = `
      <input type="checkbox" id="task-${index}" class="task-checkbox" ${task.completed ? 'checked' : ''}>
      <label for="task-${index}" class="task-text ${priorityClass}">${task.title}</label>
      ${flaggedIcon}
      <div class="task-actions">
        <button class="task-edit">
          <span class="material-icons">edit</span>
        </button>
        <button class="task-delete">
          <span class="material-icons">delete</span>
        </button>
      </div>
    `;

    return taskItem;
  }

  /**
   * Remove a task element from the DOM
   * @param {HTMLElement} taskElement - The task element to remove
   */
  removeTaskElement(taskElement) {
    taskElement.remove();

    // If no tasks left, show empty state
    if (this.elements.taskList.children.length === 0) {
      this.renderEmptyState();
    }
  }

  /**
   * Show form to add a new task
   */
  showAddTaskForm() {
    // Reset form
    this.elements.addTaskForm.reset();

    // Set default due date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').value = today;

    // Show modal
    this.elements.taskFormModal.classList.add('active');
  }

  /**
   * Close the task form modal
   */
  closeTaskModal() {
    this.elements.taskFormModal.classList.remove('active');
  }

  /**
   * Handle task form submission
   * @param {Event} e - The submission event
   */
  handleTaskFormSubmit(e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this.elements.addTaskForm);
    const taskData = {
      title: formData.get('title'),
      notes: formData.get('notes'),
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate')) : null,
      listId: formData.get('listId'),
      flagged: formData.get('flagged') === 'on',
      priority: formData.get('priority')
    };

    // Validate form data
    if (!taskData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    // Create the task using the TaskManager
    this.taskManager.addTask(taskData);

    // Close the modal
    this.closeTaskModal();

    // Re-render tasks
    this.renderTasks();
  }

  /**
   * Populate the lists dropdown in the add task form
   */
  populateListsDropdown() {
    // Clear existing options
    this.elements.taskListSelect.innerHTML = '';

    // Add options for each list
    this.taskManager.lists.forEach(list => {
      const option = document.createElement('option');
      option.value = list.id;
      option.textContent = list.name;
      this.elements.taskListSelect.appendChild(option);
    });
  }

  /**
   * Create toggle button for mobile
   * @returns {HTMLElement} The toggle button
   */
  // createToggleButton() {
  //   const toggleBtn = document.createElement('button');
  //   toggleBtn.className = 'sidebar-toggle';
  //   toggleBtn.innerHTML = '<span class="material-icons">menu</span>';
  //   return toggleBtn;
  // }

  /**
   * Create close button for mobile sidebar
   * @returns {HTMLElement} The close button
   */
  // createCloseButton() {
  //   const closeBtn = document.createElement('button');
  //   closeBtn.className = 'close-sidebar';
  //   closeBtn.innerHTML = '<span class="material-icons">close</span>';
  //   return closeBtn;
  // }

  /**
   * Capitalize the first letter of a string
   * @param {string} string - The string to capitalize
   * @returns {string} The capitalized string
   */
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

export default UIManager; 