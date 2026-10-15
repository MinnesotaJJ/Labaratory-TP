let currentFilter = "all";
let tasks = [
    { id: 1, text: "Изучить принципы работы SPA без фреймворков", completed: true },
    { id: 2, text: "Реализовать динамическое управление DOM", completed: false },
    { id: 3, text: "Подготовить отчет по лабораторной работе", completed: false }
];

const contentContainer = document.querySelector("#content");
const buttons = document.querySelectorAll(".tab-btn");

function renderTasks() {
    contentContainer.innerHTML = "";

    // Блок добавления задачи
    const inputBox = document.createElement("div");
    inputBox.className = "todo-input-box";
    inputBox.innerHTML = `
        <input type="text" id="taskInput" placeholder="Введите новую задачу...">
        <button class="action-btn" id="addBtn">Добавить</button>
    `;
    contentContainer.appendChild(inputBox);

    // Список задач
    const ul = document.createElement("ul");
    ul.className = "task-list";

    let filtered = tasks;
    if (currentFilter === "active") filtered = tasks.filter(t => !t.completed);
    if (currentFilter === "completed") filtered = tasks.filter(t => t.completed);

    if (filtered.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.style.color = "#888";
        emptyMsg.style.marginTop = "15px";
        emptyMsg.textContent = "Список задач пуст.";
        contentContainer.appendChild(emptyMsg);
        return;
    }

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? "checked" : ""} data-id="${task.id}" class="task-check">
            <span style="${task.completed ? 'text-decoration: line-through; color: #888;' : ''}">${escapeHtml(task.text)}</span>
        `;
        ul.appendChild(li);
    });

    contentContainer.appendChild(ul);

    // Привязка обработчиков событий
    contentContainer.querySelector("#addBtn").addEventListener("click", addTask);
    contentContainer.querySelector("#taskInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTask();
    });

    contentContainer.querySelectorAll(".task-check").forEach(chk => {
        chk.addEventListener("change", (e) => {
            const id = Number(e.target.dataset.id);
            const targetTask = tasks.find(t => t.id === id);
            if (targetTask) {
                targetTask.completed = e.target.checked;
                renderTasks();
            }
        });
    });
}

function addTask() {
    const input = contentContainer.querySelector("#taskInput");
    const val = input.value.trim();
    if (val) {
        tasks.push({ id: Date.now(), text: val, completed: false });
        renderTasks();
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
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

renderTasks();