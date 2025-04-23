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
   * Create a Task instance from a plain object
   * @param {Object} taskData - Plain object containing task data
   * @returns {Task} New Task instance
   */
  static fromObject(taskData) {
    return new Task(
      taskData.id,
      taskData.title,
      taskData.dueDate ? new Date(taskData.dueDate) : null,
      taskData.listId,
      taskData.notes || '',
      taskData.flagged || false,
      taskData.priority || 'normal',
      taskData.completed || false
    );
  }

  /**
   * Toggle the completion status of the task
   * @returns {Task} The task instance for chaining
   */
  toggleCompleteStatus() {
    this.completed = !this.completed;
    return this;
  }

  /**
   * Set the flag status of the task
   * @param {boolean} flagged - Whether the task should be flagged
   * @returns {Task} The task instance for chaining
   */
  setFlagged(flagged) {
    this.flagged = flagged;
    return this;
  }

  /**
   * Set the priority of the task
   * @param {string} priority - The priority level (low, normal, high)
   * @returns {Task} The task instance for chaining
   */
  setPriority(priority) {
    this.priority = priority;
    return this;
  }

  /**
   * Set the title of the task
   * @param {string} title - The new title
   * @returns {Task} The task instance for chaining
   */
  setTitle(title) {
    this.title = title;
    return this;
  }

  /**
   * Set the due date of the task
   * @param {Date|null} dueDate - The new due date
   * @returns {Task} The task instance for chaining
   */
  setDueDate(dueDate) {
    this.dueDate = dueDate;
    return this;
  }

  /**
   * Set the list ID of the task
   * @param {string} listId - The new list ID
   * @returns {Task} The task instance for chaining
   */
  setListId(listId) {
    this.listId = listId;
    return this;
  }

  /**
   * Set the notes of the task
   * @param {string} notes - The new notes
   * @returns {Task} The task instance for chaining
   */
  setNotes(notes) {
    this.notes = notes;
    return this;
  }

  /**
   * Convert the Task to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      title: this.title,
      dueDate: this.dueDate,
      listId: this.listId,
      notes: this.notes,
      flagged: this.flagged,
      priority: this.priority,
      completed: this.completed
    };
  }
}

export default Task; 