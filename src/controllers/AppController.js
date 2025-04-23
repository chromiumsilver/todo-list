import eventBus from '../utils/EventBus.js';

/**
 * AppController
 * Main controller that coordinates all components of the application
 */
class AppController {
  /**
   * Create an AppController
   * @param {Object} components - Object containing all components
   * @param {Object} components.taskController - The task controller
   * @param {Object} components.listController - The list controller
   * @param {Object} components.taskView - The task view
   * @param {Object} components.listView - The list view
   * @param {Object} components.taskFormView - The task form view
   * @param {Object} components.listFormView - The list form view 
   * @param {HTMLElement} components.taskListTitle - The task list title element
   * @param {NodeList} components.filterButtons - The filter buttons
   * @param {HTMLElement} components.addTaskBtn - The add task button
   * @param {HTMLElement} components.addListBtn - The add list button
   */
  constructor(components) {
    this.taskController = components.taskController;
    this.listController = components.listController;
    this.taskView = components.taskView;
    this.listView = components.listView;
    this.taskFormView = components.taskFormView;
    this.listFormView = components.listFormView;
    this.taskListTitle = components.taskListTitle;
    this.filterButtons = components.filterButtons;
    this.todayButton = components.todayButton;
    this.addTaskBtn = components.addTaskBtn;
    this.addListBtn = components.addListBtn;

    this.currentFilter = 'Today';

    // Initialize the application
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    // Initialize data if needed
    this.ensureDefaultData();

    // Set up event handlers
    this.setupEventHandlers();

    // Subscribe to events
    this.setupEventSubscriptions();

    // Initial render
    this.renderInitialView();
  }

  /**
   * Ensure we have at least default data
   */
  ensureDefaultData() {
    const lists = this.listController.getAllLists();
    if (lists.length === 0) {
      this.listController.createDefaultList();
    }
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Set up task view event handlers
    this.taskView.on('toggle', (taskId, taskElement) => {
      const task = this.taskController.toggleTaskCompletion(taskId);
      if (task) {
        this.taskView.updateTaskCompletionStatus(taskElement, task.completed);
      }
    });

    this.taskView.on('edit', (taskId) => {
      this.showEditTaskForm(taskId);
    });

    this.taskView.on('delete', (taskId, taskElement) => {
      if (confirm('Are you sure you want to delete this task?')) {
        const deleted = this.taskController.deleteTask(taskId);
        if (deleted) {
          this.taskView.removeTaskElement(taskElement);
          eventBus.publish('task:deleted', { taskId });
        }
      }
    });

    // Initialize task view event listeners
    this.taskView.initEventListeners();

    // Set up list view event handlers
    this.listView.on('select', (listId, listName, listBtn) => {
      this.currentFilter = listName;
      this.listView.updateActiveButton(listBtn, document.querySelectorAll('.list-btn, .filter-btn'));
      this.taskListTitle.textContent = listName;
      this.renderCurrentView();
    });

    this.listView.on('delete', (listId, listElement) => {
      if (confirm('Are you sure you want to delete this list? All tasks in this list will also be deleted.')) {
        const deleted = this.listController.deleteList(listId, (listId) => {
          this.taskController.deleteTasksByListId(listId);
        });

        if (deleted) {
          // Re-render the lists
          this.renderLists();

          // If we deleted the active list, switch to Today view
          if (listElement.classList.contains('active')) {
            this.setDefaultView();
          }

          // Re-render tasks
          this.renderCurrentView();

          // Publish event
          eventBus.publish('list:deleted', { listId });
        } else {
          alert('Cannot delete the last list.');
        }
      }
    });

    // Initialize list view event listeners
    this.listView.initEventListeners();

    // Set up filter button handlers
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentFilter = btn.querySelector('.filter-name').textContent;
        this.listView.updateActiveButton(btn, document.querySelectorAll('.list-btn, .filter-btn'));
        this.taskListTitle.textContent = this.currentFilter;
        this.renderCurrentView();
      });
    });

    // Set up task form submission handler
    this.taskFormView.onSubmit((formData, taskId) => {
      if (!formData.title.trim()) {
        alert('Please enter a task title');
        return;
      }

      if (taskId) {
        // Update existing task
        const updatedTask = this.taskController.updateTask(taskId, formData);
        if (updatedTask) {
          eventBus.publish('task:updated', { task: updatedTask });
        }
      } else {
        // Create new task
        const newTask = this.taskController.createTask(formData);
        eventBus.publish('task:created', { task: newTask });
      }

      // Re-render tasks
      this.renderCurrentView();
    });

    // Set up list form submission handler
    this.listFormView.onSubmit((formData, listId) => {
      if (!formData.name.trim()) {
        alert('Please enter a list name');
        return;
      }

      if (listId) {
        // Update existing list
        const updatedList = this.listController.updateList(listId, formData);
        if (updatedList) {
          eventBus.publish('list:updated', { list: updatedList });
        }
      } else {
        // Create new list
        const newList = this.listController.createList(formData);
        eventBus.publish('list:created', { list: newList });
      }

      // Re-render lists
      this.renderLists();
    });

    // Add task button handler
    if (this.addTaskBtn) {
      this.addTaskBtn.addEventListener('click', () => {
        this.showAddTaskForm();
      });
    }

    // Add list button handler
    if (this.addListBtn) {
      this.addListBtn.addEventListener('click', () => {
        this.showAddListForm();
      });
    }
  }

  /**
   * Set up event subscriptions
   */
  setupEventSubscriptions() {
    // Subscribe to task:created event
    eventBus.subscribe('task:created', ({ task }) => {
      // If we're in the appropriate view, re-render
      if (this.shouldShowTaskInCurrentView(task)) {
        this.renderCurrentView();
      }
    });

    // Subscribe to task:updated event
    eventBus.subscribe('task:updated', ({ task }) => {
      // Re-render to reflect changes
      this.renderCurrentView();
    });

    // Subscribe to list:created event
    eventBus.subscribe('list:created', ({ list }) => {
      // Re-render lists
      this.renderLists();
    });

    // Subscribe to list:updated event
    eventBus.subscribe('list:updated', ({ list }) => {
      // Re-render lists
      this.renderLists();

      // If this is the current view, update the title
      if (this.currentFilter === list.name) {
        this.taskListTitle.textContent = list.name;
      }
    });
  }

  /**
   * Check if a task should be shown in the current view
   * @param {Task} task - The task to check
   * @returns {boolean} Whether the task should be shown
   */
  shouldShowTaskInCurrentView(task) {
    switch (this.currentFilter) {
      case 'Today':
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        return taskDate.toDateString() === today.toDateString();
      case 'All':
        return true;
      case 'Flagged':
        return task.flagged;
      default:
        // Assume it's a list name
        const list = this.listController.getListByName(this.currentFilter);
        return list && task.listId === list.id;
    }
  }

  /**
   * Render the initial view
   */
  renderInitialView() {
    // Set default active filter
    this.setDefaultView();

    // Render the data
    this.renderLists();
    this.renderCurrentView();
  }

  /**
   * Set the default view (Today)
   */
  setDefaultView() {
    this.currentFilter = 'Today';
    this.taskListTitle.textContent = 'Today';
    this.listView.updateActiveButton(this.todayButton, document.querySelectorAll('.list-btn, .filter-btn'));
  }

  /**
   * Render the lists
   */
  renderLists() {
    const lists = this.listController.getAllLists();
    this.listView.renderLists(lists);
  }

  /**
   * Render the current view based on the current filter
   */
  renderCurrentView() {
    let tasks;

    // Determine which tasks to display based on the current filter
    switch (this.currentFilter) {
      case 'Today':
        tasks = this.taskController.getTasksDueToday();
        break;
      case 'All':
        tasks = this.taskController.getAllTasks();
        break;
      case 'Flagged':
        tasks = this.taskController.getFlaggedTasks();
        break;
      default:
        // Assume it's a list name
        const list = this.listController.getListByName(this.currentFilter);
        if (list) {
          tasks = this.taskController.getTasksByListId(list.id);
        } else {
          tasks = [];
        }
    }

    // Render the tasks
    this.taskView.renderTasks(tasks);
  }

  /**
   * Show form to add a new task
   */
  showAddTaskForm() {
    const lists = this.listController.getAllLists();

    // Use default list if no selected list
    let defaultListId = null;
    if (this.currentFilter !== 'Today' && this.currentFilter !== 'All' && this.currentFilter !== 'Flagged') {
      const currentList = this.listController.getListByName(this.currentFilter);
      if (currentList) {
        defaultListId = currentList.id;
      }
    }

    if (defaultListId && this.taskFormView.form.elements['listId']) {
      this.taskFormView.form.elements['listId'].value = defaultListId;
    }

    this.taskFormView.showAddForm(lists);
  }

  /**
   * Show form to edit an existing task
   * @param {string} taskId - The ID of the task to edit
   */
  showEditTaskForm(taskId) {
    const task = this.taskController.getTaskById(taskId);
    if (!task) return;

    const lists = this.listController.getAllLists();
    this.taskFormView.showEditForm(task, lists);
  }

  /**
   * Show form to add a new list
   */
  showAddListForm() {
    this.listFormView.showAddForm();
  }

  /**
   * Show form to edit an existing list
   * @param {string} listId - The ID of the list to edit
   */
  showEditListForm(listId) {
    const list = this.listController.getListById(listId);
    if (!list) return;

    this.listFormView.showEditForm(list);
  }
}

export default AppController; 