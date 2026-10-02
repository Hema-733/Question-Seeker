# Development Log

## 2026-09-30
- Initialized the Chrome/Edge extension project to automate the extraction of multiple-choice questions.
- Created `manifest.json` (Manifest V3 configuration).
- Created the popup interface (`popup.html`, `popup.js`) featuring a "Start Extraction" button and a live progress tracker.
- Built the main web scraping logic in `content.js` to:
  - Iterate through all 210 questions.
  - Automatically click the "Next >" button and wait for the SPA to load.
  - Format the extracted text and automatically download it as `extracted_questions.txt`.
- Successfully tested the extension's execution loop (initially returning placeholders).

### Updates (Later on 2026-09-30)
- **Dynamic Question Count:** Updated logic to parse the page text (e.g., "Question 1 of X" or "19/149") to automatically set the loop limit, supporting assessments of any length without hardcoding.
- **Robust Option Extraction:** Rewrote the option extractor to loop dynamically, fully supporting questions with up to 6+ options (A-F). Removed reliance on specific text colors so extraction works flawlessly on questions that are "marked as read".
- **Intelligent Button Locator:** Fixed bugs where the script clicked the "Next pending" badge or the right sidebar pagination grid. The script now traces the DOM tree to guarantee it only clicks the main "Next" button located in the footer near the "Previous" or "Mark as Complete" buttons.
- **Brute-Force React Clicker:** Fixed an issue where the React SPA ignored standard automated clicks (which caused the same question to be extracted repeatedly). Implemented a full mouse-event simulation (`pointerdown`, `mousedown`, `click`) targeting the text, parent, and grandparent containers to force the SPA to navigate.
- **Timing Adjustments:** Increased the wait time between page navigations to 3 seconds to ensure the network has sufficient time to load the next question.

## 2026-10-01
- **Groq API Integration:** Integrated the Groq API to parse the extracted raw text into structured JSON.
- **Interactive Practice Session Generation:** Built a generator in the background script (`background.js`) that uses the parsed JSON from Groq to dynamically create a standalone HTML file. This file includes built-in CSS and JS to provide an interactive quiz experience (turning correct answers green and incorrect ones red).
- **Automated Downloads:** Added the `downloads` permission to seamlessly trigger a download for `practice_session.html` alongside the original raw text file.

### Updates (Later on 2026-10-01)
- **Service Worker Syntax Fix:** Resolved an "Invalid or unexpected token" parsing error in `background.js` by removing nested template literals during HTML generation and replacing them with standard string concatenation.
- **Improved JSON Parsing:** Added a sanitization step to strip markdown code blocks (e.g., ` ```json `) from the Groq API response before parsing, preventing runtime errors.
- **Enhanced Error Handling:** Plumbed errors from the `chrome.downloads` API and the JSON parser directly to the popup UI for better visibility instead of failing silently.
- **API Key Configuration:** Removed the popup UI for saving the API key to `chrome.storage.local`. Transitioned to a local module approach using a new `config.js` file.
- **ES Module Support:** Updated `manifest.json` to declare `background.js` as an ES module (`"type": "module"`) to allow importing `config.js`.
- **Security:** Added `.gitignore` to ensure `config.js` (and the hardcoded API key) is never committed to version control.

### 2026-10-02
- **Reverted AI Integration:** Removed the LLM integration (both Groq and Gemini) and HTML practice session generation entirely due to restrictive API token limits on 210+ question sets. The extension is now reverted to its original, robust behavior: simply scraping the DOM and extracting a clean `extracted_questions.txt` file.
