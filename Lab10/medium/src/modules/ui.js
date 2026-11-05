// Рендеринг списка и сообщений.
export function renderTasks(listElement, emptyElement, countElement, tasks, onToggle, onDelete) {
  listElement.replaceChildren();
  emptyElement.hidden = tasks.length > 0;
  countElement.textContent = `Всего: ${tasks.length} · Выполнено: ${tasks.filter(t => t.completed).length}`;
  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "task-item";
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => onToggle(task.id));
    const span = document.createElement("span");
    span.textContent = task.title;
    if (task.completed) span.className = "done";
    label.append(checkbox, span);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger";
    remove.textContent = "Удалить";
    remove.addEventListener("click", () => onDelete(task.id));
    li.append(label, remove);
    listElement.append(li);
  }
}
export function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.className = isError ? "error" : "muted";
}
