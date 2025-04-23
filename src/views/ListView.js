/**
 * ListView
 * Handles UI rendering and interactions for task lists
 */
class ListView {
  /**
   * Create a ListView
   * @param {HTMLElement} container - The container element for lists
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.listClickHandlers = {
      select: null,
      delete: null
    };
  }

  /**
   * Register event handlers for list actions
   * @param {string} action - The action to handle (select, delete)
   * @param {Function} handler - The handler function
   */
  on(action, handler) {
    if (this.listClickHandlers.hasOwnProperty(action)) {
      this.listClickHandlers[action] = handler;
    }
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Use event delegation for list actions
    this.container.addEventListener('click', (e) => {
      // Handle list button clicks
      const listBtn = e.target.closest('.list-btn');
      if (listBtn && this.listClickHandlers.select) {
        const listId = listBtn.dataset.id;
        const listName = listBtn.querySelector('.list-name').textContent;

        // Don't trigger if clicking on delete button
        if (!e.target.closest('.list-delete')) {
          this.listClickHandlers.select(listId, listName, listBtn);
        }
      }

      // Handle list delete button clicks
      const deleteListBtn = e.target.closest('.list-delete');
      if (deleteListBtn && this.listClickHandlers.delete) {
        const listItem = deleteListBtn.closest('.list-btn');
        const listId = listItem.dataset.id;

        this.listClickHandlers.delete(listId, listItem);
      }
    });
  }

  /**
   * Render a list of lists
   * @param {Array<TaskList>} lists - The lists to render
   */
  renderLists(lists) {
    // Clear existing list buttons
    const listBtns = this.container.querySelectorAll('.list-btn');
    listBtns.forEach(btn => btn.remove());

    // Make sure we have a header
    if (!this.container.querySelector('.list-header')) {
      const header = document.createElement('h2');
      header.className = 'list-header';
      header.textContent = 'My Lists';
      this.container.appendChild(header);
    }

    // Add lists
    lists.forEach(list => {
      const listBtn = this.createListElement(list);
      this.container.appendChild(listBtn);
    });
  }

  /**
   * Create a list element
   * @param {TaskList} list - The list data
   * @returns {HTMLElement} The list element
   */
  createListElement(list) {
    const listBtn = document.createElement('button');
    listBtn.className = 'list-btn';
    listBtn.dataset.id = list.id;

    listBtn.innerHTML = `
      <span class="list-icon material-icons">${list.icon}</span>
      <span class="list-name">${list.name}</span>
      <button class="list-delete">
        <span class="material-icons">delete</span>
      </button>
    `;

    return listBtn;
  }

  /**
   * Update the active button
   * @param {HTMLElement} activeBtn - The button to set as active
   * @param {NodeList|Array} allBtns - All buttons that could be active
   */
  updateActiveButton(activeBtn, allBtns) {
    // Remove active class from all buttons
    allBtns.forEach(btn => {
      btn.classList.remove('active');
    });

    // Add active class to the clicked button
    activeBtn.classList.add('active');
  }

  /**
   * Populate a select dropdown with list options
   * @param {HTMLSelectElement} selectElement - The select element to populate
   * @param {Array<TaskList>} lists - The lists to use as options
   * @param {string} selectedListId - The ID of the list to select
   */
  populateListDropdown(selectElement, lists, selectedListId = null) {
    // Clear existing options
    selectElement.innerHTML = '';

    // Add options for each list
    lists.forEach(list => {
      const option = document.createElement('option');
      option.value = list.id;
      option.textContent = list.name;

      if (selectedListId && list.id === selectedListId) {
        option.selected = true;
      }

      selectElement.appendChild(option);
    });
  }
}

export default ListView; 