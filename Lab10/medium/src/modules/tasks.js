// Модель задач: операции над данными не зависят от DOM.
let nextId = 1;
let tasks = [];

export function getTasks() {
  return tasks.map(task => ({ ...task }));
}
export function addTask(title) {
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error("Текст задачи не может быть пустым.");
  if (cleanTitle.length > 100) throw new Error("Максимальная длина задачи — 100 символов.");
  const task = { id: nextId++, title: cleanTitle, completed: false };
  tasks.push(task);
  return { ...task };
}
export function removeTask(id) {
  const previousLength = tasks.length;
  tasks = tasks.filter(task => task.id !== id);
  return tasks.length !== previousLength;
}
export function toggleTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return false;
  task.completed = !task.completed;
  return true;
}
