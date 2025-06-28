
let extensionReady = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "extensionReady") {
        extensionReady = true;
        console.log("Extension is ready. Content script can now send messages.");
    }
});

document.addEventListener('mouseup', function(event) {
    const selectedText = window.getSelection().toString().trim();
    console.log("Content script loaded");
    if (selectedText.length > 0) {
        console.log("Sending message:", selectedText);
        if (extensionReady) {
            chrome.runtime.sendMessage({ action: "addSelectedText", text: selectedText });
        } else {
            console.log("Extension not ready yet. Message will be lost.");
        }
    }
});
