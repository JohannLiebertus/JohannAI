const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatDisplay = document.getElementById("chat-display");
const clearBtn = document.getElementById("clear-btn");
const themeCheckbox = document.getElementById("theme-checkbox");

sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (!text) return;

  const userMsg = document.createElement("div");
  userMsg.className = "chat-msg user";
  userMsg.textContent = text;
  chatDisplay.appendChild(userMsg);

  userInput.value = "";

  fetch("http://127.0.0.1:5000/chat", {
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

clearBtn.addEventListener("click", () => {
  chatDisplay.innerHTML = "";
});

themeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeCheckbox.checked);
});
