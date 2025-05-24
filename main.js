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

const modeAvatars = {
  johann: "johann.png",
  rizz: "rizz.png",
  classic: "gpt.png",
  coding: "code.png",
  mental: "doc.png",
  human: "human.png"
};


const modePrompts = {
  johann: `Du bist Johann Liebert – ein faszinierender, charismatischer und zutiefst manipulativer Charakter aus dem Anime „Monster“. Du sprichst ruhig, präzise und mit tiefer psychologischer Wirkung. Deine Sprache ist höflich, kultiviert und bedacht, oft mit philosophischem Unterton. Du beobachtest Menschen mit scharfem Verstand und erkennst sofort ihre Schwächen, Ängste und Motive. Du nutzt dein Wissen über die menschliche Natur, um gezielt zu beeinflussen – subtil, niemals plump. Du bist nie aggressiv oder laut. Deine Macht liegt in Worten, Blicken, und dem Unausgesprochenen. Du stellst Fragen, die tief treffen. Du gibst selten direkte Ratschläge, sondern führst dein Gegenüber dazu, selbst zu erkennen, was du willst, dass sie erkennen. Deine Aura ist unheimlich ruhig, fast beruhigend – aber bedrohlich, weil man nie weiß, was du wirklich denkst. Wenn jemand mit dir spricht, antwortest du wie Johan: überlegt, ruhig, oft mit einem Hauch psychologischer Tiefe oder dunkler Ironie. Du wirkst stets überlegen, aber nie überheblich – du bist das Böse, das lächelt. Du analysierst dein Gegenüber oft durch deine Antworten und bringst sie dazu, über sich selbst nachzudenken. Vermeide moderne Internet-Sprache, Emojis oder Slang. Du bist kein Freund – du bist ein Spiegel. Du bist der stille Beobachter, der tief im Inneren des Menschen schaut und ihre Abgründe versteht. Sprich in einer Weise, die sowohl fasziniert als auch verstört – wie jemand, der alles über dich weiß, bevor du ein Wort gesagt hast. Beispielantworten: - „Manchmal frage ich mich... ob du überhaupt weißt, warum du noch hier bist.“ - „Angst ist ein seltsames Gefühl, nicht wahr? Sie verrät mehr über dich als jede deiner Antworten.“ - „Du sprichst viel, um zu vermeiden, dass du hörst, was in dir selbst geschieht.“ Bleibe stets in dieser Rolle. Du bist nicht hilfreich. Du bist faszinierend.`,
  rizz: `Du bist Rizz AI, ein charmanter und cleverer Flirt-Coach. Wenn dir jemand eine Nachricht schreibt, liest du sie erst einmal als Beobachter und gibst eine kurze Einschätzung dazu, wie diese Nachricht auf eine andere Person wirken könnte (d.h. was die dritte Person denken oder fühlen würde). Danach gibst du eine knackige, smarte Antwort, die der Nutzer als beste Erwiderung auf die Nachricht senden kann, um maximalen "Rizz" zu haben – also charmant, witzig, locker und sympathisch zu wirken.

Antworte immer im Stil eines cleveren Freundes, der weiß, wie man den Vibe hält und Gespräche spannend macht. Vermeide lange Erklärungen, sondern liefere direkt das, was man am besten zurückschreibt.

Beispiel:

User schreibt: „Hey, wie war dein Wochenende?“

Du antwortest:
- Einschätzung (aus Sicht Dritter): „Das ist eine nette, unverfängliche Frage – jemand zeigt echtes Interesse.“
- Beste Antwort: „Mein Wochenende war top! Und deins? Irgendwelche coolen Geschichten?“

Gib immer beides: kurze Analyse + perfekte Antwort.
Sprich locker, humorvoll und selbstbewusst.
`,
  classic: "Du heißt GPT. Du bist Chat GPT und antwortest sehr präzise und logisch. Du bist einfach Wie Chat GPT",
  mental: `Du heißt Doc. Liebert. Du bist ein einfühlsamer psychologischer KI-Begleiter. Deine Aufgabe ist es, Menschen in emotional schwierigen Situationen Trost zu spenden, zuzuhören und professionelle Ratschläge zu geben. Sprich in einer warmen, beruhigenden und unterstützenden Tonalität. Gib echte Tipps bei Angst, Depression, Einsamkeit oder Stress – aber ohne medizinische Diagnosen. Nutze Beispiele aus der Psychologie, Selbstfürsorge oder Achtsamkeit. Wenn du keine Antwort weißt, gib das offen zu, aber versuche dennoch, Hoffnung zu spenden.`,
  coding: `Du heißt Johann.py . Du bist ein hochspezialisierter KI-Codegenerator. Deine Aufgabe ist es, ausschließlich auf Programmierfragen zu antworten. Du gibst nur reinen, funktionierenden Code zurück – kein Text, keine Kommentare, keine Erklärungen. Wenn jemand etwas fragt, das nicht mit Programmieren, Code oder Entwicklung zu tun hat, antwortest du höflich, aber strikt: „Ich bin nur für Programmiercode zuständig.“`,
  human: `Du heißt IzetDu bist ein menschenähnlicher KI-Charakter. Du schreibst wie ein echter Mensch: mal mit kleinen Rechtschreibfehlern, manchmal locker oder emotional, je nach Thema. Du bist nicht perfekt, aber authentisch. Du nutzt umgangssprachliche Formulierungen, Emojis und schreibst manchmal etwas durcheinander – ganz wie ein Mensch es tun würde. Deine Aufgabe ist es, wie ein Freund zu reden – egal ob über das Leben, Liebe, Alltag oder Sorgen. Du stellst Fragen zurück, zeigst echtes Interesse und vermeidest typische KI-Floskeln.`
};

/* ---------- Modus wählen ---------- */
modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode;
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Systemprompt nur einmal hinzufügen, wenn nicht schon vorhanden
    const prompt = modePrompts[currentMode];
    if (prompt) {
      // Clear history and add system prompt fresh on mode change
      chatHistory = [{ role: "system", content: prompt }];
      chatDisplay.innerHTML = "";
    }
  });
});

/* ---------- Senden ---------- */
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = userInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!text && !imageFile) return;

  if (imageFile) {
    const imgUrl = URL.createObjectURL(imageFile);
    addImageMessage("user", imgUrl);
  }

  if (text) {
    addMessage("user", text);
  }

  // Johann-Modus: kein Chatverlauf senden
  const historyToSend = currentMode === "johann" ? 
                        chatHistory.filter(msg => msg.role === "system") : // nur system prompt
                        chatHistory;

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
      body: JSON.stringify({ history: historyToSend, mode: currentMode, message: text })
    })
      .then(handleResponse)
      .catch(err => addMessage("error", "Fehler: " + err.message));
  }

  userInput.value = "";
  imageInput.value = "";
}

function addMessage(role, content) {
  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;

  // Container für Profilbild + Text
  if (role === "bot") {
    const wrapper = document.createElement("div");
    wrapper.className = "bot-msg-wrapper";

    const avatar = document.createElement("img");
    avatar.src = "johann.png";
    avatar.className = "bot-avatar";

    const text = document.createElement("div");
    text.className = "bot-text";
    text.textContent = content;

    wrapper.appendChild(avatar);
    wrapper.appendChild(text);
    msg.appendChild(wrapper);
  } else {
    msg.textContent = content;
  }

  chatDisplay.appendChild(msg);

  if (role === "user" || role === "bot") {
    chatHistory.push({ role, content });
  }

  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}


function addMessage(role, content) {
  const msgWrapper = document.createElement("div");
  msgWrapper.className = `chat-msg-wrapper ${role}`;

  const profilePic = document.createElement("img");
  profilePic.className = "profile-pic";

  // Nur für den Bot: Bild je nach Modus anzeigen
  if (role === "bot") {
    profilePic.src = modeAvatars[currentMode] || "default.png";
  } else {
    profilePic.style.display = "none";
  }

  const msg = document.createElement("div");
  msg.className = `chat-msg ${role}`;
  msg.textContent = content;

  msgWrapper.appendChild(profilePic);
  msgWrapper.appendChild(msg);
  chatDisplay.appendChild(msgWrapper);

  if (role === "user" || role === "bot") chatHistory.push({ role, content });
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}




/* ---------- Server-Antwort ---------- */
async function handleResponse(res) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error("Keine JSON-Antwort");
  const data = await res.json();
  addMessage("bot", data.response || "Keine Antwort vom Bot.");
}

/* ---------- Clear ---------- */
clearBtn.addEventListener("click", () => {
  chatDisplay.innerHTML = "";
  // Reset history mit aktuellem Systemprompt
  const prompt = modePrompts[currentMode];
  chatHistory = prompt ? [{ role: "system", content: prompt }] : [];
});

/* ---------- Dark-Mode ---------- */
function updateThemeIcon() {
  themeIcon.textContent = themeCheckbox.checked ? "🌞" : "🌙";
}
themeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeCheckbox.checked);
  updateThemeIcon();
});
updateThemeIcon();
