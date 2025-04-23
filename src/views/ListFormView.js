/**
 * ListFormView
 * Handles rendering and interactions for the list form modal
 */
class ListFormView {
  /**
   * Create a ListFormView
   * @param {HTMLElement} formModal - The form modal container element
   * @param {Object} elements - Object containing form elements
   */
  constructor(formModal, elements) {
    this.formModal = formModal;
    this.form = elements.form;
    this.closeBtn = elements.closeBtn;
    this.cancelBtn = elements.cancelBtn;
    this.submitBtn = elements.submitBtn;

    this.currentListId = null;
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
        this.submitHandler(formData, this.currentListId);
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
   * Show the form for adding a new list
   */
  showAddForm() {
    // Reset form and editing status
    this.currentListId = null;
    this.form.reset();

    // Update modal UI if needed
    if (this.submitBtn) {
      this.submitBtn.textContent = 'Add List';
    }

    // Show modal
    this.open();
  }

  /**
   * Show the form for editing an existing list
   * @param {TaskList} list - The list to edit
   */
  showEditForm(list) {
    if (!list) return;

    // Set current editing list
    this.currentListId = list.id;

    // Update modal UI if needed
    if (this.submitBtn) {
      this.submitBtn.textContent = 'Update List';
    }

    // Fill form with list data
    this.form.elements['name'].value = list.name;
    if (this.form.elements['icon']) {
      this.form.elements['icon'].value = list.icon;
    }

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
      name: formData.get('name'),
      icon: formData.get('icon') || 'list'
    };
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

export default ListFormView; 