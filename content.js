// Listen for the start command from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startExtraction") {
    startExtraction();
  }
});

async function startExtraction() {
  let allQuestions = [];
  
  // Dynamically find the total number of questions by reading the "Question 1 of X" text on the page
  let totalQuestions = 210; // default fallback
  const totalMatch = document.body.innerText.match(/Question \d+ of (\d+)/i) || document.body.innerText.match(/\b\d+\/(\d+)\b/);
  if (totalMatch && totalMatch[1]) {
    totalQuestions = parseInt(totalMatch[1], 10);
  }

  for (let i = 1; i <= totalQuestions; i++) {
    // Extracting the question: since 'h2' matched your name in the header, 
    // we will grab all h2s and automatically pick the longest one (which is always the question)
    const h2s = Array.from(document.querySelectorAll('h2'));
    const questionH2 = h2s.sort((a, b) => (b.innerText?.length || 0) - (a.innerText?.length || 0))[0];
    const qText = questionH2 ? questionH2.innerText.trim() : '[Question Text Missing]';
    
    // Target all option boxes dynamically (some questions have 6 options: A-F)
    const optionBoxes = document.querySelectorAll('.space-y-2 > div');
    let optionsFormatted = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    for (let j = 0; j < optionBoxes.length; j++) {
        const letter = alphabet[j];
        const box = optionBoxes[j];
        const text = box ? box.innerText.replace(new RegExp(`^${letter}\\s*\\n?`), '').trim() : `[Missing]`;
        optionsFormatted += `${letter}) ${text}\n`;
    }

    // Format the question
    const formatted = `Question ${i}:\n${qText}\n\n${optionsFormatted}`;
    allQuestions.push(formatted);

    // Send progress to popup (if it's still open)
    try {
      chrome.runtime.sendMessage({ action: "updateProgress", current: i, total: totalQuestions });
    } catch (e) {
      // Popup might be closed, which is fine
    }

    // Find the main "Next" button.
    // We must avoid the "Next" button in the right sidebar pagination grid!
    // We ALSO must avoid the "Next pending" badge under the question!
    const allButtons = Array.from(document.querySelectorAll('button, a'));
    const possibleNexts = allButtons.filter(el => {
        const txt = (el.innerText || "").trim();
        // The button has an <i> icon inside it, so it DOES have children. We just check the text of the button itself.
        return txt.startsWith('Next') && !txt.toLowerCase().includes('pending') && txt.length < 15;
    });
    
    let nextBtn = null;
    for (const btn of possibleNexts) {
        let parent = btn.parentElement;
        let isMainButton = false;
        let levels = 0;
        // Search up the DOM tree (only up to 6 levels to stay in the bottom footer) 
        while (parent && parent.tagName !== 'BODY' && levels < 6) {
            if (parent.innerText && (parent.innerText.includes('Previous') || parent.innerText.includes('Mark as Complete'))) {
                isMainButton = true;
                break;
            }
            parent = parent.parentElement;
            levels++;
        }
        if (isMainButton) {
            // We found the correct text, now get the actual clickable button wrapping it
            nextBtn = btn.closest('button') || btn.closest('a') || btn;
            break;
        }
    }

    if (nextBtn && i < totalQuestions) {
      // Now that we have perfectly isolated the real <button> element, 
      // a standard click is all we need! (Removing the brute-force click stops the double-jumping).
      nextBtn.click();
      
      // Wait 3 seconds to ensure the network has fully loaded the next question
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else if (i < totalQuestions) {
      console.warn("Next button not found. Stopping early.");
      break;
    }
  }

  // Trigger raw text download
  const allQuestionsStr = allQuestions.join('\n\n');
  downloadFile(allQuestionsStr);
  
  try {
    chrome.runtime.sendMessage({ action: "extractionComplete" });
  } catch (e) {}
}

function downloadFile(content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'extracted_questions.txt';
  a.click();
  URL.revokeObjectURL(url);
}
