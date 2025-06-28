function displayNotes() {
    chrome.storage.local.get({ notes: [] }, (data) => {
        const notesList = document.getElementById("notesList");
        notesList.innerHTML = "";

        if (data.notes.length === 0) {
            notesList.innerHTML = "<p>No saved notes yet.</p>";
            return;
        }

        data.notes.forEach((note, index) => {
            const noteDiv = document.createElement("div");
            noteDiv.className = "note";
            noteDiv.innerHTML = `
                <span class="note-text">${note.text}</span>
                <strong class="note-timestamp">${note.timestamp}</strong>
                <div class="note-actions">
                    <button class="edit-note" data-index="${index}">Edit</button>
                </div>
            `;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🇽";
            deleteBtn.className = "delete-btn";
            deleteBtn.onclick = () => deleteNote(index);

            noteDiv.querySelector(".note-actions").appendChild(deleteBtn);
            notesList.appendChild(noteDiv);
        });
        document.querySelectorAll(".edit-note").forEach((button) => {
            button.addEventListener("click", editNote);
        });
    });
}

function deleteNote(index) {
    chrome.storage.local.get({ notes: [] }, (data) => {
        const notes = data.notes;
        notes.splice(index, 1);
        chrome.storage.local.set({ notes }, displayNotes);
    });
}

function editNote(event) {
    const noteDiv = event.target.closest(".note");
    const noteTextSpan = noteDiv.querySelector(".note-text");
    const noteIndex = event.target.dataset.index;
    const currentNoteText = noteTextSpan.textContent;

    noteDiv.innerHTML = `
        <textarea class="edit-textarea">${currentNoteText}</textarea>
        <div class="edit-buttons">
            <button class="save-edit" data-index="${noteIndex}">Save</button>
            <button class="cancel-edit">Cancel</button>
        </div>
    `;

    noteDiv.querySelector(".save-edit").addEventListener("click", saveEditedNote);
    noteDiv.querySelector(".cancel-edit").addEventListener("click", displayNotes);
}

function saveEditedNote(event) {
    const noteDiv = event.target.closest(".note");
    const editedText = noteDiv.querySelector(".edit-textarea").value.trim();
    const noteIndex = event.target.dataset.index;

    chrome.storage.local.get({ notes: [] }, (data) => {
        const notes = data.notes;
        notes[noteIndex].text = editedText;
        chrome.storage.local.set({ notes }, displayNotes);
    });
}

document.getElementById("goBack").addEventListener("click", () => {
    window.location.href = "popup.html";
});

displayNotes();
