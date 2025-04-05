import { GoogleGenAI } from "@google/genai";

document.getElementById('checkButton').addEventListener('click', async () => {
    const inputText = document.getElementById('inputText').value;
    const responseDiv = document.getElementById('response');
  
    if (!inputText.trim()) {
      responseDiv.textContent = 'Please enter some text.';
      return;
    }
  
    responseDiv.textContent = 'Checking...';
      const ai = new GoogleGenAI({ apiKey: "AIzaSyCCaFFr1JcBnGpvQce-RztdoCUC3kLFufE" });
      
      async function main() {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: inputText,
        });
        console.log(response.text);
        responseDiv.textContent = response.text;
      }
      
      await main();
  });