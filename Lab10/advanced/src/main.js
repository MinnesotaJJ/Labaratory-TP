import { getTasks, loadTasks, addTask, moveTask, deleteTask } from "./modules/tasks.js";
import { renderBoard, showKanbanMessage } from "./modules/ui.js";
import { readTasks, saveTasks } from "./modules/storage.js";

const form = document.querySelector("#kanban-form");
const input = document.querySelector("#kanban-title");
const board = document.querySelector("#kanban-board");
const message = document.querySelector("#kanban-message");

loadTasks(readTasks());

function update() {
  const tasks = getTasks();
  renderBoard(board, tasks,
    (id, column) => {
      if (moveTask(id, column)) {
        persist();
        showKanbanMessage(message, "Статус карточки изменён.");
        update();
      }
    },
    id => {
      deleteTask(id);
      persist();
      showKanbanMessage(message, "Карточка удалена.");
      update();
    }
  );
}
function persist() {
  if (!saveTasks(getTasks())) {
    showKanbanMessage(message, "Не удалось сохранить данные в браузере.", true);
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  try {
    addTask(input.value);
    input.value = "";
    persist();
    showKanbanMessage(message, "Карточка создана.");
    update();
    input.focus();
  } catch (error) {
    showKanbanMessage(message, error.message, true);
  }
});
update();
