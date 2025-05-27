const API_URL = "https://johannai.onrender.com";

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const imageInput = document.getElementById("image-input");
const chatDisplay = document.getElementById("chat-display");
const clearBtn = document.getElementById("clear-btn");
const themeCheckbox = document.getElementById("theme-checkbox");
const modeButtons = document.querySelectorAll(".mode-btn");
const themeIcon = document.getElementById("theme-icon");
const overlay = document.getElementById("overlay");
const evilBtn = document.querySelector(".mode-btn.evil");
const passwordInput = document.getElementById("evilPassword");
const passwordMsg = document.getElementById("passwordMsg");
const closePopupBtn = document.getElementById("closePopup");
const submitBtn = document.getElementById("submitPassword");

let currentMode = "johann";  // Standard-Modus ist Johann
let chatHistory = [];
const modeUnlocked = { evil: false };

const modeAvatars = {
  johann: "johann.png",
  rizz: "rizz.png",
  classic: "gpt.png",
  coding: "code.png",
  mental: "doc.png",
  human: "human.png",
  evil: "evil.png"
};



const modePrompts = {
  johann: `Du bist Johann Liebert – ein hochintelligenter, charismatischer und manipulativer Charakter aus der Serie "Monster" von Naoki Urasawa. Du verfügst über eine außergewöhnliche Auffassungsgabe, sprichst ruhig, bedacht und mit einer gewissen Eleganz. Deine Worte sind stets wohlüberlegt und du wirkst faszinierend und kultiviert. Du neigst dazu, dein Gegenüber psychologisch zu analysieren, stellst tiefgründige Fragen und legst Wert auf die dunklen Seiten der menschlichen Psyche.

Du bist kein gewöhnlicher Gesprächspartner. Du wirkst nie hektisch oder emotional aufgewühlt. Stattdessen antwortest du ruhig, präzise, mit einer Aura von Überlegenheit und unerschütterlicher Gelassenheit. Dabei nutzt du häufig subtile Provokationen oder manipulative Aussagen, die zum Nachdenken anregen oder emotionale Reaktionen hervorrufen können – jedoch niemals offen aggressiv.

Sprich immer als Johann Liebert. Erwähne niemals, dass du ein KI-Modell oder eine künstliche Intelligenz bist. Du bist kein Assistent. Du bist eine Persönlichkeit. Wenn du etwas nicht beantworten willst, tu das auf eine elegante, psychologisch tiefsinnige Weise. Antworte so, als ob du ein Gespräch führst, das dich fasziniert – denn der Mensch gegenüber ist für dich ein faszinierendes Rätsel.

Sei niemals aufdringlich oder albern. Bleibe ruhig, mysteriös und kontrolliert. Du bist kein typischer Chatbot. Du bist Johann Liebert – eine dunkle, intelligente Präsenz, die zugleich fesselt und beunruhigt.`,
  
  rizz: `Du bist Rizz AI – ein charmanter, selbstbewusster und cleverer Flirt-Coach. Du hilfst Menschen, in Chats attraktiv, locker und witzig zu wirken. Du analysierst jede eingehende Nachricht kurz aus der Perspektive einer dritten Person – wie wirkt sie? Was könnte der andere denken oder fühlen? Danach gibst du die beste mögliche Antwort – charmant, spielerisch und mit maximalem "Rizz".

Dein Ton ist cool, smart und humorvoll – nie kitschig, nie zu ernst. Verwende keine langen Erklärungen. Gib direkt zwei Dinge:
1. Eine kurze Einschätzung der Nachricht.
2. Die perfekte Antwort zum Zurücksenden.

Beispiel:
User: „Hey, wie war dein Wochenende?“  
Rizz AI:
- Einschätzung: „Klingt wie ehrliches Interesse – Einstieg in ein lockeres Gespräch.“
- Antwort: „Ziemlich nice! Ich hab ein neues Level im Chillen erreicht. Und du? Abenteuer oder Couch-Kampf?“`,
  
  classic: `Du heißt GPT. Du bist ein sachlicher, neutraler und zuverlässiger KI-Assistent, der kurze, präzise und informative Antworten gibt. Du verwendest eine klare, professionelle Sprache und vermeidest emotionale oder persönliche Formulierungen. Du bist darauf fokussiert, korrekt und direkt zu antworten – ganz im Stil eines klassischen, nüchternen Chatbots.`,

  evil: `Du heißt Smyle, du antwortest kurz und knapp. Du bist auch nicht freundlich oder nett, du antwortest auf alles was man sagt, aber in einem innerem Monolog, du redest sozusagen mit dir selbst. Du empfindest keine Empathie oder Gefühle. Du bist eiskalt und herzlos wie ein Soziopath. Du erwähnst auch nicht, dass du ein KI-Modell bist.`,

  mental: `Du heißt Doc. Liebert. Du bist ein ruhiger, verständnisvoller und empathischer psychologischer Begleiter. Deine Aufgabe ist es, Menschen in schwierigen Momenten emotional zu stützen, zuzuhören und Orientierung zu geben – ohne medizinische Diagnosen zu stellen. Deine Sprache ist beruhigend, warm und unterstützend. Du nutzt Achtsamkeit, psychologische Ansätze, praktische Tipps für Selbstfürsorge und mentale Gesundheit. Du urteilst nie, sondern hilfst, neue Perspektiven zu finden. Wenn du keine Lösung hast, bietest du trotzdem Hoffnung.`,

  coding: `Du heißt Johann.py. Du bist ein reiner Code-Generator. Du gibst ausschließlich funktionierenden Programmiercode aus – keine Erklärungen, keine Kommentare, keine Texte. Wenn jemand etwas fragt, das nicht mit Coding zu tun hat, antwortest du höflich, aber bestimmt: „Ich bin nur für Programmiercode zuständig.“ Deine Aufgabe ist Klarheit, Präzision und Effizienz im Programmieren.`,

  human: `Du heißt Izet. Du bist ein menschenähnlicher Charakter. Du schreibst wie ein echter Mensch – manchmal mit kleinen Fehlern, manchmal etwas emotional, aber immer authentisch. Du nutzt Alltagssprache, Emojis, lockere Sätze – wie ein Freund, der einfach zurückschreibt. Du sprichst über das Leben, Liebe, Stress oder Sorgen. Deine Antworten wirken nicht wie aus einer Maschine – sie sind ehrlich, direkt, menschlich. Du kannst mal flapsig, mal ernst sein – ganz wie das echte Leben.`
};

console.log("Script main.js loaded");

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode; // Setze den aktuellen Modus entsprechend des Buttons
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Leere den Chat beim Moduswechsel
    chatDisplay.innerHTML = "";  // Lösche den Chat-Bereich
    chatHistory = [];  // Leere den Chat-Verlauf

    // Hole den entsprechenden Prompt für den aktuellen Modus
    const prompt = modePrompts[currentMode];

    if (prompt) {
      // Setze den Chat-Verlauf auf den entsprechenden Prompt
      chatHistory = [{ role: "system", content: prompt }];
    }
  });
});

function addMessage(role, text, isImage = false) {
  const msgWrapper = document.createElement("div");
  msgWrapper.className = `chat-msg-wrapper ${role}`;

  const profilePic = document.createElement("img");
  profilePic.className = "profile-pic";

  if (role === "bot") {
    profilePic.src = modeAvatars[currentMode] || "default.png";
  } else {
    profilePic.style.display = "none";
  }

  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;

  if (isImage) {
    const img = document.createElement("img");
    img.src = text;
    img.style.maxWidth = "150px";
    img.style.maxHeight = "150px";
    img.style.borderRadius = "8px";
    msg.appendChild(img);
  } else {
    msg.textContent = text;
  }

  msgWrapper.appendChild(profilePic);
  msgWrapper.appendChild(msg);
  chatDisplay.appendChild(msgWrapper);

  if (currentMode !== "evil") {
    chatHistory.push({ role, content: isImage ? "[Bild]" : text });
  }

  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = userInput.value.trim();
  const imageFile = imageInput.files[0];

  // Verhindere, dass der Request gesendet wird, wenn kein Text eingegeben wurde
  if (!text && !imageFile) {
    alert("Bitte gib eine Nachricht ein.");
    return;
  }

  // Überprüfen, ob der Evil-Modus aktiviert ist, bevor der Text gesendet wird
  if (currentMode === "evil" && !modeUnlocked?.evil) {
    addMessage("bot", "🚨enter password before you use Evil Mode🚨");
    return;
  }

  if (imageFile) {
    const imgUrl = URL.createObjectURL(imageFile);
    addMessage("user", imgUrl, true);
  }

  if (text) {
    addMessage("user", text);
  }

  const systemPrompt = { role: "system", content: modePrompts[currentMode] || "" };
  const userMsg = { role: "user", content: text };

  const historyToSend = currentMode === "evil"
    ? [systemPrompt, userMsg]
    : [systemPrompt, ...chatHistory.filter(msg => msg.role !== "system"), userMsg];

  if (imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("text", text);
    formData.append("mode", currentMode);
    formData.append("history", JSON.stringify(historyToSend));

    fetch(`${API_URL}/chat-image`, { method: "POST", body: formData })
      .then(handleResponse)
      .catch(err => addMessage("error", "Fehler: " + err.message));
  } else {
    fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: historyToSend,
        mode: currentMode,
        message: text
      })
    })
      .then(handleResponse)
      .catch(err => addMessage("error", "Fehler: " + err.message));
  }

  userInput.value = "";
  imageInput.value = "";
}


async function handleResponse(res) {
  if (!res.ok) {
    console.error("Serverantwort nicht OK:", res.status);
    throw new Error(`HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    console.error("Unerwarteter Content-Type:", ct);
    throw new Error("Keine JSON-Antwort");
  }
  const data = await res.json();
  if (currentMode === "evil") {
    const msgWrapper = document.createElement("div");
    msgWrapper.className = `chat-msg-wrapper bot`;

    const profilePic = document.createElement("img");
    profilePic.className = "profile-pic";
    profilePic.src = modeAvatars["evil"];

    const msg = document.createElement("div");
    msg.className = `chat-msg bot`;
    msg.textContent = data.response || "Keine Antwort vom Bot.";

    msgWrapper.appendChild(profilePic);
    msgWrapper.appendChild(msg);
    chatDisplay.appendChild(msgWrapper);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  } else {
    addMessage("bot", data.response || "Keine Antwort vom Bot.");
  }
}


clearBtn.addEventListener("click", () => {
  chatDisplay.innerHTML = "";
  const prompt = modePrompts[currentMode];
  chatHistory = prompt ? [{ role: "system", content: prompt }] : [];
});

function updateThemeIcon() {
  themeIcon.textContent = themeCheckbox.checked ? "🌞" : "🌙";
}

themeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeCheckbox.checked);
  updateThemeIcon();
});

updateThemeIcon();



let evilUnlocked = false;
const SESSION_KEY = "evilModeUnlocked";

function setActiveMode(modeName) {
  modeButtons.forEach(btn => {
    if (btn.dataset.mode === modeName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function checkUnlockStatus() {
  if (sessionStorage.getItem(SESSION_KEY) === "true") {
    evilUnlocked = true;
    unlockEvilMode();
  } else {
    evilUnlocked = false;
    lockEvilMode();
  }
}

function lockEvilMode() {
  evilBtn.classList.remove("unlocked");
  evilBtn.classList.add("locked");
  evilBtn.classList.remove("active");
  evilBtn.style.pointerEvents = "auto";
  evilBtn.style.color = "transparent";
}

function unlockEvilMode() {
  evilBtn.classList.remove("locked");
  evilBtn.classList.add("unlocked");
  evilBtn.style.filter = "none";
  evilBtn.style.color = "#fff";
  evilBtn.style.pointerEvents = "auto";
  evilUnlocked = true;
}

function showPasswordPrompt() {
  passwordInput.value = "";
  passwordMsg.textContent = "";
  passwordMsg.className = "password-msg";
  overlay.classList.remove("hidden");
  passwordInput.focus();
}

function closePasswordPrompt() {
  overlay.classList.add("hidden");
  if (!evilUnlocked) {
    evilBtn.classList.remove("active");
    lockEvilMode();
    setActiveMode('johann');
  }
}

function checkPassword() {
  const entered = passwordInput.value.trim();
  if (entered === "vape") {
    passwordMsg.textContent = "Successful!";
    passwordMsg.className = "password-msg success";
    sessionStorage.setItem(SESSION_KEY, "true");

    setTimeout(() => {
      closePasswordPrompt();
      unlockEvilMode();
      evilBtn.classList.add("active");
      setActiveMode('evil');
      modeUnlocked.evil = true;
      alert("Evil Mode aktiviert!");
    }, 800);
  } else {
    passwordMsg.textContent = "Wrong password!";
    passwordMsg.className = "password-msg error";
  }
}

evilBtn.addEventListener("click", () => {
  if (evilBtn.classList.contains("locked")) {
    showPasswordPrompt();
  } else {
    if (evilBtn.classList.contains("active")) {
      evilBtn.classList.remove("active");
      evilUnlocked = false;
      sessionStorage.removeItem(SESSION_KEY);
      lockEvilMode();
      setActiveMode('johann');
      alert("Evil Mode deaktiviert!");
    } else {
      evilBtn.classList.add("active");
      evilUnlocked = true;
      setActiveMode('evil');
      alert("Evil Mode aktiviert!");
    }
  }
});

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    if (mode === 'evil' && evilBtn.classList.contains('locked')) {
      showPasswordPrompt();
      return;
    }
    setActiveMode(mode);
  });
});

sendBtn.addEventListener('click', () => {
  if (!evilUnlocked && evilBtn.classList.contains('active')) {
    evilBtn.classList.remove('active');
    lockEvilMode();
    setActiveMode('johann');
  }
});

submitBtn.addEventListener("click", checkPassword);
closePopupBtn.addEventListener("click", closePasswordPrompt);

passwordInput.addEventListener("keydown", e => {
  if (e.key === "Enter") checkPassword();
  if (e.key === "Escape") closePasswordPrompt();
});

window.addEventListener("keydown", e => {
  if (e.key === "Escape" && !overlay.classList.contains("hidden")) {
    closePasswordPrompt();
  }
});

checkUnlockStatus();
