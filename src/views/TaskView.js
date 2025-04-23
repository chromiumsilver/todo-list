import { format } from 'date-fns';

/**
 * TaskView
 * Handles UI rendering and interactions for tasks
 */
class TaskView {
  /**
   * Create a TaskView
   * @param {HTMLElement} container - The container element for tasks
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.taskClickHandlers = {
      toggle: null,
      edit: null,
      delete: null
    };
  }

  /**
   * Register event handlers for task actions
   * @param {string} action - The action to handle (toggle, edit, delete)
   * @param {Function} handler - The handler function
   */
  on(action, handler) {
    if (this.taskClickHandlers.hasOwnProperty(action)) {
      this.taskClickHandlers[action] = handler;
    }
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Use event delegation for task actions
    this.container.addEventListener('click', (e) => {
      const taskItem = e.target.closest('.task-item');
      if (!taskItem) return;

      const taskId = taskItem.dataset.id;

      // Handle task checkbox (toggle completion)
      if (e.target.closest('.task-checkbox') && this.taskClickHandlers.toggle) {
        this.taskClickHandlers.toggle(taskId, taskItem);
      }

      // Handle edit button
      if (e.target.closest('.task-edit') && this.taskClickHandlers.edit) {
        this.taskClickHandlers.edit(taskId);
      }

      // Handle delete button
      if (e.target.closest('.task-delete') && this.taskClickHandlers.delete) {
        this.taskClickHandlers.delete(taskId, taskItem);
      }
    });
  }

  /**
   * Render a list of tasks
   * @param {Array<Task>} tasks - The tasks to render
   */
  renderTasks(tasks) {
    // Clear existing tasks
    this.container.innerHTML = '';

    // Empty state
    if (tasks.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Add each task
    tasks.forEach((task, index) => {
      const taskElement = this.createTaskElement(task, index);
      this.container.appendChild(taskElement);
    });
  }

  /**
   * Create a task element
   * @param {Task} task - The task data
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
   * Render empty state message when no tasks exist
   */
  renderEmptyState() {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-tasks-message';
    emptyMessage.textContent = 'No tasks to display';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.padding = '2rem';
    emptyMessage.style.color = 'var(--color-text-muted)';
    emptyMessage.style.fontStyle = 'italic';
    this.container.appendChild(emptyMessage);
  }

  /**
   * Remove a task element from the DOM
   * @param {HTMLElement} taskElement - The task element to remove
   */
  removeTaskElement(taskElement) {
    taskElement.remove();

    // If no tasks left, show empty state
    if (this.container.children.length === 0) {
      this.renderEmptyState();
    }
  }

  /**
   * Update task completion styling
   * @param {HTMLElement} taskElement - The task element to update
   * @param {boolean} completed - Whether the task is completed
   */
  updateTaskCompletionStatus(taskElement, completed) {
    if (completed) {
      taskElement.classList.add('completed');
    } else {
      taskElement.classList.remove('completed');
    }
  }
}

export default TaskView; 