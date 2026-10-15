const pagesData = {
    about: "Привет! Я студент направления «Технология программирования». Увлекаюсь созданием SPA без использования сторонних фреймворков и веб-разработкой.",
    skills: "Мой стек технологий: HTML5, CSS3, JavaScript (DOM API, ES6+), основы Python и реляционных баз данных MySQL.",
    contacts: "Вы можете связаться со мной по электронной почте: student@university.kz или через Telegram: @student_dev."
};

const contentContainer = document.querySelector("#content");
const buttons = document.querySelectorAll(".tab-btn");

function switchTab(pageKey) {
    contentContainer.textContent = pagesData[pageKey] || "Информация не найдена";
}

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const pageKey = btn.dataset.tab;
        switchTab(pageKey);
    });
});

// Инициализация стартовой вкладки
switchTab("about");