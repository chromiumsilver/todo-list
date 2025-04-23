import { startOfToday, endOfToday } from 'date-fns';
import Task from '../models/Task.js';
import TaskList from '../models/TaskList.js';

/**
 * DataStore
 * Serves as a repository for task and list data, handling data access and persistence
 */
class DataStore {
  /**
   * Create a DataStore
   * @param {StorageService} storageService - The storage service to use
   */
  constructor(storageService) {
    this.storageService = storageService;
    this.tasks = [];
    this.lists = [];

    // Load data from storage
    this.loadData();
  }

  /**
   * Load all data from storage
   */
  loadData() {
    this.loadTasks();
    this.loadLists();
  }

  // -------------------- Task Operations --------------------

  /**
   * Load tasks from storage
   */
  loadTasks() {
    const taskObjects = this.storageService.getTasks();

    if (taskObjects) {
      // Convert plain objects to Task instances
      this.tasks = taskObjects.map(taskObj => Task.fromObject(taskObj));
    }
  }

  /**
   * Save tasks to storage
   */
  saveTasks() {
    // Convert Task instances to plain objects for storage
    const taskObjects = this.tasks.map(task => task.toObject());
    this.storageService.saveTasks(taskObjects);
  }

  /**
   * Add a task to the store
   * @param {Task} task - The task to add
   */
  addTask(task) {
    this.tasks.push(task);
    this.saveTasks();
  }

  /**
   * Save changes to a task
   * @param {Task} task - The task to save
   */
  saveTask(task) {
    // The task is already in the array, just save changes
    this.saveTasks();
  }

  /**
   * Remove a task from the store
   * @param {string} taskId - The ID of the task to remove
   * @returns {boolean} True if removed successfully
   */
  removeTask(taskId) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.id !== taskId);

    if (this.tasks.length !== initialLength) {
      this.saveTasks();
      return true;
    }

    return false;
  }

  /**
   * Remove all tasks with the specified list ID
   * @param {string} listId - The list ID
   * @returns {number} Number of tasks removed
   */
  removeTasksByListId(listId) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.listId !== listId);

    if (this.tasks.length !== initialLength) {
      this.saveTasks();
      return initialLength - this.tasks.length;
    }

    return 0;
  }

  /**
   * Get a task by ID
   * @param {string} taskId - The ID of the task to get
   * @returns {Task|null} The task or null if not found
   */
  getTaskById(taskId) {
    return this.tasks.find(task => task.id === taskId) || null;
  }

  /**
   * Get all tasks
   * @returns {Array<Task>} All tasks
   */
  getAllTasks() {
    return this.tasks;
  }

  /**
   * Get tasks due today
   * @returns {Array<Task>} Tasks due today
   */
  getTasksDueToday() {
    return this.tasks.filter(task => {
      if (!task.dueDate) return false;

      const taskDueDate = new Date(task.dueDate);
      return taskDueDate >= startOfToday() && taskDueDate <= endOfToday();
    });
  }

  /**
   * Get flagged tasks
   * @returns {Array<Task>} Flagged tasks
   */
  getFlaggedTasks() {
    return this.tasks.filter(task => task.flagged);
  }

  /**
   * Get tasks for a specific list ID
   * @param {string} listId - The ID of the list
   * @returns {Array<Task>} Tasks in the list
   */
  getTasksByListId(listId) {
    return this.tasks.filter(task => task.listId === listId);
  }

  // -------------------- List Operations --------------------

  /**
   * Load lists from storage
   */
  loadLists() {
    const listObjects = this.storageService.getLists();

    if (listObjects) {
      // Convert plain objects to TaskList instances
      this.lists = listObjects.map(listObj => TaskList.fromObject(listObj));
    }
  }

  /**
   * Save lists to storage
   */
  saveLists() {
    // Convert TaskList instances to plain objects for storage
    const listObjects = this.lists.map(list => list.toObject());
    this.storageService.saveLists(listObjects);
  }

  /**
   * Add a list to the store
   * @param {TaskList} list - The list to add
   */
  addList(list) {
    this.lists.push(list);
    this.saveLists();
  }

  /**
   * Save changes to a list
   * @param {TaskList} list - The list to save
   */
  saveList(list) {
    // The list is already in the array, just save changes
    this.saveLists();
  }

  /**
   * Remove a list from the store
   * @param {string} listId - The ID of the list to remove
   * @returns {boolean} True if removed successfully
   */
  removeList(listId) {
    const initialLength = this.lists.length;
    this.lists = this.lists.filter(list => list.id !== listId);

    if (this.lists.length !== initialLength) {
      this.saveLists();
      return true;
    }

    return false;
  }

  /**
   * Get a list by ID
   * @param {string} listId - The ID of the list to get
   * @returns {TaskList|null} The list or null if not found
   */
  getListById(listId) {
    return this.lists.find(list => list.id === listId) || null;
  }

  /**
   * Get a list by name (case-insensitive)
   * @param {string} listName - The name of the list to get
   * @returns {TaskList|null} The list or null if not found
   */
  getListByName(listName) {
    return this.lists.find(list =>
      list.name.toLowerCase() === listName.toLowerCase()
    ) || null;
  }

  /**
   * Get all lists
   * @returns {Array<TaskList>} All lists
   */
  getAllLists() {
    return this.lists;
  }

  /**
   * Get the count of lists
   * @returns {number} The number of lists
   */
  getListCount() {
    return this.lists.length;
  }

  /**
   * Add sample tasks and default list for initialization
   */
  addSampleData() {
    // Add default list
    const defaultList = new TaskList(
      'list-default',
      'Family',
      'home'
    );
    this.addList(defaultList);

    // Add sample tasks
    const sampleTasks = [
      new Task(
        'task-1',
        'Buy groceries',
        new Date(Date.now() + 86400000), // tomorrow
        defaultList.id
      ),
      new Task(
        'task-2',
        'Call mom',
        new Date(),
        defaultList.id
      )
    ];

    sampleTasks.forEach(task => this.addTask(task));
  }

  /**
   * Initialize with sample data if needed
   */
  initializeWithSampleDataIfNeeded() {
    if (this.lists.length === 0) {
      this.addSampleData();
    }
  }
}

export default DataStore; 