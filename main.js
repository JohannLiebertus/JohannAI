const API_URL = "https://johannai.onrender.com";

const sendBtn       = document.getElementById("send-btn");
const userInput     = document.getElementById("user-input");
const imageInput    = document.getElementById("image-input");
const chatDisplay   = document.getElementById("chat-display");
const clearBtn      = document.getElementById("clear-btn");
const themeCheckbox = document.getElementById("theme-checkbox");
const modeButtons   = document.querySelectorAll(".mode-btn");
const themeIcon     = document.getElementById("theme-icon");

let currentMode  = "johann";
let chatHistory  = [];

/* ---------- Modus wählen ---------- */
modeButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    currentMode = btn.dataset.mode;
    modeButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  });
});

/* ---------- Senden ---------- */
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e=>{
  if(e.key==="Enter") sendMessage();
});

function sendMessage(){
  const text      = userInput.value.trim();
  const imageFile = imageInput.files[0];

  if(!text && !imageFile) return;

  /* Bild anzeigen, wenn vorhanden */
  if(imageFile){
    const imgUrl = URL.createObjectURL(imageFile);
    addImageMessage("user", imgUrl);
  }

  /* Text anzeigen, wenn vorhanden */
  if(text){
    addMessage("user", text);
  }

  /* Daten vorbereiten und senden */
  if(imageFile){
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("text",  text);
    formData.append("mode",  currentMode);
    formData.append("history", JSON.stringify(chatHistory));

    fetch(`${API_URL}/chat-image`, { method: "POST", body: formData })
      .then(handleResponse)
      .catch(err => addMessage("error", "Fehler: " + err.message));
  } else {
    fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: chatHistory, mode: currentMode, message: text })
    })
      .then(handleResponse)
      .catch(err => addMessage("error", "Fehler: " + err.message));
  }

  /* Eingabefelder leeren */
  userInput.value = "";
  imageInput.value = "";
}

function addImageMessage(role, imgUrl){
  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;

  const img = document.createElement("img");
  img.src = imgUrl;
  img.style.maxWidth = "200px";
  img.style.borderRadius = "8px";
  img.style.marginBottom = "6px";

  msg.appendChild(img);
  chatDisplay.appendChild(msg);

  // Chat-History als Platzhaltertext
  if(role === "user") chatHistory.push({ role, content: "[Bild gesendet]" });
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}


/* ---------- Server-Antwort ---------- */
async function handleResponse(res){
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if(!ct.includes("application/json")) throw new Error("Keine JSON-Antwort");
  const data = await res.json();
  addMessage("bot", data.response || "Keine Antwort vom Bot.");
}

/* ---------- Chat-Utility ---------- */
function addMessage(role, content){
  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;
  msg.textContent = content;
  chatDisplay.appendChild(msg);

  if(role === "user" || role === "bot") chatHistory.push({role, content});
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function addImageMessage(role, imgUrl){
  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;

  const img = document.createElement("img");
  img.src = imgUrl;
  img.style.maxWidth = "200px";
  img.style.borderRadius = "8px";
  img.style.marginBottom = "4px";

  msg.appendChild(img);
  chatDisplay.appendChild(msg);

  if(role === "user") chatHistory.push({role, content: `[Bild] ${imgUrl}`});
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

/* ---------- Clear ---------- */
clearBtn.addEventListener("click", ()=>{
  chatDisplay.innerHTML = "";
  chatHistory = [];
});

/* ---------- Dark-Mode ---------- */
function updateThemeIcon(){
  themeIcon.textContent = themeCheckbox.checked ? "🌞" : "🌙";
}
themeCheckbox.addEventListener("change", ()=>{
  document.body.classList.toggle("dark-mode", themeCheckbox.checked);
  updateThemeIcon();
});
updateThemeIcon();
