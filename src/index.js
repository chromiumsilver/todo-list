import './styles.css';
import LocalStorageService from './services/LocalStorageService.js';
import DataStore from './stores/DataStore.js';
import TaskController from './controllers/TaskController.js';
import ListController from './controllers/ListController.js';
import AppController from './controllers/AppController.js';
import TaskView from './views/TaskView.js';
import ListView from './views/ListView.js';
import TaskFormView from './views/TaskFormView.js';
import ListFormView from './views/ListFormView.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize the storage service
  const storageService = new LocalStorageService();

  // 2. Initialize the data store
  const dataStore = new DataStore(storageService);
  dataStore.initializeWithSampleDataIfNeeded();

  // 3. Initialize controllers
  const listController = new ListController(dataStore);
  const taskController = new TaskController(dataStore, listController);

  // 4. Initialize views
  const taskView = new TaskView(document.querySelector('.tasks'));
  const listView = new ListView(document.querySelector('.lists'));

  // 5. Initialize form views
  const taskFormView = new TaskFormView(
    document.querySelector('#taskFormModal'),
    {
      form: document.querySelector('#taskForm'),
      closeBtn: document.querySelector('#closeTaskModal'),
      cancelBtn: document.querySelector('#cancelTaskBtn'),
      submitBtn: document.querySelector('.btn-submit'),
      modalTitle: document.querySelector('.modal-header h3'),
      listSelect: document.querySelector('#taskList')
    }
  );

  const listFormView = new ListFormView(
    document.querySelector('#listFormModal'),
    {
      form: document.querySelector('#listForm'),
      closeBtn: document.querySelector('#closeListModal'),
      cancelBtn: document.querySelector('#cancelListBtn'),
      submitBtn: document.querySelector('#listForm .btn-submit')
    }
  );

  // 6. Initialize the app controller with all components
  const appController = new AppController({
    taskController,
    listController,
    taskView,
    listView,
    taskFormView,
    listFormView,
    taskListTitle: document.querySelector('.task-list-title'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    todayButton: document.querySelector('#filter-today'),
    addTaskBtn: document.querySelector('.add-task-btn'),
    addListBtn: document.querySelector('.add-list-btn')
  });

  // 7. Make accessible globally for debugging (can be removed in production)
  window.app = {
    controllers: {
      app: appController,
      task: taskController,
      list: listController
    },
    views: {
      task: taskView,
      list: listView,
      taskForm: taskFormView,
      listForm: listFormView
    },
    dataStore,
    storageService
  };
});
