import { useState } from 'react';

// --- ВАРИАНТ 1: Счетчик лайков ---
export function Variant01LikeButton({ onAction }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const toggle = () => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); onAction?.(); };
  return (
    <article className="sub-card">
      <span className="tag">Вариант 1 • Базовый</span>
      <h3 style={{ margin: '10px 0 4px', fontSize: '1.1rem' }}>Счетчик лайков (LikeButton)</h3>
      <p className="muted-text" style={{ marginBottom: '16px' }}>Получает подпись через props, число лайков в state.</p>
      <button type="button" className={`btn ${liked ? 'btn-terracotta' : 'btn-primary'}`} onClick={toggle}>
        {liked ? '♥ Понравилось' : '♡ Оценить'} ({likes})
      </button>
    </article>
  );
}

// --- ВАРИАНТ 2: Карточка студента ---
export function Variant02StudentCard({ onAction }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="sub-card">
      <div className="space-between" style={{ marginBottom: '8px' }}>
        <span className="tag">ИС-24-1</span>
        <span className="muted-text">GPA: 3.85</span>
      </div>
      <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>Айгерим Касымова</h3>
      <p className="muted-text" style={{ marginBottom: '14px' }}>Информационные системы</p>
      {expanded && (
        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-line)', marginBottom: '14px', fontSize: '0.86rem' }}>
          <div><strong>Email:</strong> a.kasymova@edu.kz</div>
          <div><strong>Статус:</strong> Очная форма обучения</div>
        </div>
      )}
      <button type="button" className="btn btn-outline btn-sm" onClick={() => { setExpanded(!expanded); onAction?.(); }}>
        {expanded ? 'Скрыть ▲' : 'Подробнее ▼'}
      </button>
    </article>
  );
}

// --- ВАРИАНТ 3: Переключатель темы ---
export function Variant03ThemeSwitch({ onAction }) {
  const [theme, setTheme] = useState('paper');
  const themes = {
    paper: { name: 'Тёплая бумага', bg: '#F7F4EE', fg: '#1F2421' },
    sage: { name: 'Шалфей', bg: '#E4EDE8', fg: '#1A3628' },
  };
  const current = themes[theme];
  return (
    <div>
      <div className="row-flex" style={{ marginBottom: '16px' }}>
        <button type="button" className={`btn ${theme === 'paper' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setTheme('paper'); onAction?.(); }}>Тёплая бумага</button>
        <button type="button" className={`btn ${theme === 'sage' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setTheme('sage'); onAction?.(); }}>Шалфей</button>
      </div>
      <div style={{ background: current.bg, color: current.fg, padding: '24px', borderRadius: '12px', border: '1px solid var(--border-line)' }}>
        <h3>Активная тема: {current.name}</h3>
        <p className="muted-text" style={{ marginTop: '6px' }}>Названия тем передаются через props, состояние хранится в state.</p>
      </div>
    </div>
  );
}

// --- ВАРИАНТ 4: Мини-таймер ---
export function Variant04MiniTimer({ onAction }) {
  const [minutes, setMinutes] = useState(25);
  return (
    <article className="sub-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
      <span className="tag-ochre tag">Помидоро Таймер</span>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '3rem', fontWeight: 700, margin: '14px 0' }}>
        {String(minutes).padStart(2, '0')}:00
      </div>
      <div className="row-flex" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => { setMinutes(Math.max(0, minutes - 5)); onAction?.(); }}>-5 мин</button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => { setMinutes(minutes + 5); onAction?.(); }}>+5 мин</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => { setMinutes(25); onAction?.(); }}>Сброс</button>
      </div>
    </article>
  );
}

// --- ВАРИАНТ 5: Оценка занятия ---
export function Variant05Rating({ onAction }) {
  const [score, setScore] = useState(0);
  return (
    <article className="sub-card" style={{ maxWidth: '480px' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Оценка лабораторной работы № 11</h3>
      <div className="row-flex" style={{ marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map((num) => (
          <button key={num} type="button" className={`btn btn-sm ${num <= score ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setScore(num); onAction?.(); }}>
            ★ {num}
          </button>
        ))}
      </div>
      <p className="muted-text">{score > 0 ? `Выставлена оценка: ${score} из 5` : 'Выберите балл от 1 до 5'}</p>
    </article>
  );
}

// --- ВАРИАНТ 6: Показ/скрытие текста (Spoiler) ---
export function Variant06Spoiler({ onAction }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="sub-card" style={{ maxWidth: '540px' }}>
      <div className="space-between">
        <h3>Контрольный вопрос: что такое state?</h3>
        <button type="button" className={`btn btn-sm ${isOpen ? 'btn-terracotta' : 'btn-primary'}`} onClick={() => { setIsOpen(!isOpen); onAction?.(); }}>
          {isOpen ? 'Скрыть' : 'Показать ответ'}
        </button>
      </div>
      {isOpen && (
        <p style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-line)', fontSize: '0.92rem' }}>
          State — это внутреннее локальное хранилище данных компонента, изменение которого вызывает автоматическую перерисовку интерфейса.
        </p>
      )}
    </div>
  );
}

// --- ВАРИАНТ 7: Карточка товара ---
export function Variant07ProductCard({ onAction }) {
  const [qty, setQty] = useState(0);
  const price = 8500;
  return (
    <article className="sub-card" style={{ maxWidth: '380px' }}>
      <span className="tag-terra tag">Керамика</span>
      <h3 style={{ fontSize: '1.3rem', margin: '8px 0 4px' }}>Чайная пара «Терракота»</h3>
      <p className="muted-text" style={{ marginBottom: '14px' }}>Цена: {price.toLocaleString()} ₸</p>
      <div className="space-between" style={{ borderTop: '1px dashed var(--border-line)', paddingTop: '12px' }}>
        <div className="row-flex">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => { setQty(Math.max(0, qty - 1)); onAction?.(); }} disabled={qty === 0}>−</button>
          <strong>{qty}</strong>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => { setQty(qty + 1); onAction?.(); }}>+</button>
        </div>
        <span>Итого: {(qty * price).toLocaleString()} ₸</span>
      </div>
    </article>
  );
}

// --- ВАРИАНТ 8: Список задач ---
export function Variant08TodoList({ onAction }) {
  const [todos, setTodos] = useState([{ id: 1, text: 'Изучить React props и state', done: false }]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const add = (e) => {
    e.preventDefault();
    if (!text.trim()) { setError('Введите текст задачи!'); return; }
    setTodos([{ id: Date.now(), text: text.trim(), done: false }, ...todos]);
    setText('');
    setError('');
    onAction?.();
  };

  return (
    <div style={{ maxWidth: '560px' }}>
      <form className="row-flex" onSubmit={add} style={{ marginBottom: '12px' }}>
        <input className="input" style={{ flex: 1 }} placeholder="Новая задача..." value={text} onChange={(e) => { setText(e.target.value); setError(''); }} />
        <button type="submit" className="btn btn-primary">Добавить</button>
      </form>
      {error && <div className="alert-error">{error}</div>}
      <ul style={{ listStyle: 'none' }}>
        {todos.map((t) => (
          <li key={t.id} className="sub-card space-between" style={{ padding: '10px 14px', marginBottom: '8px' }}>
            <label className="row-flex" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={t.done} onChange={() => { setTodos(todos.map(x => x.id === t.id ? {...x, done: !x.done} : x)); onAction?.(); }} />
              <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            </label>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => { setTodos(todos.filter(x => x.id !== t.id)); onAction?.(); }}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- ВАРИАНТ 9: Каталог курсов ---
export function Variant09CourseCatalog({ onAction }) {
  const [selected, setSelected] = useState('React');
  return (
    <div>
      <div className="card-grid" style={{ marginBottom: '16px' }}>
        {['React', 'MySQL', 'JavaScript'].map((c) => (
          <article key={c} className="sub-card" style={{ background: selected === c ? 'var(--accent-sage-light)' : 'var(--bg-paper)' }}>
            <h3>Курс: {c}</h3>
            <p className="muted-text" style={{ margin: '8px 0' }}>Практические лабораторные работы</p>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => { setSelected(c); onAction?.(); }}>{selected === c ? 'Выбран ✓' : 'Выбрать'}</button>
          </article>
        ))}
      </div>
      <div className="sub-card" style={{ background: 'var(--bg-subtle)' }}>
        <strong>Выбранный курс для подробного изучения:</strong> {selected}
      </div>
    </div>
  );
}

// --- ВАРИАНТ 10: Опрос ---
export function Variant10Poll({ onAction }) {
  const [voted, setVoted] = useState(null);
  return (
    <div className="sub-card" style={{ maxWidth: '520px' }}>
      <h3>Что вызывает повторный рендер компонента?</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0' }}>
        {['Изменение state', 'Обновление props', 'Оба варианта'].map((opt) => (
          <button key={opt} type="button" className={`btn ${voted === opt ? 'btn-primary' : 'btn-outline'}`} style={{ justifyContent: 'flex-start' }} onClick={() => { setVoted(opt); onAction?.(); }}>
            {opt} {voted === opt && '✓'}
          </button>
        ))}
      </div>
      {voted && <p className="muted-text">Ваш ответ учтен: <strong>{voted}</strong></p>}
    </div>
  );
}

// --- ВАРИАНТ 11: Корзина ---
export function Variant11Cart({ onAction }) {
  const [count, setCount] = useState(0);
  const [sum, setSum] = useState(0);
  return (
    <div style={{ maxWidth: '500px' }}>
      <div className="sub-card space-between" style={{ background: 'var(--accent-sage-light)', marginBottom: '16px' }}>
        <span>Товаров: <strong>{count}</strong></span>
        <span>Сумма: <strong>{sum.toLocaleString()} ₸</strong></span>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => { setCount(0); setSum(0); onAction?.(); }}>Сброс</button>
      </div>
      <button type="button" className="btn btn-primary" onClick={() => { setCount(count + 1); setSum(sum + 4900); onAction?.(); }}>
        + Добавить товар (4 900 ₸)
      </button>
    </div>
  );
}

// --- ВАРИАНТ 12: Форма обратной связи ---
export function Variant12FeedbackForm({ onAction }) {
  const [name, setName] = useState('');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div className="sub-card">
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Ваше имя:</label>
        <input className="input" style={{ width: '100%' }} placeholder="Введите имя..." value={name} onChange={(e) => { setName(e.target.value); onAction?.(); }} />
      </div>
      <div className="sub-card" style={{ background: 'var(--bg-subtle)' }}>
        <strong>Предпросмотр в реальном времени:</strong>
        <p style={{ marginTop: '8px' }}>{name || 'Здесь появится введённое имя...'}</p>
      </div>
    </div>
  );
}

// --- ВАРИАНТ 13: Фильтр студентов ---
export function Variant13StudentFilter({ onAction }) {
  const [query, setQuery] = useState('');
  const students = ['Айгерим Касымова', 'Тимур Жумабаев', 'Мадина Садыкова', 'Арман Абдрахманов'];
  const filtered = students.filter(s => s.toLowerCase().includes(query.toLowerCase()));
  return (
    <div style={{ maxWidth: '500px' }}>
      <input className="input" style={{ width: '100%', marginBottom: '12px' }} placeholder="Поиск студента..." value={query} onChange={(e) => { setQuery(e.target.value); onAction?.(); }} />
      <ul style={{ listStyle: 'none' }}>
        {filtered.map(s => <li key={s} className="sub-card" style={{ padding: '8px 12px', marginBottom: '6px' }}>{s}</li>)}
      </ul>
    </div>
  );
}

// --- ВАРИАНТ 14: Вкладки ---
export function Variant14Tabs({ onAction }) {
  const [tab, setTab] = useState('1');
  return (
    <div>
      <div className="row-flex" style={{ marginBottom: '14px' }}>
        {['1', '2', '3'].map(t => (
          <button key={t} type="button" className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setTab(t); onAction?.(); }}>
            Вкладка {t}
          </button>
        ))}
      </div>
      <div className="sub-card">
        <h3>Содержимое вкладки № {tab}</h3>
        <p className="muted-text" style={{ marginTop: '6px' }}>Активная вкладка хранится в state родительского компонента.</p>
      </div>
    </div>
  );
}

// --- ВАРИАНТ 15: Мини-викторина ---
export function Variant15MiniQuiz({ onAction }) {
  const [q, setQ] = useState(0);
  const questions = ['Что такое Props?', 'Для чего нужен useState?'];
  return (
    <article className="sub-card" style={{ maxWidth: '480px' }}>
      <span className="tag">Вопрос {q + 1} из 2</span>
      <h3 style={{ margin: '10px 0 14px' }}>{questions[q]}</h3>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => { setQ(q === 0 ? 1 : 0); onAction?.(); }}>
        Следующий вопрос →
      </button>
    </article>
  );
}

// --- ВАРИАНТ 16: Планировщик расходов ---
export function Variant16ExpensePlanner({ onAction }) {
  const [expenses, setExpenses] = useState([{ id: 1, title: 'Книги', amount: 5000 }]);
  return (
    <div style={{ maxWidth: '540px' }}>
      <div className="sub-card space-between" style={{ background: 'var(--bg-subtle)', marginBottom: '12px' }}>
        <span>Всего расходов: <strong>{expenses.reduce((a, b) => a + b.amount, 0).toLocaleString()} ₸</strong></span>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => { setExpenses([...expenses, {id: Date.now(), title: 'Обед', amount: 2000}]); onAction?.(); }}>+ Расход (2000 ₸)</button>
      </div>
      {expenses.map(e => (
        <div key={e.id} className="sub-card space-between" style={{ padding: '8px 12px', marginBottom: '6px' }}>
          <span>{e.title}</span>
          <strong>{e.amount} ₸</strong>
        </div>
      ))}
    </div>
  );
}

// --- ВАРИАНТ 17: Бронирование аудиторий ---
export function Variant17RoomBooking({ onAction }) {
  const [booked, setBooked] = useState(false);
  return (
    <article className="sub-card" style={{ maxWidth: '400px' }}>
      <h3>Аудитория № 304</h3>
      <p className="muted-text" style={{ margin: '6px 0 12px' }}>Статус: {booked ? 'Забронировано' : 'Свободна'}</p>
      <button type="button" className={`btn btn-sm ${booked ? 'btn-terracotta' : 'btn-primary'}`} onClick={() => { setBooked(!booked); onAction?.(); }}>
        {booked ? 'Отменить бронь' : 'Забронировать'}
      </button>
    </article>
  );
}

// --- ВАРИАНТ 18: Электронный журнал ---
export function Variant18Gradebook({ onAction }) {
  const [grades, setGrades] = useState([5, 4, 5]);
  const avg = (grades.reduce((a,b)=>a+b,0)/grades.length).toFixed(2);
  return (
    <article className="sub-card" style={{ maxWidth: '440px' }}>
      <h3>Студент: Арман Абдрахманов</h3>
      <p className="muted-text" style={{ margin: '6px 0' }}>Оценки: {grades.join(', ')} • Средний балл: <strong>{avg}</strong></p>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => { setGrades([...grades, 5]); onAction?.(); }}>
        + Выставить оценку 5
      </button>
    </article>
  );
}

// --- ВАРИАНТ 19: Канбан-доска ---
export function Variant19KanbanBoard({ onAction }) {
  const [status, setStatus] = useState('todo');
  return (
    <article className="sub-card" style={{ maxWidth: '400px' }}>
      <span className="tag">Статус: {status}</span>
      <h3 style={{ margin: '8px 0 12px' }}>Разработка компонентов React</h3>
      <div className="row-flex">
        <button type="button" className="btn btn-outline btn-sm" onClick={() => { setStatus('todo'); onAction?.(); }}>В план</button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => { setStatus('done'); onAction?.(); }}>Готово</button>
      </div>
    </article>
  );
}

// --- ВАРИАНТ 20: Конструктор заказа ---
export function Variant20OrderBuilder({ onAction }) {
  const [count, setCount] = useState(1);
  return (
    <article className="sub-card" style={{ maxWidth: '420px' }}>
      <h3>Блюдо: Тыквенный крем-суп</h3>
      <p className="muted-text" style={{ margin: '6px 0' }}>Цена: 2 400 ₸</p>
      <div className="space-between" style={{ marginTop: '12px' }}>
        <div className="row-flex">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => { setCount(Math.max(1, count - 1)); onAction?.(); }}>−</button>
          <strong>{count}</strong>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => { setCount(count + 1); onAction?.(); }}>+</button>
        </div>
        <strong>Сумма: {(count * 2400).toLocaleString()} ₸</strong>
      </div>
    </article>
  );
}
