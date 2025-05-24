const API_URL = "https://johannai.onrender.com"; // ✅ korrekt

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatDisplay = document.getElementById("chat-display");
const clearBtn = document.getElementById("clear-btn");
const themeCheckbox = document.getElementById("theme-checkbox");
const modeButtons = document.querySelectorAll(".mode-btn");
const themeIcon = document.getElementById("theme-icon");

let currentMode = "johann";
let chatHistory = [];

// Mode Buttons
modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode;
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Send Message on Button Click or Enter
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = userInput.value.trim();
  const imageInput = document.getElementById("image-input");
  const imageFile = imageInput.files[0];

  if (!text && !imageFile) return;

  addMessage("user", text || "[Bild hochgeladen]");
  userInput.value = "";
  imageInput.value = ""; // Reset File Input

  // Mit Bild: POST an /chat-image
  if (imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("text", text);
    formData.append("mode", currentMode);

    fetch(`${API_URL}/chat-image`, {
      method: "POST",
      body: formData
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (!res.ok) throw new Error(`Fehler ${res.status}`);
        if (contentType.includes("application/json")) {
          const data = await res.json();
          addMessage("bot", data.response || "Keine Antwort vom Bot.");
        } else {
          throw new Error("Unerwartete Antwort vom Server.");
        }
      })
      .catch(err => {
        addMessage("error", "Fehler: " + err.message);
      });

  } else {
    // Nur Text
    fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: chatHistory,
        mode: currentMode,
        message: text
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

// Clear Button
clearBtn.addEventListener("click", () => {
  chatDisplay.innerHTML = "";
  chatHistory = [];
});

// Theme Toggle & Icon wechseln
function updateThemeIcon() {
  if (themeCheckbox.checked) {
    // Dark Mode an → Sonne anzeigen
    themeIcon.textContent = '🌞';
  } else {
    // Light Mode an → Mond anzeigen
    themeIcon.textContent = '🌙';
  }
}

themeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeCheckbox.checked);
  updateThemeIcon();
});

// Icon initial setzen
updateThemeIcon();
