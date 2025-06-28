const API_KEY = "AIzaSyBn0elj3WV4SNO69o57v_xDanWoSkV4esM";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

document.getElementById("saveNote").addEventListener("click", saveNote);
document.getElementById("summarizeNote").addEventListener("click",()=>enhanceNote("summarize"));
document.getElementById("improveNote").addEventListener("click",()=>enhanceNote("improve"));
document.getElementById("rewriteNote").addEventListener("click",()=>enhanceNote("rewrite"));
document.getElementById("savedNotes").addEventListener("click",()=>window.location.href="notes.html");


function loadLastSelectedText() {
    chrome.storage.local.get({ notes: [] }, (data) => {
        const notes = data.notes;
        if (notes.length > 0) {
            const lastNote = notes[notes.length - 1];
            document.getElementById("noteInput").value = lastNote.text;
        }
    });
}

function saveNote(){
    const note=document.getElementById("noteInput").value.trim();
    if(!note)
        return;
    const timestamp = new Date().toLocaleString();
    chrome.storage.local.get({ notes: [] }, (data) => {
        const notes = [...data.notes, { text: note, timestamp }];
        chrome.storage.local.set({ notes });
    });
    document.getElementById("noteInput").value = "";
}

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
                <strong>${note.timestamp}</strong><br>
                <span class="note-text">${note.text}</span>
                <button class="edit-note" data-index="${index}">Edit</button>
            `;
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🇽";
            deleteBtn.className = "delete-btn";
            deleteBtn.onclick = () => deleteNote(index);

            noteDiv.appendChild(deleteBtn);
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

async function enhanceNote(action) {
    const note = document.getElementById("noteInput").value.trim();
    if (!note) return;

    const loadingIndicator = document.getElementById("loadingIndicator");
    loadingIndicator.style.display = "block";

    let promptText = "";

    if (action === "summarize") {
        promptText = `Summarize the following note:\n\n${note}`;
    } else if (action === "improve") {
        promptText = `Improve the clarity and structure of this note:\n\n${note}`;
    } else if (action === "rewrite") {
        promptText = `Rewrite this note in a more professional way:\n\n${note}`;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Error: AI couldn't process.";

        loadingIndicator.style.display = "none";
        document.getElementById("noteInput").value = output;
    } catch (error) {
        console.error("Error processing AI request:", error);
        loadingIndicator.style.display = "none";
        document.getElementById("noteInput").value = "Error: AI request failed.";
    }
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
loadLastSelectedText();
displayNotes();