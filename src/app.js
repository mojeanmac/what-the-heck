import { GoogleGenAI } from "@google/genai";
import { prompt } from "./prompt.js";
import yes from './assets/yes.png';
import no from './assets/no.png';
import bb from './assets/bb.png';
import gif1984 from './assets/1984.gif';
import trophy from './assets/trophy.gif';
import scp from './assets/scp.jpg';

async function run(checking) {
  const inputText = document.getElementById('inputText').value;
  const responseDiv = document.getElementById('response');
  const approvalDiv = document.getElementById('approval');
  const suggestionsDiv = document.getElementById('suggestions');
  const gifsDiv = document.getElementById('gifs');
  const summaryDiv = document.getElementById('summary');

  approvalDiv.innerHTML = ''; // Clear the approval div
  approvalDiv.style.display = 'none';

  suggestionsDiv.innerHTML = ''; // Clear the suggestions div
  gifsDiv.innerHTML = ''; // Clear the gifs div
  summaryDiv.innerHTML = ''; // Clear the summary div

  if (!inputText.trim()) {
    responseDiv.textContent = 'Please enter some text.';
    return;
  }

  const prefix = checking 
    ? "Sanitize the text that follows: " 
    : "Sanitize the text that follows with Full Censorship: ";
  const loading = checking ? "Checking" : "Redacting";

  // Add loading animation
  responseDiv.innerHTML = `${loading}<span class="dots"></span>`;
  let dotsInterval = setInterval(() => {
    const dots = responseDiv.querySelector('.dots');
    if (dots.textContent.length >= 3) {
      dots.textContent = '';
    } else {
      dots.textContent += '.';
    }
  }, 500);

  // Prepend the appropriate prefix based on the checkbox state
  const modifiedInputText = prompt + '\n' + prefix + inputText;

  const ai = new GoogleGenAI({ apiKey: "AIzaSyCCaFFr1JcBnGpvQce-RztdoCUC3kLFufE" });

  async function main() {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro-exp-03-25",
      contents: modifiedInputText,
      config:  {
        temperature: 1.2,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 65536,
        responseModalities: [
        ],
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            sanitized_text: {
              type: "string"
            },
            is_safe: {
              type: "boolean"
            },
            safety_desc: {
              type: "string"
            },
            safety_suggestions: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          required: [
            "sanitized_text",
            "is_safe",
            "safety_desc"
          ]
        },
      }
    });

    clearInterval(dotsInterval); // Stop the loading animation

    console.log(response.text); // Log the cleaned response for debugging
    const result = JSON.parse(response.text); // Parse the cleaned JSON

    if (result.is_safe) {
      // Show "not woke" message and image
      approvalDiv.style.background = 'rgba(0, 255, 0, 0.2)';
      approvalDiv.innerHTML = `
        <img src=${yes} alt="Safe" style="width: 50px; height: 50px;">
        <p>Congratulations, your text is officially not woke!</p>
      `;
      responseDiv.innerHTML = '';
      gifsDiv.innerHTML = `
        <img src=${gif1984} alt="1984" style="height: 175px;">
        <img src=${bb} alt="big brother is watching" style="height: 175px;">
        <img src=${trophy} alt="Trophy" style="height: 175px;">
      `; // Show the 1984 gif
      suggestionsDiv.innerHTML = ''; // Clear the suggestions div
    } else {
      // Show "too woke" message and image
      approvalDiv.style.background = 'rgba(255, 0, 0, 0.2)';
      approvalDiv.innerHTML = `
        <img src=${no} alt="Not Safe" style="width: 50px; height: 50px;">
        <p>Unfortunately your input is too woke, here are some patriotic suggestions:</p>
      `;

      // Update suggestions div if safety_suggestions are provided
      if (result.safety_suggestions && result.safety_suggestions.length > 0) {
        const suggestionsList = document.createElement('ul');
        result.safety_suggestions.forEach((suggestion) => {
          const listItem = document.createElement('li');
          listItem.textContent = suggestion;
          suggestionsList.appendChild(listItem);
        });
        suggestionsDiv.innerHTML = '<h2>Suggestions</h2>';
        suggestionsDiv.appendChild(suggestionsList);
      }

      // Update response div with sanitized input if provided
      if (result.sanitized_text) {
        responseDiv.innerHTML = `<h2>Sanitized Version</h2>
        <p>${result.sanitized_text}</p>`;
      } else {
        responseDiv.textContent = ''; // Clear the response text if no sanitized input
      }
    }
    // Show the approval div
    approvalDiv.style.display = 'flex';

    // Add summary section
    summaryDiv.innerHTML = `
      <h2>Summary</h2>
      <p>${result.safety_desc}</p>
    `;
  }

  await main();
}

document.getElementById('checkButton').addEventListener('click', async () => {
  const descElement = document.getElementById("desc");

  descElement.innerHTML = `
  Tired of wondering whether your papers, grant proposals, or documentation will be flagged for “unacceptable” language? What the Heck dot Tech is a lightweight, browser-based tool that instantly scans any block of text against the evolving list of over 250 words and phrases being purged from U.S. government documents, including terms such as “climate change,” “abortion,” “female,” “vaccines,” and “Gulf of Mexico!”
  `;
  document.body.style.backgroundImage = ''; // Reset to default background

  await run(true);
});

document.getElementById('redactButton').addEventListener('click', async () => {
  const descElement = document.getElementById("desc");

  descElement.innerHTML = `
    Tired of wondering whether your papers, grant proposals, or documentation will be flagged for “unacceptable” language? What the Heck dot Tech is a lightweight, browser-based tool that instantly scans any block of text against the evolving list of over 250 words and phrases being purged from U.S. government documents, including terms such as “███████ ██████,” “████████,” “██████,” "████████,” and “████ ██ ██████!”
  `;
  document.body.style.backgroundImage = `url(${scp})`;

  await run(false);
});