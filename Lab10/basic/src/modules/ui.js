// Функции отображения результата.
export function showRectangleResult(element, area, perimeter) {
  element.classList.remove("error");
  element.textContent = `Площадь: ${area.toFixed(2)}. Периметр: ${perimeter.toFixed(2)}.`;
}
export function showCircleResult(element, area, circumference) {
  element.classList.remove("error");
  element.textContent = `Площадь: ${area.toFixed(2)}. Длина окружности: ${circumference.toFixed(2)}.`;
}
export function showError(element, message) {
  element.classList.add("error");
  element.textContent = message;
}
