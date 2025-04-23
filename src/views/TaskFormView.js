import { format } from 'date-fns';

/**
 * TaskFormView
 * Handles rendering and interactions for the task form modal
 */
class TaskFormView {
  /**
   * Create a TaskFormView
   * @param {HTMLElement} formModal - The form modal container element
   * @param {Object} elements - Object containing form elements
   */
  constructor(formModal, elements) {
    this.formModal = formModal;
    this.form = elements.form;
    this.closeBtn = elements.closeBtn;
    this.cancelBtn = elements.cancelBtn;
    this.submitBtn = elements.submitBtn;
    this.modalTitle = elements.modalTitle;
    this.listSelect = elements.listSelect;

    this.currentTaskId = null;
    this.submitHandler = null;
    this.closeHandler = null;

    this.initEventListeners();
  }

  /**
   * Set up event listeners
   */
  initEventListeners() {
    // Close modal when clicking the close button
    this.closeBtn.addEventListener('click', () => this.close());

    // Close modal when clicking the cancel button
    this.cancelBtn.addEventListener('click', () => this.close());

    // Close modal when clicking outside the modal
    this.formModal.addEventListener('click', (e) => {
      if (e.target === this.formModal) {
        this.close();
      }
    });

    // Handle form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (this.submitHandler) {
        const formData = this.getFormData();
        this.submitHandler(formData, this.currentTaskId);
      }

      this.close();
    });
  }

  /**
   * Set the form submission handler
   * @param {Function} handler - The submission handler function
   */
  onSubmit(handler) {
    this.submitHandler = handler;
  }

  /**
   * Set the form close handler
   * @param {Function} handler - The close handler function
   */
  onClose(handler) {
    this.closeHandler = handler;
  }

  /**
   * Show the form for adding a new task
   * @param {Array} lists - Available lists for the dropdown
   */
  showAddForm(lists) {
    // Reset form and editing status
    this.currentTaskId = null;
    this.form.reset();

    // Update modal UI for add mode
    this.modalTitle.textContent = 'Add New Task';
    this.submitBtn.textContent = 'Add Task';

    // Set default due date to today
    const today = format(new Date(), 'yyyy-MM-dd');
    this.form.elements['dueDate'].value = today;

    // Populate the lists dropdown
    this.populateListsDropdown(lists);

    // Show modal
    this.open();
  }

  /**
   * Show the form for editing an existing task
   * @param {Task} task - The task to edit
   * @param {Array} lists - Available lists for the dropdown
   */
  showEditForm(task, lists) {
    if (!task) return;

    // Set current editing task
    this.currentTaskId = task.id;

    // Update modal UI for edit mode
    this.modalTitle.textContent = 'Edit Task';
    this.submitBtn.textContent = 'Update Task';

    // Fill form with task data
    this.form.elements['title'].value = task.title;
    this.form.elements['notes'].value = task.notes || '';

    // Format date for input if it exists
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      this.form.elements['dueDate'].value = format(dueDate, 'yyyy-MM-dd');
    } else {
      this.form.elements['dueDate'].value = '';
    }

    // Populate the lists dropdown and select the current list
    this.populateListsDropdown(lists, task.listId);

    this.form.elements['flagged'].checked = task.flagged;
    this.form.elements['priority'].value = task.priority;

    // Show modal
    this.open();
  }

  /**
   * Get the form data as an object
   * @returns {Object} The form data
   */
  getFormData() {
    const formData = new FormData(this.form);

    return {
      title: formData.get('title'),
      notes: formData.get('notes'),
      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate')) : null,
      listId: formData.get('listId'),
      flagged: formData.get('flagged') === 'on',
      priority: formData.get('priority')
    };
  }

  /**
   * Populate the lists dropdown
   * @param {Array} lists - The lists to display in the dropdown
   * @param {string} selectedListId - The ID of the list to select
   */
  populateListsDropdown(lists, selectedListId = null) {
    // Clear existing options
    this.listSelect.innerHTML = '';

    // Add options for each list
    lists.forEach(list => {
      const option = document.createElement('option');
      option.value = list.id;
      option.textContent = list.name;

      if (selectedListId && list.id === selectedListId) {
        option.selected = true;
      }

      this.listSelect.appendChild(option);
    });
  }

  /**
   * Open the form modal
   */
  open() {
    this.formModal.classList.add('active');
  }

  /**
   * Close the form modal
   */
  close() {
    this.formModal.classList.remove('active');

    if (this.closeHandler) {
      this.closeHandler();
    }
  }
}

export default TaskFormView; 