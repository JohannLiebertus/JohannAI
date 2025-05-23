const API_URL = "https://johannai.onrender.com";

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatDisplay = document.getElementById("chat-display");
const clearBtn = document.getElementById("clear-btn");
const themeCheckbox = document.getElementById("theme-checkbox");

let currentMode = "johann";
let chatHistory = []; // Gedächtnis

// Modus-Buttons
const modeButtons = document.querySelectorAll(".mode-btn");
modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode;
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Nachricht senden
sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (!text) return;

  // Nutzer-Nachricht anzeigen
  const userMsg = document.createElement("div");
  userMsg.className = "chat-msg user";
  userMsg.textContent = text;
  chatDisplay.appendChild(userMsg);

  chatHistory.push({ role: "user", content: text });
  userInput.value = "";

  // API-Aufruf an die richtige Route
  fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      history: chatHistory,
      mode: currentMode,
    }),
  })
    .then(res => {
      if (!res.ok) throw new Error(`Serverfehler: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const responseText = data.response || data.error || "Keine Antwort vom Bot.";

      const botMsg = document.createElement("div");
      botMsg.className = "chat-msg bot";
      botMsg.textContent = responseText;
      chatDisplay.appendChild(botMsg);

      chatHistory.push({ role: "bot", content: responseText });

      chatDisplay.scrollTop = chatDisplay.scrollHeight;
    })
    .catch(err => {
      const errorMsg = document.createElement("div");
      errorMsg.className = "chat-msg error";
      errorMsg.textContent = "Fehler: " + err.message;
      chatDisplay.appendChild(errorMsg);
    });
});

// Chatverlauf löschen
clearBtn.addEventListener("click", () => {
  chatDisplay.innerHTML = "";
  chatHistory = [];
});

// Dark Mode umschalten
themeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeCheckbox.checked);
});
