const noteEl = document.getElementById("note");
const entriesEl = document.getElementById("entries");
const saveBtn = document.getElementById("saveBtn");
const clearTodayBtn = document.getElementById("clearTodayBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadEntries() {
  const raw = localStorage.getItem("dailyLogEntries");
  return raw ? JSON.parse(raw) : {};
}

function saveEntries(entries) {
  localStorage.setItem("dailyLogEntries", JSON.stringify(entries));
}

function renderEntries() {
  const entries = loadEntries();
  const keys = Object.keys(entries).sort().reverse();

  entriesEl.innerHTML = "";

  if (keys.length === 0) {
    entriesEl.innerHTML = `<div class="empty">No entries yet. Start by writing something for today.</div>`;
    return;
  }

  for (const date of keys) {
    const text = entries[date];
    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `
      <div class="entry-header">
        <span>${date}</span>
      </div>
      <div>${text.replace(/\n/g, "<br>")}</div>
    `;
    entriesEl.appendChild(div);
  }
}

function loadToday() {
  const entries = loadEntries();
  const todayKey = getTodayKey();
  noteEl.value = entries[todayKey] || "";
}

saveBtn.addEventListener("click", () => {
  const text = noteEl.value.trim();
  const entries = loadEntries();
  const todayKey = getTodayKey();

  if (!text) {
    delete entries[todayKey];
  } else {
    entries[todayKey] = text;
  }

  saveEntries(entries);
  renderEntries();
});

clearTodayBtn.addEventListener("click", () => {
  noteEl.value = "";
  const entries = loadEntries();
  const todayKey = getTodayKey();
  delete entries[todayKey];
  saveEntries(entries);
  renderEntries();
});

clearAllBtn.addEventListener("click", () => {
  if (confirm("Clear all entries? This can’t be undone.")) {
    localStorage.removeItem("dailyLogEntries");
    noteEl.value = "";
    renderEntries();
  }
});

// Init
loadToday();
renderEntries();
