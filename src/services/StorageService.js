/**
 * StorageService - Abstract Interface
 * Defines the contract for storage implementations
 */
class StorageService {
  /**
   * Get tasks from storage
   * @returns {Array|null} Array of task objects or null if none found
   */
  getTasks() {
    throw new Error('Method getTasks() must be implemented');
  }

  /**
   * Save tasks to storage
   * @param {Array} tasks - Array of task objects to save
   * @returns {boolean} Success status
   */
  saveTasks(tasks) {
    throw new Error('Method saveTasks() must be implemented');
  }

  /**
   * Get lists from storage
   * @returns {Array|null} Array of list objects or null if none found
   */
  getLists() {
    throw new Error('Method getLists() must be implemented');
  }

  /**
   * Save lists to storage
   * @param {Array} lists - Array of list objects to save
   * @returns {boolean} Success status
   */
  saveLists(lists) {
    throw new Error('Method saveLists() must be implemented');
  }

  /**
   * Clear all storage data
   * @returns {boolean} Success status
   */
  clearAll() {
    throw new Error('Method clearAll() must be implemented');
  }
}

export default StorageService; 