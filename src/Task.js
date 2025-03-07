class Task {
  constructor(id, title, dueDate = null, listId, notes = '', flagged = false, priority = 'normal') {
    this.id = id;
    this.title = title;
    this.dueDate = dueDate;
    this.listId = listId;
    this.notes = notes;
    this.flagged = flagged;
    this.priority = priority;
    this.completed = false;
  }

  toggleCompleteStatus() {
    this.completed = !this.completed;
  }
}

export default Task;