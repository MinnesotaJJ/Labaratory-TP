import { getTasks, addTask, removeTask, toggleTask } from "./modules/tasks.js";
import { renderTasks, showMessage } from "./modules/ui.js";

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const empty = document.querySelector("#empty-message");
const count = document.querySelector("#task-count");
const message = document.querySelector("#task-message");

function update() {
  renderTasks(list, empty, count, getTasks(),
    id => { toggleTask(id); update(); },
    id => { removeTask(id); showMessage(message, "Задача удалена."); update(); });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  try {
    addTask(input.value);
    input.value = "";
    showMessage(message, "Задача добавлена.");
    update();
    input.focus();
  } catch (error) {
    showMessage(message, error.message, true);
  }
});
update();
