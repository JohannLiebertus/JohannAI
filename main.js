const API_URL = "https://johannai.onrender.com";

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatDisplay = document.getElementById("chat-display");
const clearBtn = document.getElementById("clear-btn");
const themeCheckbox = document.getElementById("theme-checkbox");

let currentMode = "johann";
let chatHistory = []; // ← Neues Gedächtnis


const modeButtons = document.querySelectorAll(".mode-btn");
modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode;

    // Visuals
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});


sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (!text) return;

  // Zeige Nutzernachricht
  const userMsg = document.createElement("div");
  userMsg.className = "chat-msg user";
  userMsg.textContent = text;
  chatDisplay.appendChild(userMsg);

  // Gedächtnis erweitern
  chatHistory.push({ role: "user", content: text });

  userInput.value = "";

  fetch("http://127.0.0.1:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      history: chatHistory,
      mode: currentMode,
    }),
  })
    .then(res => res.json())
    .then(data => {
      const responseText = data.response || data.error || "Keine Antwort vom Bot.";

      // Zeige Bot-Nachricht
      const botMsg = document.createElement("div");
      botMsg.className = "chat-msg bot";
      botMsg.textContent = responseText;
      chatDisplay.appendChild(botMsg);

      // Gedächtnis erweitern
      chatHistory.push({ role: "bot", content: responseText });

      chatDisplay.scrollTop = chatDisplay.scrollHeight;
    })
    .catch(err => {
      alert("Fehler: " + err);
    });
});


// Clear Button Funktion
clearBtn.addEventListener("click", () => {
  chatDisplay.innerHTML = "";
  chatHistory = []; // ← Gedächtnis leeren
});


// Dark / Light Mode Toggle
themeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeCheckbox.checked);
});
