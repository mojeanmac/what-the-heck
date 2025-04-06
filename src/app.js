import { GoogleGenAI } from "@google/genai";

document.getElementById('checkButton').addEventListener('click', async () => {
  const inputText = document.getElementById('inputText').value;
  const responseDiv = document.getElementById('response');
  const approvalDiv = document.getElementById('approval');

  if (!inputText.trim()) {
    responseDiv.textContent = 'Please enter some text.';
    approvalDiv.innerHTML = ''; // Clear the approval div
    return;
  }

  responseDiv.textContent = 'Checking...';
  approvalDiv.innerHTML = ''; // Clear the approval div

  const ai = new GoogleGenAI({ apiKey: "AIzaSyCCaFFr1JcBnGpvQce-RztdoCUC3kLFufE" });

  async function main() {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: inputText,
    });

    // Simulate a JSON response structure
    console.log(response.text);
    const result = JSON.parse(response.text); // Assuming response.text contains JSON

    if (result.is_safe) {
      // Show "not woke" message and image
      approvalDiv.innerHTML = `
        <img src="assets/yes.png" alt="Safe" style="width: 75px; height: 75px;">
        <p>Congratulations, your text is officially not woke!</p>
      `;
    } else {
      // Show "too woke" message and image
      approvalDiv.innerHTML = `
        <img src="assets/no.png" alt="Not Safe" style="width: 75px; height: 75px;">
        <p>Unfortunately your input is too woke, here are some suggestions to make it more patriotic:</p>
      `;

      // Optionally, display suggestions if provided in the response
      if (result.suggestions && result.suggestions.length > 0) {
        const suggestionsList = document.createElement('ul');
        result.suggestions.forEach((suggestion) => {
          const listItem = document.createElement('li');
          listItem.textContent = suggestion;
          suggestionsList.appendChild(listItem);
        });
        approvalDiv.appendChild(suggestionsList);
      }
    }

    responseDiv.textContent = ''; // Clear the response text
  }

  await main();
});