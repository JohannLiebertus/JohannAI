const API_URL = "https://johannai.onrender.com";

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatDisplay = document.getElementById("chat-display");
const clearBtn = document.getElementById("clear-btn");
const themeCheckbox = document.getElementById("theme-checkbox");
const modeButtons = document.querySelectorAll(".mode-btn");

let currentMode = "johann";
let chatHistory = [];

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode;
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  userInput.value = "";

  fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      history: chatHistory,
      mode: currentMode
    }),
  })
    .then(res => {
      if (!res.ok) throw new Error(`Serverfehler: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const reply = data.response || "Keine Antwort vom Bot.";
      addMessage("bot", reply);
    })
    .catch(err => {
      addMessage("error", "Fehler: " + err.message);
    });
}

function addMessage(role, content) {
  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;
  msg.textContent = content;
  chatDisplay.appendChild(msg);

  if (role === "user" || role === "bot") {
    chatHistory.push({ role, content });
  }

  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

clearBtn.addEventListener("click", () => {
  chatDisplay.innerHTML = "";
  chatHistory = [];
});

themeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeCheckbox.checked);
});
