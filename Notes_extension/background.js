
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "addSelectedText") {
        const selectedText = request.text;
        chrome.storage.local.get({ notes: [] }, (data) => {
            const notes = data.notes;
            const timestamp = new Date().toLocaleString();
            notes.push({ text: selectedText, timestamp: timestamp });
            chrome.storage.local.set({ notes });
        });
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, { action: "extensionReady" });
    }
});
