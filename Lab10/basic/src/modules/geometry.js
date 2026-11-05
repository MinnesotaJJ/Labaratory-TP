// Бизнес-логика: только геометрические вычисления, без работы с DOM.
export function rectangleArea(width, height) {
  return width * height;
}
export function rectanglePerimeter(width, height) {
  return 2 * (width + height);
}
export function circleArea(radius) {
  return Math.PI * radius ** 2;
}
export function circleCircumference(radius) {
  return 2 * Math.PI * radius;
}
export function isPositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}
