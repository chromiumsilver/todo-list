import './styles.css';
import TaskManager from './TaskManager.js';
import UIManager from './UIManager.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const taskManager = new TaskManager();
  const uiManager = new UIManager(taskManager);
});
