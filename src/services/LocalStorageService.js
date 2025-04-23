import StorageService from './StorageService.js';

/**
 * LocalStorageService - Implementation of StorageService using localStorage
 * Handles storing and retrieving data from the browser's localStorage
 */
class LocalStorageService extends StorageService {
  constructor() {
    super();
    this.storageKeys = {
      TASKS: 'tasks',
      LISTS: 'lists'
    };
  }

  /**
   * Get tasks from localStorage
   * @returns {Array|null} Array of task objects or null if none found
   */
  getTasks() {
    const storedTasks = localStorage.getItem(this.storageKeys.TASKS);
    return storedTasks ? JSON.parse(storedTasks) : null;
  }

  /**
   * Save tasks to localStorage
   * @param {Array} tasks - Array of task objects to save
   * @returns {boolean} Success status
   */
  saveTasks(tasks) {
    try {
      localStorage.setItem(this.storageKeys.TASKS, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
      return false;
    }
  }

  /**
   * Get lists from localStorage
   * @returns {Array|null} Array of list objects or null if none found
   */
  getLists() {
    const storedLists = localStorage.getItem(this.storageKeys.LISTS);
    return storedLists ? JSON.parse(storedLists) : null;
  }

  /**
   * Save lists to localStorage
   * @param {Array} lists - Array of list objects to save
   * @returns {boolean} Success status
   */
  saveLists(lists) {
    try {
      localStorage.setItem(this.storageKeys.LISTS, JSON.stringify(lists));
      return true;
    } catch (error) {
      console.error('Error saving lists to localStorage:', error);
      return false;
    }
  }

  /**
   * Clear all storage data
   * @returns {boolean} Success status
   */
  clearAll() {
    try {
      localStorage.removeItem(this.storageKeys.TASKS);
      localStorage.removeItem(this.storageKeys.LISTS);
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
}

export default LocalStorageService; 