/**
 * Task class
 * Represents a single task with its properties and methods
 */
class Task {
  /**
   * Create a new Task
   * @param {string} id - Unique identifier for the task
   * @param {string} title - Title of the task
   * @param {Date|null} dueDate - Due date for the task
   * @param {string} listId - ID of the list this task belongs to
   * @param {string} notes - Additional notes for the task
   * @param {boolean} flagged - Whether the task is flagged
   * @param {string} priority - Priority level (low, normal, high)
   * @param {boolean} completed - Whether the task is completed
   */
  constructor(id, title, dueDate = null, listId, notes = '', flagged = false, priority = 'normal', completed = false) {
    this.id = id;
    this.title = title;
    this.dueDate = dueDate;
    this.listId = listId;
    this.notes = notes;
    this.flagged = flagged;
    this.priority = priority;
    this.completed = completed;
  }

  /**
   * Toggle the completion status of the task
   */
  toggleCompleteStatus() {
    this.completed = !this.completed;
  }

  /**
   * Set the flag status of the task
   * @param {boolean} flagged - Whether the task should be flagged
   */
  setFlagged(flagged) {
    this.flagged = flagged;
  }

  /**
   * Set the priority of the task
   * @param {string} priority - The priority level (low, normal, high)
   */
  setPriority(priority) {
    this.priority = priority;
  }
}

export default Task;