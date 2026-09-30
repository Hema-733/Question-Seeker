document.getElementById('startBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab) {
    document.getElementById('progress').innerText = 'Initializing...';
    // Inject and execute the content script
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, () => {
      // After injection, send the start message
      chrome.tabs.sendMessage(tab.id, { action: "startExtraction" });
    });
  }
});

// Listen for progress updates from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateProgress") {
    document.getElementById('progress').innerText = `Extracted ${request.current}/${request.total}`;
  } else if (request.action === "extractionComplete") {
    document.getElementById('progress').innerText = "Extraction Complete!";
  }
});
