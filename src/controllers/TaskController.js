import Task from '../models/Task.js';

/**
 * TaskController
 * Responsible for task-related business logic and operations
 */
class TaskController {
  /**
   * Create a TaskController
   * @param {Object} taskStore - The task data store/repository
   * @param {Object} listController - The list controller for list-related operations
   */
  constructor(taskStore, listController) {
    this.taskStore = taskStore;
    this.listController = listController;
  }

  /**
   * Create a new task
   * @param {Object} taskData - The task data
   * @returns {Task} The created task
   */
  createTask(taskData) {
    // Ensure we have a valid list ID
    const listId = taskData.listId || this.listController.getDefaultListId();

    // Create task with a unique ID
    const newTask = new Task(
      `task-${Date.now()}`,
      taskData.title,
      taskData.dueDate,
      listId,
      taskData.notes || '',
      taskData.flagged || false,
      taskData.priority || 'normal'
    );

    // Add to store and persist
    this.taskStore.addTask(newTask);

    return newTask;
  }

  /**
   * Update an existing task
   * @param {string} taskId - The ID of the task to update
   * @param {Object} taskData - The updated task data
   * @returns {Task|null} The updated task or null if not found
   */
  updateTask(taskId, taskData) {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    // Update task properties
    task.setTitle(taskData.title)
      .setDueDate(taskData.dueDate)
      .setListId(taskData.listId)
      .setNotes(taskData.notes || '')
      .setFlagged(taskData.flagged || false)
      .setPriority(taskData.priority || 'normal');

    // Persist changes
    this.taskStore.saveTask(task);

    return task;
  }

  /**
   * Delete a task
   * @param {string} taskId - The ID of the task to delete
   * @returns {boolean} True if deleted successfully
   */
  deleteTask(taskId) {
    return this.taskStore.removeTask(taskId);
  }

  /**
   * Toggle task completion status
   * @param {string} taskId - The ID of the task to toggle
   * @returns {Task|null} The updated task or null if not found
   */
  toggleTaskCompletion(taskId) {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    task.toggleCompleteStatus();
    this.taskStore.saveTask(task);

    return task;
  }

  /**
   * Get a task by ID
   * @param {string} taskId - The ID of the task to get
   * @returns {Task|null} The task or null if not found
   */
  getTaskById(taskId) {
    return this.taskStore.getTaskById(taskId);
  }

  /**
   * Get all tasks
   * @returns {Array<Task>} All tasks
   */
  getAllTasks() {
    return this.taskStore.getAllTasks();
  }

  /**
   * Get tasks due today
   * @returns {Array<Task>} Tasks due today
   */
  getTasksDueToday() {
    return this.taskStore.getTasksDueToday();
  }

  /**
   * Get flagged tasks
   * @returns {Array<Task>} Flagged tasks
   */
  getFlaggedTasks() {
    return this.taskStore.getFlaggedTasks();
  }

  /**
   * Get tasks for a specific list
   * @param {string} listId - The ID of the list
   * @returns {Array<Task>} Tasks in the list
   */
  getTasksByListId(listId) {
    return this.taskStore.getTasksByListId(listId);
  }

  /**
   * Delete all tasks associated with a list
   * @param {string} listId - The ID of the list
   * @returns {number} Number of tasks deleted
   */
  deleteTasksByListId(listId) {
    return this.taskStore.removeTasksByListId(listId);
  }
}

export default TaskController; 