import { startOfToday, endOfToday } from 'date-fns';
import Task from './Task.js';

/**
 * TaskManager class
 * Handles all task-related operations and data management
 */
class TaskManager {
  constructor() {
    // Initialize data
    this.tasks = [];
    this.lists = [];

    // Load tasks from storage
    this.loadTasks();
  }

  /**
   * Load tasks from localStorage
   */
  loadTasks() {
    const storedTasks = localStorage.getItem('tasks');

    if (storedTasks) {
      const taskObjects = JSON.parse(storedTasks);
      // Convert plain objects back to Task instances
      this.tasks = taskObjects.map(taskObj => new Task(
        taskObj.id,
        taskObj.title,
        taskObj.dueDate,
        taskObj.listId,
        taskObj.notes,
        taskObj.flagged,
        taskObj.priority,
        taskObj.completed
      ));
    }
    else {
      // Add sample tasks for demonstration
      this.addSampleTasks();
    }
  }

  /**
   * Add sample tasks for demonstration
   */
  addSampleTasks() {
    const sampleTasks = [
      new Task(
        'task-1',
        'Buy groceries',
        new Date(Date.now() + 86400000), // tomorrow
        'family'
      ),
      new Task(
        'task-2',
        'Call mom',
        new Date(),
        'family'
      )
    ];

    this.tasks = sampleTasks;
    this.saveTasks();
  }

  /**
  * Add default list
  */
  addDefaultList() {
    const defaultList = {
      id: `list-default`,
      name: 'Family',
      icon: 'home'
    }

    this.lists.push(defaultList);
    this.saveLists();
  }

  /**
   * Save tasks to localStorage
   */
  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  /**
   * Create a new task from form data
   * @param {Object} taskData - The task data from the form
   * @returns {Task} The created task
   */
  addTask(taskData) {
    const newTask = new Task(
      `task-${Date.now()}`,
      taskData.title,
      taskData.dueDate,
      taskData.listId || 'family', // Default to family list if not specified
      taskData.notes || '',
      taskData.flagged || false,
      taskData.priority || 'normal'
    );

    this.tasks.push(newTask);
    this.saveTasks();
    return newTask;
  }

  /**
   * Update an existing task
   * @param {string} taskId - The ID of the task to update
   * @param {Object} taskData - The updated task data
   * @returns {Task|null} The updated task or null if not found
   */
  updateTask(taskId, taskData) {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return null;

    // Update task properties
    const task = this.tasks[taskIndex];
    task.title = taskData.title;
    task.dueDate = taskData.dueDate;
    task.listId = taskData.listId;
    task.notes = taskData.notes || '';
    task.flagged = taskData.flagged || false;
    task.priority = taskData.priority || 'normal';

    this.saveTasks();
    return task;
  }

  /**
   * Get a task by ID
   * @param {string} taskId - The ID of the task to get
   * @returns {Object|null} The task or null if not found
   */
  getTaskById(taskId) {
    return this.tasks.find(task => task.id === taskId) || null;
  }

  getAllTasks() {
    return this.tasks;
  }

  /**
   * Get tasks due today
   * @returns {Array} Tasks due today
   */
  getTasksDueToday() {
    return this.tasks.filter(task => {
      if (!task.dueDate) return false;

      const taskDueDate = new Date(task.dueDate);
      return taskDueDate >= startOfToday() && taskDueDate <= endOfToday();
    });
  }

  getFlaggedTasks() {
    return this.tasks.filter(task => task.flagged);
  }

  /**
   * Get tasks for a specific list
   * @param {string} listName - The name of the list
   * @returns {Array} Tasks in the list
   */
  getTasksByList(listName) {
    const list = this.lists.find(l => l.name.toLowerCase() === listName.toLowerCase());
    if (!list) return [];

    return this.tasks.filter(task => task.listId === list.id);
  }

  /**
  * Delete a task
  * @param {string} taskId - The ID of the task to delete
  * @returns {boolean} True if the task was deleted, false otherwise
  */
  deleteTask(taskId) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.id !== taskId);

    if (this.tasks.length !== initialLength) {
      this.saveTasks();
      return true;
    }

    return false;
  }

  toggleTaskCompleteStatus(taskId) {
    const task = this.tasks.find(task => task.id === taskId);
    if (task) {
      task.toggleCompleteStatus();
    }
    // update changes
    this.saveTasks();
  }

  /**
   * Load lists from localStorage
   */
  loadLists() {
    const storedLists = localStorage.getItem('lists');

    if (storedLists) {
      this.lists = JSON.parse(storedLists);
    } else {
      this.addDefaultList();
    }
  }

  /**
  * Save lists to localStorage
  */
  saveLists() {
    localStorage.setItem('lists', JSON.stringify(this.lists));
  }

  /**
 * Add a new list
 * @param {Object} listData - The list data
 * @returns {Object} The created list
 */
  addList(listData) {
    const newList = {
      id: `list-${Date.now()}`,
      name: listData.name,
      icon: listData.icon || 'list'
    };

    this.lists.push(newList);
    console.log(this.lists);
    this.saveLists();
    return newList;
  }

  /**
   * Delete a list
   * @param {string} listId - The ID of the list to delete
   * @returns {boolean} True if the list was deleted, false otherwise
   */
  deleteList(listId) {
    // Don't allow deleting the last list
    if (this.lists.length <= 1) {
      return false;
    }

    const initialLength = this.lists.length;
    this.lists = this.lists.filter(list => list.id !== listId);

    if (this.lists.length !== initialLength) {
      // Delete all tasks associated with this list
      this.tasks = this.tasks.filter(task => task.listId !== listId);

      // Save changes
      this.saveLists();
      this.saveTasks();
      return true;
    }

    return false;
  }

  /**
   * Get a list by ID
   * @param {string} listId - The ID of the list to get
   * @returns {Object|null} The list or null if not found
   */
  getListById(listId) {
    return this.lists.find(list => list.id === listId) || null;
  }

  getAllLists() {
    this.loadLists();
    return this.lists;
  }
}

export default TaskManager;