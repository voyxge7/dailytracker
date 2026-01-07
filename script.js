const STORAGE_KEY = "dailyCheckerCalendarData";

let data = loadData();

let selectedDate = new Date();
let currentMonth = selectedDate.getMonth();
let currentYear = selectedDate.getFullYear();

const monthLabelEl = document.getElementById("monthLabel");
const calendarDaysEl = document.getElementById("calendarDays");

const selectedDateLabelEl = document.getElementById("selectedDateLabel");
const selectedDateSummaryEl = document.getElementById("selectedDateSummary");
const checklistEl = document.getElementById("checklist");
const noHabitsMessageEl = document.getElementById("noHabitsMessage");

const newHabitInputEl = document.getElementById("newHabitInput");
const addHabitBtn = document.getElementById("addHabitBtn");
const habitListEl = document.getElementById("habitList");

document.getElementById("prevMonthBtn").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

document.getElementById("nextMonthBtn").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

addHabitBtn.addEventListener("click", () => {
  const name = newHabitInputEl.value.trim();
  if (!name) return;

  const habit = {
    id: generateId(),
    name
  };

  data.habits.push(habit);
  saveData();
  newHabitInputEl.value = "";
  renderHabits();
  renderChecklist();
  renderCalendar();
});

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      habits: [],
      days: {} // "YYYY-MM-DD" -> { completed: { habitId: true/false } }
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {
      habits: [],
      days: {}
    };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function dateToKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayData(key) {
  if (!data.days[key]) {
    data.days[key] = { completed: {} };
  }
  return data.days[key];
}

function renderCalendar() {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  monthLabelEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  calendarDaysEl.innerHTML = "";

  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDay = firstOfMonth.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const today = new Date();
  const todayKey = dateToKey(today);
  const selectedKey = dateToKey(selectedDate);

  // Empty cells before first day
  for (let i = 0; i < startingDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day calendar-day-empty";
    calendarDaysEl.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(currentYear, currentMonth, day);
    const key = dateToKey(cellDate);

    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.dataset.dateKey = key;

    if (key === todayKey) {
      cell.classList.add("calendar-day-today");
    }
    if (key === selectedKey) {
      cell.classList.add("calendar-day-selected");
    }

    const dateLabel = document.createElement("div");
    dateLabel.className = "calendar-day-date";
    dateLabel.textContent = day;

    const countLabel = document.createElement("div");
    countLabel.className = "calendar-day-count";

    const { completedCount, totalHabits } = getCompletionSummaryForDayKey(key);

    if (totalHabits > 0) {
      countLabel.textContent = `${completedCount}/${totalHabits}`;
      if (completedCount > 0) {
        cell.classList.add("calendar-day-has-completed");
      }
    } else {
      countLabel.textContent = "-";
    }

    cell.appendChild(dateLabel);
    cell.appendChild(countLabel);

    cell.addEventListener("click", () => {
      selectedDate = cellDate;
      renderCalendar();
      renderChecklist();
    });

    calendarDaysEl.appendChild(cell);
  }
}

function getCompletionSummaryForDayKey(key) {
  const dayData = data.days[key];
  const totalHabits = data.habits.length;

  if (!dayData || !dayData.completed) {
    return { completedCount: 0, totalHabits };
  }

  let completedCount = 0;
  for (const habit of data.habits) {
    if (dayData.completed[habit.id]) {
      completedCount++;
    }
  }
  return { completedCount, totalHabits };
}

function renderChecklist() {
  const key = dateToKey(selectedDate);
  const dayData = getDayData(key);

  selectedDateLabelEl.textContent = formatNiceDate(selectedDate);

  const { completedCount, totalHabits } = getCompletionSummaryForDayKey(key);
  if (totalHabits === 0) {
    selectedDateSummaryEl.textContent = "0/0 habits";
  } else {
    selectedDateSummaryEl.textContent = `${completedCount}/${totalHabits} completed`;
  }

  checklistEl.innerHTML = "";

  if (data.habits.length === 0) {
    noHabitsMessageEl.style.display = "block";
    return;
  } else {
    noHabitsMessageEl.style.display = "none";
  }

  for (const habit of data.habits) {
    const row = document.createElement("div");
    row.className = "checklist-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!dayData.completed[habit.id];
    checkbox.addEventListener("change", () => {
      dayData.completed[habit.id] = checkbox.checked;
      saveData();
      renderChecklist();
      renderCalendar();
    });

    const label = document.createElement("span");
    label.className = "checklist-label";
    label.textContent = habit.name;

    row.appendChild(checkbox);
    row.appendChild(label);
    checklistEl.appendChild(row);
  }
}

function renderHabits() {
  habitListEl.innerHTML = "";

  if (data.habits.length === 0) {
    habitListEl.innerHTML = `<div class="empty">No habits yet. Add one above.</div>`;
    return;
  }

  for (const habit of data.habits) {
    const row = document.createElement("div");
    row.className = "habit-row";

    const nameSpan = document.createElement("span");
    nameSpan.className = "habit-name";
    nameSpan.textContent = habit.name;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "habit-delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      if (!confirm(`Delete habit "${habit.name}"?`)) return;

      data.habits = data.habits.filter(h => h.id !== habit.id);

      // Also clean up completions for this habit
      for (const key of Object.keys(data.days)) {
        if (data.days[key].completed && habit.id in data.days[key].completed) {
          delete data.days[key].completed[habit.id];
        }
      }

      saveData();
      renderHabits();
      renderChecklist();
      renderCalendar();
    });

    row.appendChild(nameSpan);
    row.appendChild(deleteBtn);
    habitListEl.appendChild(row);
  }
}

function formatNiceDate(date) {
  const options = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

// Init
renderHabits();
renderCalendar();
renderChecklist();
