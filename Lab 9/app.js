// Селекторы DOM-элементов
const loadBtn = document.querySelector('#load-btn');
const statusFilter = document.querySelector('#status-filter');
const userFilter = document.querySelector('#user-filter');
const statusText = document.querySelector('#status');
const perfMetric = document.querySelector('#perf-metric');
const respTimeSpan = document.querySelector('#resp-time');
const statsPanel = document.querySelector('#stats-panel');
const todoList = document.querySelector('#todo-list');

const statTotal = document.querySelector('#stat-total');
const statCompleted = document.querySelector('#stat-completed');
const statPending = document.querySelector('#stat-pending');

// Хранилище состояния приложения (State)
let allTodos = [];

// Основной обработчик кнопки загрузки
loadBtn.addEventListener('click', async () => {
    // Состояние "Загрузка"
    setLoadingState(true);
    
    const startTime = performance.now(); // Творческое доп. задание (замер времени)

    try {
        // Запрос к публичному REST API (Ограничимся 30 задачами для наглядности дашборда)
        const response = await fetch('https://typicode.com');
        
        // Проверка корректности ответа сервера
        if (!response.ok) {
            throw new Error(`HTTP ошибка! Статус: ${response.status}`);
        }

        allTodos = await response.json();
        
        // Расчет времени ответа (Творческое задание)
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        respTimeSpan.textContent = duration;
        perfMetric.classList.remove('hidden');

        // Инициализация фильтров и рендеринг данных
        populateUserFilter(allTodos);
        statusFilter.disabled = false;
        userFilter.disabled = false;
        statsPanel.classList.remove('hidden');

        statusText.textContent = `Успешно загружено задач: ${allTodos.length}`;
        
        // Отобразить актуальный список и обновить дашборд
        applyFiltersAndRender();

    } catch (error) {
        // Состояние "Ошибка"
        statusText.textContent = `Ошибка загрузки: ${error.message}. Попробуйте еще раз.`;
        resetInterface();
    } finally {
        setLoadingState(false);
    }
});

// Слушатели событий изменения фильтров (Средний + Повышенный уровни)
statusFilter.addEventListener('change', applyFiltersAndRender);
userFilter.addEventListener('change', applyFiltersAndRender);

// Функция управления состоянием интерфейса при загрузке
function setLoadingState(isLoading) {
    if (isLoading) {
        loadBtn.disabled = true;
        loadBtn.textContent = 'Загрузка...';
        statusText.textContent = 'Связь с сервером... Пожалуйста, подождите.';
        todoList.replaceChildren(); // Безопасная очистка списка
    } else {
        loadBtn.disabled = false;
        loadBtn.textContent = 'Обновить данные';
    }
}

// Функция сброса UI при критической ошибке
function resetInterface() {
    statusFilter.disabled = true;
    userFilter.disabled = true;
    statusFilter.value = 'all';
    userFilter.value = 'all';
    statsPanel.classList.add('hidden');
    perfMetric.classList.add('hidden');
    todoList.replaceChildren();
}

// Заполнение выпадающего списка уникальными ID пользователей
function populateUserFilter(todos) {
    // Сохраняем текущий выбранный элемент, чтобы не сбрасывать при обновлении данных
    const currentValue = userFilter.value;
    
    // Очищаем, оставляя только дефолтный пункт
    userFilter.replaceChildren();
    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = 'Все пользователи';
    userFilter.append(defaultOption);

    // Извлекаем уникальные ID пользователей
    const userIds = [...new Set(todos.map(todo => todo.userId))].sort((a, b) => a - b);
    
    userIds.forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `Пользователь №${id}`;
        userFilter.append(option);
    });

    if ([...userFilter.options].some(opt => opt.value === currentValue)) {
        userFilter.value = currentValue;
    }
}

// Комплексная фильтрация на клиенте и пересчет дашборда статистики
function applyFiltersAndRender() {
    const selectedStatus = statusFilter.value;
    const selectedUser = userFilter.value;

    // Сначала фильтруем массив данных
    const filteredTodos = allTodos.filter(todo => {
        const matchStatus = 
            selectedStatus === 'all' || 
            (selectedStatus === 'completed' && todo.completed) || 
            (selectedStatus === 'uncompleted' && !todo.completed);

        const matchUser = 
            selectedUser === 'all' || 
            todo.userId === parseInt(selectedUser, 10);

        return matchStatus && matchUser;
    });

    // Пересчитываем статистику ИМЕННО по отфильтрованным данным (Повышенный уровень)
    updateDashboardStats(filteredTodos);

    // Отрисовываем отфильтрованный результат в DOM
    renderTodos(filteredTodos);
}

// Обновление карточек метрик на дашборде
function updateDashboardStats(todos) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;

    statTotal.textContent = total;
    statCompleted.textContent = completed;
    statPending.textContent = pending;
}

// Безопасное динамическое построение DOM элементов (Требование п.5)
function renderTodos(todos) {
    todoList.replaceChildren(); // Очистка

    if (todos.length === 0) {
        const noDataMsg = document.createElement('p');
        noDataMsg.textContent = 'Задачи, соответствующие выбранным фильтрам, не найдены.';
        noDataMsg.style.gridColumn = '1 / -1';
        noDataMsg.style.textAlign = 'center';
        noDataMsg.style.color = '#7f8c8d';
        todoList.append(noDataMsg);
        return;
    }

    todos.forEach(todo => {
        // Создаем контейнер-карточку
        const li = document.createElement('li');
        li.classList.add('todo-item');
        
        // Визуальное выделение статуса (Базовый уровень)
        if (todo.completed) {
            li.classList.add('is-completed');
        } else {
            li.classList.add('is-pending');
        }

        // Создаем заголовок (Безопасный вывод через textContent)
        const titleSpan = document.createElement('span');
        titleSpan.classList.add('todo-title');
        titleSpan.textContent = `[ID: ${todo.id}] ${todo.title}`;

        // Создаем бейдж статуса
        const badge = document.createElement('span');
        badge.classList.add('todo-badge');
        badge.textContent = todo.completed ? 'Выполнено' : 'В процессе';

        // Создаем подпись пользователя
        const userDiv = document.createElement('div');
        userDiv.classList.add('todo-user');
        userDiv.textContent = `User ID: ${todo.userId}`;

        // Собираем карточку воедино
        li.append(titleSpan, badge, userDiv);
        
        // Добавляем в общий список
        todoList.append(li);
    });
}