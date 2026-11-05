// Бизнес-логика карточек.
import { isValidColumn } from "./columns.js";
let tasks = [];
let nextId = 1;

export function getTasks() {
  return tasks.map(task => ({ ...task }));
}
export function loadTasks(savedTasks) {
  tasks = Array.isArray(savedTasks) ? savedTasks.filter(task =>
    task && Number.isInteger(task.id) && typeof task.title === "string" &&
    isValidColumn(task.column)
  ).map(task => ({ id: task.id, title: task.title, column: task.column })) : [];
  nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
}
export function addTask(title) {
  const clean = title.trim();
  if (!clean) throw new Error("Введите название задачи.");
  if (clean.length > 100) throw new Error("Максимальная длина — 100 символов.");
  const task = { id: nextId++, title: clean, column: "todo" };
  tasks.push(task);
  return { ...task };
}
export function moveTask(id, column) {
  if (!isValidColumn(column)) return false;
  const task = tasks.find(item => item.id === id);
  if (!task) return false;
  task.column = column;
  return true;
}
export function deleteTask(id) {
  const before = tasks.length;
  tasks = tasks.filter(task => task.id !== id);
  return tasks.length < before;
}
