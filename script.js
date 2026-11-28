const STORAGE_KEY = "simple_notes";

const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("titleInput");
const bodyInput = document.getElementById("bodyInput");
const colorSelect = document.getElementById("colorSelect");
const pinnedInput = document.getElementById("pinnedInput");
const searchInput = document.getElementById("searchInput");
const notesList = document.getElementById("notesList");
const submitBtn = document.getElementById("submitBtn");

let notes = loadNotes();
let editingId = null;

function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY); // load the notes from localStorage
    const parsed = saved ? JSON.parse(saved) : []; // parse the JSON string into an array (saved) as a string in localstorage
    return Array.isArray(parsed) ? parsed : []; // check if the parsed value is an array, if not return an empty array
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function addOrUpdateNote(title, body, color, pinned) {
  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  if (!cleanTitle && !cleanBody) return;

  if (editingId) {
    const note = notes.find((item) => item.id === editingId);
    if (note) {
      note.title = cleanTitle;
      note.body = cleanBody;
      note.color = color;
      note.pinned = pinned;
    }
    editingId = null;
    submitBtn.textContent = "Save Note";
  } else {
    notes.unshift({
      id: String(Date.now()),
      title: cleanTitle,
      body: cleanBody,
      color,
      pinned,
    });
  }

  saveNotes();
  renderNotes();
}

function deleteNote(id) {
  notes = notes.filter((item) => item.id !== id);
  if (editingId === id) {
    editingId = null;
    submitBtn.textContent = "Save Note";
    noteForm.reset();
  }
  saveNotes();
  renderNotes();
}

function startEdit(id) {
  const note = notes.find((item) => item.id === id);
  if (!note) return;

  editingId = note.id;
  titleInput.value = note.title;
  bodyInput.value = note.body;
  colorSelect.value = note.color;
  pinnedInput.checked = note.pinned;
  submitBtn.textContent = "Update Note";
  titleInput.focus();
}

function renderNotes() {
  const query = searchInput.value.trim().toLowerCase();
  notesList.textContent = "";

  const filtered = notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query),
    )
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-msg";
    empty.textContent = query
      ? "No notes match your search."
      : "No notes yet. Add one above.";
    notesList.appendChild(empty);
    return;
  }

  for (const note of filtered) {
    const card = document.createElement("article");
    card.className = `note-card ${note.color}`;

    const heading = document.createElement("h3");
    heading.textContent = `${note.pinned ? "📌 " : ""}${note.title || "Untitled"}`;

    const body = document.createElement("p");
    body.textContent = note.body;

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(note.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteNote(note.id));

    actions.append(editBtn, deleteBtn);
    card.append(heading, body, actions);
    notesList.appendChild(card);
  }
}

noteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addOrUpdateNote(
    titleInput.value,
    bodyInput.value,
    colorSelect.value,
    pinnedInput.checked,
  );
  noteForm.reset();
});

searchInput.addEventListener("input", renderNotes);

renderNotes();
