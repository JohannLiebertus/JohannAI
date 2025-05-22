const API_URL = "https://johannai.onrender.com";

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatDisplay = document.getElementById("chat-display");
const clearBtn = document.getElementById("clear-btn");
const themeCheckbox = document.getElementById("theme-checkbox");

sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (!text) return;

  // User-Nachricht anzeigen
  const userMsg = document.createElement("div");
  userMsg.className = "chat-msg user";
  userMsg.textContent = text;
  chatDisplay.appendChild(userMsg);

  userInput.value = "";

  fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
    .then(res => res.json())
    .then(data => {
      const botMsg = document.createElement("div");
      botMsg.className = "chat-msg bot";
      botMsg.textContent = data.response || data.error || "Keine Antwort vom Bot.";
      chatDisplay.appendChild(botMsg);
      chatDisplay.scrollTop = chatDisplay.scrollHeight;
    })
    .catch(err => {
      alert("Fehler: " + err);
    });
});

// Clear Button Funktion
clearBtn.addEventListener("click", () => {
  chatDisplay.innerHTML = "";
});

// Dark / Light Mode Toggle
themeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeCheckbox.checked);
});
