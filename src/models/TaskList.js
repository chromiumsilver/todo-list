/**
 * TaskList class
 * Represents a single task list with its properties and methods
 */
class TaskList {
  /**
   * Create a new TaskList
   * @param {string} id - Unique identifier for the list
   * @param {string} name - Name of the list
   * @param {string} icon - Icon identifier for the list
   */
  constructor(id, name, icon = 'list') {
    this.id = id;
    this.name = name;
    this.icon = icon;
  }

  /**
   * Create a TaskList instance from a plain object
   * @param {Object} listData - Plain object containing list data
   * @returns {TaskList} New TaskList instance
   */
  static fromObject(listData) {
    return new TaskList(
      listData.id,
      listData.name,
      listData.icon || 'list'
    );
  }

  /**
   * Set the name of the list
   * @param {string} name - New name for the list
   */
  setName(name) {
    this.name = name;
  }

  /**
   * Set the icon of the list
   * @param {string} icon - New icon for the list
   */
  setIcon(icon) {
    this.icon = icon;
  }

  /**
   * Convert the TaskList to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon
    };
  }
}

export default TaskList; 