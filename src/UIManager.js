import { format } from "date-fns";
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

    // Track current editing task
    this.currentEditingTaskId = null;

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
      taskForm: document.querySelector('#taskForm'),
      cancelTaskBtn: document.querySelector('#cancelTaskBtn'),
      taskListSelect: document.querySelector('#taskList'),
      modalTitle: document.querySelector('.modal-header h3'),
      submitTaskBtn: document.querySelector('.btn-submit'),
      // List form modal elements
      listFormModal: document.querySelector('#listFormModal'),
      listForm: document.querySelector('#listForm'),
      closeListModalBtn: document.querySelector('#closeListModal'),
      cancelListBtn: document.querySelector('#cancelListBtn')
    };
  }

  /**
   * Initialize the UI
   */
  init() {
    this.setupEventListeners();
    this.renderInitialView();
    this.populateListsDropdown();
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Event Delegation: Task actions (complete, edit, delete)
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

      // Handle edit button clicks
      const editBtn = e.target.closest('.task-edit');
      if (editBtn) {
        const taskItem = e.target.closest('.task-item');
        const taskId = taskItem.dataset.id;
        this.showEditTaskForm(taskId);
      }

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
    });

    // Close modal when clicking the close button
    this.elements.closeTaskModalBtn.addEventListener('click', this.closeTaskModal.bind(this));
    this.elements.closeListModalBtn.addEventListener('click', this.closeListModal.bind(this));

    // Close modal when clicking the cancel button
    this.elements.cancelTaskBtn.addEventListener('click', this.closeTaskModal.bind(this));
    this.elements.cancelListBtn.addEventListener('click', this.closeListModal.bind(this));

    // Close modal when clicking outside the modal
    this.elements.taskFormModal.addEventListener('click', (e) => {
      if (e.target === this.elements.taskFormModal) {
        this.closeTaskModal();
      }
    });
    this.elements.listFormModal.addEventListener('click', (e) => {
      if (e.target === this.elements.listFormModal) {
        this.closeListModal();
      }
    });

    // Handle form submission
    this.elements.taskForm.addEventListener('submit', this.handleTaskFormSubmit.bind(this));

    // Handle filter view change
    this.elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.updateActiveButton(btn);
        // Update tasks displayed
        const currentView = btn.querySelector('.filter-name').textContent;
        this.elements.taskListTitle.textContent = currentView;
        this.renderTasks();
      });
    });

    // Event delegation for list actions
    this.elements.listsContainer.addEventListener('click', (e) => {
      // Handle list button clicks
      const listBtn = e.target.closest('.list-btn');
      if (listBtn) {
        const listId = listBtn.dataset.id;
        const listName = listBtn.querySelector('.list-name').textContent;
        // update active button and display tasks for this list
        this.updateActiveButton(listBtn);
        this.elements.taskListTitle.textContent = listName;
        this.renderTasks();
      }

      // Handle list delete button clicks
      const deleteListBtn = e.target.closest('.list-delete');
      if (deleteListBtn) {
        const listItem = deleteListBtn.closest('.list-btn');
        const listId = listItem.dataset.id;
        if (confirm('Are you sure you want to delete this list? All tasks in this list will also be deleted.')) {
          const deleted = this.taskManager.deleteList(listId);

          if (deleted) {
            // Re-render the lists
            this.renderLists();
            this.populateListsDropdown();

            // If we deleted the active list, switch to Today view
            if (listItem.classList.contains('active')) {
              this.updateActiveButton(this.elements.todayBtn);
              this.elements.taskListTitle.textContent = UIManager.FILTER_TYPES.TODAY;
            }

            // Re-render tasks
            this.renderTasks();
          } else {
            alert('Cannot delete the last list.');
          }
        }
      }

    });

    // Add new list
    this.elements.addListBtn.addEventListener('click', () => {
      this.showAddListForm();
    })

    // Handle list form submission
    this.elements.listForm.addEventListener('submit', this.handleListFormSubmit.bind(this));
  }

  /**
   * Render the initial view
   */
  renderInitialView() {
    this.updateActiveButton(this.elements.todayBtn);
    this.renderTasks();
    this.renderLists();
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

    this.elements.listsContainer.querySelectorAll('.list-btn').forEach(btn => {
      btn.classList.remove('active');
    })

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
   * Render all lists in the sidebar
   */
  renderLists() {
    // Get the lists section content
    const listHeader = document.querySelector('.list-header');

    // Clear existing list buttons
    const listBtns = document.querySelectorAll('.list-btn');
    listBtns.forEach(btn => {
      if (btn.parentNode === this.elements.listsContainer) {
        btn.remove();
      }
    });

    // Re-create list header and add it first
    if (!listHeader) {
      const header = document.createElement('h2');
      header.className = 'list-header';
      header.textContent = 'My Lists';
      this.elements.listsContainer.appendChild(header);
    }

    // Add lists
    this.taskManager.getAllLists().forEach(list => {
      const listBtn = this.createListBtn(list);
      this.elements.listsContainer.appendChild(listBtn);
    });
  }

  /**
   * Create a list button element
   * @param {Object} list - The list data
   * @returns {HTMLElement} The list button element
   */
  createListBtn(list) {
    const listBtn = document.createElement('button');
    listBtn.className = 'list-btn';
    listBtn.dataset.id = list.id;

    listBtn.innerHTML = `
      <span class="list-icon material-icons">${list.icon}</span>
      <span class="list-name">${list.name}</span>
      <button class="list-delete">
        <span class="material-icons">delete</span>
      </button>
    `;

    // Prevent event bubbling from delete button
    // deleteBtn.addEventListener('click', (e) => {
    //   e.stopPropagation();
    // });

    return listBtn;
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
    return this.taskManager.getTasksByList(listName);

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

    // Format the due date if available
    let dueDateDisplay = '';
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDateDisplay = `<span class="task-due-date">${format(dueDate, 'MMM d, yyyy')}</span>`;
    }

    taskItem.innerHTML = `
     <input type="checkbox" id="task-${index}" class="task-checkbox" ${task.completed ? 'checked' : ''}>
     <div class="task-content">
       <label for="task-${index}" class="task-text ${priorityClass}">${task.title}</label>
       ${dueDateDisplay}
     </div>
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
    // Reset form and editing status
    this.currentEditingTaskId = null;
    this.elements.taskForm.reset();

    // Update modal UI for add mode
    this.elements.modalTitle.textContent = 'Add New Task';
    this.elements.submitTaskBtn.textContent = 'Add Task';

    // Set default due date to today
    const today = format(new Date(), 'yyyy-MM-dd');
    document.getElementById('taskDueDate').value = today;

    // Show modal
    this.elements.taskFormModal.classList.add('active');
  }

  /**
   * Show form to edit an existing task
   * @param {string} taskId - The ID of the task to edit
   */
  showEditTaskForm(taskId) {
    const task = this.taskManager.getTaskById(taskId);
    if (!task) return;

    // Set current editing task
    this.currentEditingTaskId = taskId;

    // Update modal UI for edit mode
    this.elements.modalTitle.textContent = 'Edit Task';
    this.elements.submitTaskBtn.textContent = 'Update Task';

    // Fill form with task data
    const form = this.elements.taskForm;
    form.elements['title'].value = task.title;
    form.elements['notes'].value = task.notes || '';

    // Format date for input if it exists
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      form.elements['dueDate'].value = format(dueDate, 'yyyy-MM-dd');
    } else {
      form.elements['dueDate'].value = '';
    }

    form.elements['listId'].value = task.listId;
    form.elements['flagged'].checked = task.flagged;
    form.elements['priority'].value = task.priority;

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
    const formData = new FormData(this.elements.taskForm);
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

    if (this.currentEditingTaskId) {
      // Update existing task
      this.taskManager.updateTask(this.currentEditingTaskId, taskData);
    } else {
      // Create new task
      this.taskManager.addTask(taskData);
    }

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
   * Show form to add a new list
   */
  showAddListForm() {
    // Reset form
    this.elements.listForm.reset();
    // Show modal
    this.elements.listFormModal.classList.add('active');
  }

  /**
  * Close the list form modal
  */
  closeListModal() {
    this.elements.listFormModal.classList.remove('active');
  }

  handleListFormSubmit(e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this.elements.listForm);
    const listData = {
      name: formData.get('name'),
      icon: formData.get('icon')
    };

    // Validate form data
    if (!listData.name.trim()) {
      alert('Please enter a list name');
      return;
    }

    // Create new list
    this.taskManager.addList(listData);

    // Close the modal
    this.closeListModal();

    // Re-render lists
    this.renderLists();
    this.populateListsDropdown();
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