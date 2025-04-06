import { GoogleGenAI } from "@google/genai";
import { prompt } from "./prompt.js";

document.getElementById('checkButton').addEventListener('click', async () => {
  const inputText = document.getElementById('inputText').value;
  const responseDiv = document.getElementById('response');
  const approvalDiv = document.getElementById('approval');
  const suggestionsDiv = document.getElementById('suggestions');
  const scpCheckbox = document.getElementById('scpCheckbox');

  if (!inputText.trim()) {
    responseDiv.textContent = 'Please enter some text.';
    approvalDiv.innerHTML = ''; // Clear the approval div
    suggestionsDiv.innerHTML = ''; // Clear the suggestions div
    return;
  }

  responseDiv.textContent = 'Checking...';
  approvalDiv.innerHTML = ''; // Clear the approval div
  suggestionsDiv.innerHTML = ''; // Clear the suggestions div

  // Prepend the appropriate prefix based on the checkbox state
  const prefix = scpCheckbox.checked
    ? "Sanitize the text that follows with Full Censorship: "
    : "Sanitize the text that follows: ";
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

    // Clean the response text by removing ```json and ``` markers
    //let cleanedResponseText = response.text.replace(/```json|```/g, '').trim();

    console.log(response.text); // Log the cleaned response for debugging
    const result = JSON.parse(response.text); // Parse the cleaned JSON

    if (result.is_safe) {
      // Show "not woke" message and image
      approvalDiv.innerHTML = `
        <img src="assets/yes.png" alt="Safe" style="width: 50px; height: 50px;">
        <p>Congratulations, your text is officially not woke!</p>
      `;
      responseDiv.innerHTML = `
        <img src="assets/1984.gif" alt="1984" style="height: 200px;">
        <img src="assets/bb.png" alt="big brother is watching" style="height: 200px;">
      `; // Show the 1984 gif
      suggestionsDiv.innerHTML = ''; // Clear the suggestions div
    } else {
      // Show "too woke" message and image
      approvalDiv.innerHTML = `
        <img src="assets/no.png" alt="Not Safe" style="width: 50px; height: 50px;">
        <p>Unfortunately your input is too woke, here are some suggestions to make it more patriotic:</p>
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
  }

  await main();
});