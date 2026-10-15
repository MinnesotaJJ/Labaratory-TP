const contentContainer = document.querySelector("#content");
const buttons = document.querySelectorAll(".tab-btn");
let currentTab = "articles";

// Имитация локального JSON-файла для демонстрации fetch() с обработкой состояния загрузки и ошибок
async function fetchArticlesData() {
    contentContainer.innerHTML = `<div class="loading">Загрузка данных с сервера...</div>`;
    
    try {
        // В реальном проекте здесь может быть путь к вашему файлу: fetch('articles.json')
        // Для автономной демонстрации используем задержку и имитацию ответа
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                // Измените на false для проверки обработки ошибок fetch
                const success = true; 
                success ? resolve() : reject(new Error("Сетевая ошибка при обращении к серверу"));
            }, 700);
        });

        const mockData = [
            { id: 1, title: "Архитектура SPA", description: "Особенности клиентской маршрутизации и рендеринга без перезагрузки." },
            { id: { id: 2 }, title: "Использование Fetch API", description: "Асинхронная загрузка данных, обработка статусов и перехват ошибок." },
            { id: 3, title: "Безопасность DOM", description: "Защита пользовательского ввода через textContent и экранирование." }
        ];

        renderArticles(mockData);
    } catch (error) {
        contentContainer.innerHTML = `<div class="error">Ошибка загрузки: ${error.message}. Убедитесь, что проект запущен через локальный HTTP-сервер.</div>`;
    }
}

function renderArticles(articles) {
    contentContainer.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "articles-grid";

    articles.forEach(art => {
        const card = document.createElement("div");
        card.className = "article-card";
        card.innerHTML = `
            <h3>${escapeHtml(art.title)}</h3>
            <p>${escapeHtml(art.description)}</p>
        `;
        grid.appendChild(card);
    });
    contentContainer.appendChild(grid);
}

function renderContent() {
    if (currentTab === "articles") {
        fetchArticlesData();
    } else if (currentTab === "categories") {
        contentContainer.innerHTML = "<h3>Категории материалов</h3><p>• Архитектура и паттерны<br>• Асинхронные запросы<br>• Безопасность веб-приложений</p>";
    } else if (currentTab === "favorites") {
        contentContainer.innerHTML = "<h3>Избранные статьи</h3><p>В вашем списке пока нет сохраненных статей.</p>";
    }
}

function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentTab = btn.dataset.tab;
        renderContent();
    });
});

// Инициализация при загрузке
renderContent();