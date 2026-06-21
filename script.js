const form = document.getElementById("soapForm");
const savedNotes = document.getElementById("savedNotes");
const savedIntakeForms = document.getElementById("savedIntakeForms");
const intakeFormsInput = document.getElementById("intakeForms");
const MAX_FILE_SIZE_MB = 3;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
// Keep below common 5MB localStorage quotas and leave room for other app keys.
const MAX_LOCAL_STORAGE_CHARS = 4_500_000;

const statusMessage = document.createElement("p");
statusMessage.setAttribute("role", "status");
statusMessage.setAttribute("aria-live", "polite");
form.insertAdjacentElement("afterend", statusMessage);

function getStorageArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function setStorageArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b22222" : "#2b5f2b";
}

function sanitizeFileName(name) {
  return String(name || "uploaded-file")
    .replace(/[<>`"'\\]/g, "_")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, 120);
}

function sanitizeMimeType(type) {
  return /^[\w.+-]+\/[\w.+-]+$/.test(type || "") ? type : "application/octet-stream";
}

function getNotes() {
  return getStorageArray("soapNotes");
}

function saveNotes(notes) {
  setStorageArray("soapNotes", notes);
}

function getIntakeForms() {
  return getStorageArray("intakeForms");
}

function saveIntakeForms(forms) {
  setStorageArray("intakeForms", forms);
}

function createTextRow(label, value) {
  const line = document.createElement("div");
  line.textContent = `${label}: ${value || "N/A"}`;
  return line;
}

function displayNotes() {
  const notes = getNotes();
  savedNotes.innerHTML = "";

  notes.forEach((note, index) => {
    const card = document.createElement("div");
    card.className = "note";

    const title = document.createElement("strong");
    title.textContent = note.name || "Unnamed Client";
    card.appendChild(title);
    card.appendChild(createTextRow("Date", note.date || "No date"));
    card.appendChild(createTextRow("Session Length", note.sessionLength || "N/A"));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteNote(index));
    card.appendChild(deleteButton);

    savedNotes.appendChild(card);
  });
}

function displayIntakeForms() {
  const forms = getIntakeForms();
  savedIntakeForms.innerHTML = "";

  forms.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "note";

    const name = document.createElement("strong");
    name.textContent = item.name || "Uploaded intake form";
    card.appendChild(name);
    card.appendChild(createTextRow("Uploaded", item.uploadedAt || "Unknown"));

    const openLink = document.createElement("a");
    openLink.href = item.dataUrl;
    openLink.target = "_blank";
    openLink.rel = "noopener noreferrer";
    openLink.textContent = "Open file";
    card.appendChild(openLink);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteIntakeForm(index));
    card.appendChild(deleteButton);

    savedIntakeForms.appendChild(card);
  });
}

function deleteNote(index) {
  const notes = getNotes();
  notes.splice(index, 1);
  saveNotes(notes);
  displayNotes();
}

function deleteIntakeForm(index) {
  const forms = getIntakeForms();
  forms.splice(index, 1);
  saveIntakeForms(forms);
  displayIntakeForms();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const safeName = sanitizeFileName(file.name);
    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(
        new Error(
          `Could not read "${safeName}": ${reader.error?.message || "Unknown error"}.`
        )
      );
    reader.readAsDataURL(file);
  });
}

function assertStorageBudget(notes, forms) {
  const noteChars = JSON.stringify(notes).length;
  const formChars = JSON.stringify(forms).length;
  if (noteChars + formChars > MAX_LOCAL_STORAGE_CHARS) {
    throw new Error(
      "Storage limit reached. Delete older intake forms or upload fewer files."
    );
  }
}

function persistState(nextNotes, nextForms, previousNotes, previousForms) {
  try {
    saveNotes(nextNotes);
    saveIntakeForms(nextForms);
  } catch (saveError) {
    try {
      saveNotes(previousNotes);
      saveIntakeForms(previousForms);
    } catch (rollbackError) {
      throw new Error(
        `${saveError.message || "Save failed"} Rollback failed: ${
          rollbackError.message || "Unknown error"
        }.`
      );
    }
    throw new Error(saveError.message || "Unable to save note.");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const note = {};

  formData.forEach((value, key) => {
    if (key === "modalities") {
      if (!note.modalities) note.modalities = [];
      note.modalities.push(value);
      return;
    }

    if (key === "intakeForms") return;
    note[key] = value;
  });

  const previousNotes = getNotes();
  const previousForms = getIntakeForms();

  try {
    const uploads = Array.from(intakeFormsInput.files || []);
    const newForms = [];

    for (const file of uploads) {
      const safeName = sanitizeFileName(file.name);

      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`"${safeName}" is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      }

      const dataUrl = await fileToDataUrl(file);
      newForms.push({
        name: safeName,
        type: sanitizeMimeType(file.type),
        uploadedAt: new Date().toISOString(),
        dataUrl
      });
    }

    const nextNotes = [...previousNotes, note];
    const nextForms = [...previousForms, ...newForms];
    assertStorageBudget(nextNotes, nextForms);
    persistState(nextNotes, nextForms, previousNotes, previousForms);

    form.reset();
    setStatus(
      uploads.length
        ? "Note and intake forms saved. Large uploads may fill browser storage quickly."
        : "Note saved successfully."
    );
    displayNotes();
    displayIntakeForms();
  } catch (error) {
    setStatus(error.message || "Unable to save note.", true);
    displayNotes();
    displayIntakeForms();
  }
});

displayNotes();
displayIntakeForms();
