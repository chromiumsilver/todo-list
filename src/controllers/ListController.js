import TaskList from '../models/TaskList.js';

/**
 * ListController
 * Responsible for list-related business logic and operations
 */
class ListController {
  /**
   * Create a ListController
   * @param {Object} listStore - The list data store/repository
   */
  constructor(listStore) {
    this.listStore = listStore;
  }

  /**
   * Create a new list
   * @param {Object} listData - The list data
   * @returns {TaskList} The created list
   */
  createList(listData) {
    const newList = new TaskList(
      `list-${Date.now()}`,
      listData.name,
      listData.icon || 'list'
    );

    // Add to store and persist
    this.listStore.addList(newList);

    return newList;
  }

  /**
   * Update an existing list
   * @param {string} listId - The ID of the list to update
   * @param {Object} listData - The updated list data
   * @returns {TaskList|null} The updated list or null if not found
   */
  updateList(listId, listData) {
    const list = this.getListById(listId);
    if (!list) return null;

    // Update list properties
    list.setName(listData.name);
    if (listData.icon) {
      list.setIcon(listData.icon);
    }

    // Persist changes
    this.listStore.saveList(list);

    return list;
  }

  /**
   * Delete a list
   * @param {string} listId - The ID of the list to delete
   * @param {Function} onDeleteTasks - Callback to delete associated tasks
   * @returns {boolean} True if deleted successfully
   */
  deleteList(listId, onDeleteTasks) {
    // Don't allow deleting the last list
    if (this.listStore.getListCount() <= 1) {
      return false;
    }

    // Delete the list
    const success = this.listStore.removeList(listId);

    if (success && onDeleteTasks) {
      // Delete associated tasks
      onDeleteTasks(listId);
    }

    return success;
  }

  /**
   * Get a list by ID
   * @param {string} listId - The ID of the list to get
   * @returns {TaskList|null} The list or null if not found
   */
  getListById(listId) {
    return this.listStore.getListById(listId);
  }

  /**
   * Get a list by name
   * @param {string} listName - The name of the list to get
   * @returns {TaskList|null} The list or null if not found
   */
  getListByName(listName) {
    return this.listStore.getListByName(listName);
  }

  /**
   * Get all lists
   * @returns {Array<TaskList>} All lists
   */
  getAllLists() {
    return this.listStore.getAllLists();
  }

  /**
   * Create the default list if no lists exist
   * @returns {TaskList} The default list
   */
  createDefaultList() {
    // Check if we already have lists
    if (this.listStore.getListCount() > 0) {
      return this.getAllLists()[0];
    }

    // Create default list
    const defaultList = new TaskList(
      'list-default',
      'Family',
      'home'
    );

    this.listStore.addList(defaultList);
    return defaultList;
  }

  /**
   * Get the default list ID (first list or create one)
   * @returns {string} The default list ID
   */
  getDefaultListId() {
    const lists = this.getAllLists();
    if (lists.length > 0) {
      return lists[0].id;
    }

    // Create a default list if none exists
    return this.createDefaultList().id;
  }
}

export default ListController; 