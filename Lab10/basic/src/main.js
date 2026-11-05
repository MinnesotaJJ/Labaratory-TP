import { rectangleArea, rectanglePerimeter, circleArea, circleCircumference, isPositiveNumber } from "./modules/geometry.js";
import { showRectangleResult, showCircleResult, showError } from "./modules/ui.js";

const widthInput = document.querySelector("#rect-width");
const heightInput = document.querySelector("#rect-height");
const radiusInput = document.querySelector("#radius");
const rectResult = document.querySelector("#rect-result");
const circleResult = document.querySelector("#circle-result");

document.querySelector("#rect-calc").addEventListener("click", () => {
  const width = Number(widthInput.value);
  const height = Number(heightInput.value);
  if (widthInput.value.trim() === "" || heightInput.value.trim() === "" ||
      !isPositiveNumber(width) || !isPositiveNumber(height)) {
    showError(rectResult, "Введите ширину и высоту больше нуля.");
    return;
  }
  showRectangleResult(rectResult, rectangleArea(width, height), rectanglePerimeter(width, height));
});

document.querySelector("#circle-calc").addEventListener("click", () => {
  const radius = Number(radiusInput.value);
  if (radiusInput.value.trim() === "" || !isPositiveNumber(radius)) {
    showError(circleResult, "Введите радиус больше нуля.");
    return;
  }
  showCircleResult(circleResult, circleArea(radius), circleCircumference(radius));
});
