import { useState } from 'react';
import {
  Variant01LikeButton,
  Variant02StudentCard,
  Variant03ThemeSwitch,
  Variant04MiniTimer,
  Variant05Rating,
  Variant06Spoiler,
  Variant07ProductCard,
  Variant08TodoList,
  Variant09CourseCatalog,
  Variant10Poll,
  Variant11Cart,
  Variant12FeedbackForm,
  Variant13StudentFilter,
  Variant14Tabs,
  Variant15MiniQuiz,
  Variant16ExpensePlanner,
  Variant17RoomBooking,
  Variant18Gradebook,
  Variant19KanbanBoard,
  Variant20OrderBuilder
} from './components/AllVariants';

const VARIANTS = [
  { num: 1, level: 'Базовый', title: 'Счетчик лайков', Component: Variant01LikeButton },
  { num: 2, level: 'Базовый', title: 'Карточка студента', Component: Variant02StudentCard },
  { num: 3, level: 'Базовый', title: 'Переключатель темы', Component: Variant03ThemeSwitch },
  { num: 4, level: 'Базовый', title: 'Мини-таймер', Component: Variant04MiniTimer },
  { num: 5, level: 'Базовый', title: 'Оценка занятия', Component: Variant05Rating },
  { num: 6, level: 'Базовый', title: 'Показ/скрытие текста', Component: Variant06Spoiler },
  { num: 7, level: 'Базовый', title: 'Карточка товара', Component: Variant07ProductCard },
  { num: 8, level: 'Средний', title: 'Список задач', Component: Variant08TodoList },
  { num: 9, level: 'Средний', title: 'Каталог курсов', Component: Variant09CourseCatalog },
  { num: 10, level: 'Средний', title: 'Опрос', Component: Variant10Poll },
  { num: 11, level: 'Средний', title: 'Корзина', Component: Variant11Cart },
  { num: 12, level: 'Средний', title: 'Форма обратной связи', Component: Variant12FeedbackForm },
  { num: 13, level: 'Средний', title: 'Фильтр студентов', Component: Variant13StudentFilter },
  { num: 14, level: 'Средний', title: 'Вкладки', Component: Variant14Tabs },
  { num: 15, level: 'Средний', title: 'Мини-викторина', Component: Variant15MiniQuiz },
  { num: 16, level: 'Повышенный', title: 'Планировщик расходов', Component: Variant16ExpensePlanner },
  { num: 17, level: 'Повышенный', title: 'Бронирование аудиторий', Component: Variant17RoomBooking },
  { num: 18, level: 'Повышенный', title: 'Электронный журнал', Component: Variant18Gradebook },
  { num: 19, level: 'Повышенный', title: 'Канбан-доска', Component: Variant19KanbanBoard },
  { num: 20, level: 'Повышенный', title: 'Конструктор заказа', Component: Variant20OrderBuilder },
];

export default function App() {
  const [activeNum, setActiveNum] = useState(1);
  const [actionCount, setActionCount] = useState(0);

  const activeVariant = VARIANTS.find((v) => v.num === activeNum) || VARIANTS[0];
  const ActiveComponent = activeVariant.Component;

  return (
    <div className="app-shell">
      <header className="editorial-header">
        <div className="header-top">
          <span>Лабораторная работа № 11 • React (Props &amp; State)</span>
          <span className="pill-badge">Все 20 вариантов • Действий: {actionCount}</span>
        </div>
        <h1 className="editorial-title">Интерактивный стенд всех 20 вариантов</h1>
        <p className="editorial-desc">
          Выберите нужный номер варианта в панели слева. Все компоненты написаны на чистом React без ошибок импорта.
        </p>
      </header>

      <div className="main-layout">
        <aside className="sidebar-nav">
          <div className="sidebar-group-title"><span>Список вариантов</span><span>1–20</span></div>
          {VARIANTS.map((v) => (
            <button
              key={v.num}
              type="button"
              className={`variant-nav-btn ${activeNum === v.num ? 'active' : ''}`}
              onClick={() => setActiveNum(v.num)}
            >
              <span className="variant-num">{v.num}</span>
              <span>{v.title}</span>
            </button>
          ))}
        </aside>

        <main className="workspace-panel">
          <div className="workspace-header">
            <div>
              <span className="level-pill level-basic">Вариант № {activeVariant.num} • {activeVariant.level} уровень</span>
              <h2 className="workspace-title">{activeVariant.title}</h2>
            </div>
          </div>
          <ActiveComponent onAction={() => setActionCount((c) => c + 1)} />
        </main>
      </div>
    </div>
  );
}
