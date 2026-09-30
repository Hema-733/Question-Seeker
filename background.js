// background.js is required for Manifest V3 service workers, 
// even if it remains mostly empty for simple content-script tasks.
chrome.runtime.onInstalled.addListener(() => {
  console.log("Quiz Extractor Extension Installed.");
});
