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
