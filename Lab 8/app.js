/**
 * Вспомогательная функция безопасного чтения JSON из хранилища
 */
function safeJSONParse(key, storageType = localStorage, fallback = null) {
  try {
    const raw = storageType.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Ошибка чтения ключа "${key}" из ${storageType === localStorage ? 'localStorage' : 'sessionStorage'}:`, e);
    return fallback;
  }
}

// ==========================================
// 1. БАЗОВЫЙ УРОВЕНЬ: Настройки темы
// ==========================================
const STORAGE_KEY_SETTINGS = 'lab8_settings';

const themeSelect = document.querySelector('#theme-select');
const fontSizeSelect = document.querySelector('#fontsize-select');

function initSettings() {
  const savedSettings = safeJSONParse(STORAGE_KEY_SETTINGS, localStorage, {
    theme: 'light',
    fontSize: 'medium'
  });

  themeSelect.value = savedSettings.theme;
  fontSizeSelect.value = savedSettings.fontSize;
  applySettings(savedSettings.theme, savedSettings.fontSize);
}

function applySettings(theme, fontSize) {
  document.body.setAttribute('data-theme', theme);
  document.body.setAttribute('data-fontsize', fontSize);
}

function saveSettings() {
  const settings = {
    theme: themeSelect.value,
    fontSize: fontSizeSelect.value
  };
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  applySettings(settings.theme, settings.fontSize);
}

themeSelect.addEventListener('change', saveSettings);
fontSizeSelect.addEventListener('change', saveSettings);


// ==========================================
// 2. СРЕДНИЙ УРОВЕНЬ: To-Do Список
// ==========================================
const STORAGE_KEY_TODOS = 'lab8_todos';

let todos = safeJSONParse(STORAGE_KEY_TODOS, localStorage, []);
if (!Array.isArray(todos)) todos = [];

let currentFilter = 'all';

const todoInput = document.querySelector('#todo-input');
const todoAddBtn = document.querySelector('#todo-add-btn');
const todoList = document.querySelector('#todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');

function saveAndRenderTodos() {
  localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
  renderTodos();
}

function renderTodos() {
  todoList.replaceChildren();

  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  if (filteredTodos.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.textContent = 'Список задач пуст';
    emptyLi.style.color = '#888';
    todoList.appendChild(emptyLi);
    return;
  }

  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    if (todo.completed) li.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => {
      todo.completed = checkbox.checked;
      saveAndRenderTodos();
    });

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    const delBtn = document.createElement('button');
    delBtn.className = 'btn danger';
    delBtn.textContent = 'Удалить';
    delBtn.addEventListener('click', () => {
      todos = todos.filter(t => t.id !== todo.id);
      saveAndRenderTodos();
    });

    const leftDiv = document.createElement('div');
    leftDiv.style.display = 'flex';
    leftDiv.style.alignItems = 'center';
    leftDiv.style.gap = '10px';
    leftDiv.append(checkbox, span);

    li.append(leftDiv, delBtn);
    todoList.appendChild(li);
  });
}

todoAddBtn.addEventListener('click', () => {
  const text = todoInput.value.trim();
  if (!text) {
    alert('Пожалуйста, введите текст задачи!');
    return;
  }

  const newTodo = {
    id: Date.now(),
    text: text,
    completed: false
  };

  todos.push(newTodo);
  todoInput.value = '';
  saveAndRenderTodos();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    filterBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderTodos();
  });
});


// ==========================================
// 3. Мастер заявки (Wizard)
// ==========================================
const STORAGE_KEY_DRAFT = 'lab8_app_draft';         // sessionStorage
const STORAGE_KEY_APPS = 'lab8_applications';       // localStorage

let currentWizardStep = 1;

// Элементы формы
const applicantName = document.querySelector('#applicant-name');
const applicantEmail = document.querySelector('#applicant-email');
const appCategory = document.querySelector('#app-category');
const appDescription = document.querySelector('#app-description');
const wizardSummary = document.querySelector('#wizard-summary');
const appsList = document.querySelector('#applications-list');

// Сохранение черновика в sessionStorage
function saveDraft() {
  const draft = {
    step: currentWizardStep,
    name: applicantName.value,
    email: applicantEmail.value,
    category: appCategory.value,
    description: appDescription.value
  };
  sessionStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
}

// Загрузка черновика из sessionStorage
function loadDraft() {
  const draft = safeJSONParse(STORAGE_KEY_DRAFT, sessionStorage, null);
  if (draft) {
    applicantName.value = draft.name || '';
    applicantEmail.value = draft.email || '';
    appCategory.value = draft.category || '';
    appDescription.value = draft.description || '';
    if (draft.step && draft.step >= 1 && draft.step <= 3) {
      goToStep(draft.step);
    }
  }
}

// Переключение шагов мастера
function goToStep(step) {
  currentWizardStep = step;

  document.querySelectorAll('.wizard-step-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.step-indicator').forEach(el => el.classList.remove('active'));

  document.querySelector(`#wizard-step-${step}`).classList.add('active');
  document.querySelector(`#step-ind-${step}`).classList.add('active');

  if (step === 3) {
    wizardSummary.innerHTML = `
      <p><strong>ФИО:</strong> ${escapeHtml(applicantName.value)}</p>
      <p><strong>Email:</strong> ${escapeHtml(applicantEmail.value)}</p>
      <p><strong>Категория:</strong> ${escapeHtml(appCategory.value)}</p>
      <p><strong>Описание:</strong> ${escapeHtml(appDescription.value)}</p>
    `;
  }

  saveDraft();
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}

// Автосохранение черновика при изменении ввода
[applicantName, applicantEmail, appCategory, appDescription].forEach(input => {
  input.addEventListener('input', saveDraft);
});

// Переходы между шагами с валидацией
document.querySelector('#wizard-next-1').addEventListener('click', () => {
  if (!applicantName.value.trim() || !applicantEmail.value.trim()) {
    alert('Заполните ФИО и Email!');
    return;
  }
  goToStep(2);
});

document.querySelector('#wizard-prev-2').addEventListener('click', () => goToStep(1));

document.querySelector('#wizard-next-2').addEventListener('click', () => {
  if (!appCategory.value || !appDescription.value.trim()) {
    alert('Выберите категорию и заполните описание!');
    return;
  }
  goToStep(3);
});

document.querySelector('#wizard-prev-3').addEventListener('click', () => goToStep(2));

// Финальная отправка формы
document.querySelector('#wizard-submit').addEventListener('click', () => {
  const applications = safeJSONParse(STORAGE_KEY_APPS, localStorage, []);

  const newApp = {
    id: Date.now(),
    date: new Date().toLocaleString('ru-RU'),
    name: applicantName.value.trim(),
    email: applicantEmail.value.trim(),
    category: appCategory.value,
    description: appDescription.value.trim()
  };

  applications.push(newApp);
  localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));

  // Очищаем черновик и сбрасываем форму
  sessionStorage.removeItem(STORAGE_KEY_DRAFT);
  applicantName.value = '';
  applicantEmail.value = '';
  appCategory.value = '';
  appDescription.value = '';

  goToStep(1);
  renderApplications();
  alert('Заявка успешно отправлена!');
});

// Отображение списка заявок из localStorage
function renderApplications() {
  appsList.replaceChildren();
  const apps = safeJSONParse(STORAGE_KEY_APPS, localStorage, []);

  if (!Array.isArray(apps) || apps.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.textContent = 'Нет отправленных заявок';
    emptyLi.style.color = '#888';
    appsList.appendChild(emptyLi);
    return;
  }

  apps.forEach(app => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>[${app.date}] ${escapeHtml(app.name)} (${escapeHtml(app.category)})</strong><br>
        <small>${escapeHtml(app.description)}</small>
      </div>
    `;

    const delBtn = document.createElement('button');
    delBtn.className = 'btn danger';
    delBtn.textContent = 'Удалить';
    delBtn.addEventListener('click', () => {
      const updatedApps = apps.filter(item => item.id !== app.id);
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(updatedApps));
      renderApplications();
    });

    li.appendChild(delBtn);
    appsList.appendChild(li);
  });
}


// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  initSettings();
  renderTodos();
  loadDraft();
  renderApplications();
});