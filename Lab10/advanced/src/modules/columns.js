// Конфигурация колонок и допустимые переходы.
export const COLUMNS = [
  { id: "todo", title: "К выполнению" },
  { id: "doing", title: "В процессе" },
  { id: "done", title: "Готово" }
];
export function getNextColumn(current) {
  const index = COLUMNS.findIndex(column => column.id === current);
  return index >= 0 && index < COLUMNS.length - 1 ? COLUMNS[index + 1].id : null;
}
export function getPreviousColumn(current) {
  const index = COLUMNS.findIndex(column => column.id === current);
  return index > 0 ? COLUMNS[index - 1].id : null;
}
export function isValidColumn(columnId) {
  return COLUMNS.some(column => column.id === columnId);
}
