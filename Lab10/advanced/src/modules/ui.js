import { COLUMNS, getNextColumn, getPreviousColumn } from "./columns.js";

export function renderBoard(board, tasks, onMove, onDelete) {
  const containers = {
    todo: board.querySelector("#todo-list"),
    doing: board.querySelector("#doing-list"),
    done: board.querySelector("#done-list")
  };
  Object.values(containers).forEach(container => container.replaceChildren());

  for (const task of tasks) {
    const card = document.createElement("article");
    card.className = "kanban-card";
    const title = document.createElement("p");
    title.textContent = task.title;
    const actions = document.createElement("div");
    actions.className = "card-actions";
    const previous = getPreviousColumn(task.column);
    const next = getNextColumn(task.column);

    if (previous) {
      const back = document.createElement("button");
      back.className = "secondary";
      back.textContent = "← Назад";
      back.addEventListener("click", () => onMove(task.id, previous));
      actions.append(back);
    }
    if (next) {
      const forward = document.createElement("button");
      forward.textContent = "Далее →";
      forward.addEventListener("click", () => onMove(task.id, next));
      actions.append(forward);
    }
    const remove = document.createElement("button");
    remove.className = "danger";
    remove.textContent = "Удалить";
    remove.addEventListener("click", () => onDelete(task.id));
    actions.append(remove);
    card.append(title, actions);
    containers[task.column].append(card);
  }
  for (const column of COLUMNS) {
    const container = containers[column.id];
    if (!container.children.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Нет карточек";
      container.append(empty);
    }
  }
}
export function showKanbanMessage(element, message, isError = false) {
  element.textContent = message;
  element.className = isError ? "error" : "muted";
}
