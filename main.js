document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://johannai.onrender.com";

  const sendBtn = document.getElementById("send-btn");
  const userInput = document.getElementById("user-input");
  const imageInput = document.getElementById("image-input");
  const chatDisplay = document.getElementById("chat-display");
  const clearBtn = document.getElementById("clear-btn");
  const themeCheckbox = document.getElementById("theme-checkbox");
  const themeIcon = document.getElementById("theme-icon");
  const overlay = document.getElementById("overlay");
  const passwordInput = document.getElementById("evilPassword");
  const passwordMsg = document.getElementById("passwordMsg");
  const closePopupBtn = document.getElementById("closePopup");
  const submitBtn = document.getElementById("submitPassword");
  const sidebar = document.getElementById("modeSidebar");
  const modeToggleBtn = document.getElementById("modeToggleBtn");
  const closeSidebarBtn = document.getElementById("closeSidebar");
  const sidebarContent = sidebar.querySelector(".mode-sidebar-content");
  const originalModeContainer = document.querySelector(".mode-switch");

  let currentMode = "johann";
  let chatHistory = [];
  const modeUnlocked = { evil: false };
  let evilBtn;

  const modeAvatars = {
    johann: "johann.png",
    rizz: "rizz.png",
    classic: "gpt.png",
    coding: "code.png",
    mental: "doc.png",
    human: "human.png",
    evil: "evil.png",
  };

  const modePrompts = {
    johann: `Du bist Johann Liebert – ein hochintelligenter, charismatischer ... (deine kompletten Prompts wie gehabt)`,
    rizz: `Du bist Rizz AI – ein charmanter, selbstbewusster ...`,
    classic: `Du heißt GPT. Du bist ein sachlicher, neutraler ...`,
    evil: `Du heißt Smyle, du antwortest kurz und knapp ...`,
    mental: `Du heißt Doc. Liebert. Du bist ein ruhiger, verständnisvoller ...`,
    coding: `Du heißt Johann.py. Du bist ein reiner Code-Generator ...`,
    human: `Du heißt Izet. Du bist ein menschenähnlicher Charakter ...`,
  };

  console.log("Script main.js loaded");

  function bindModeButtons() {
    const allButtons = document.querySelectorAll(".mode-btn");
    allButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;

        if (mode === "evil" && evilBtn.classList.contains("locked")) {
          showPasswordPrompt();
          return;
        }

        currentMode = mode;
        allButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        chatDisplay.innerHTML = "";
        const prompt = modePrompts[currentMode];
        chatHistory = prompt ? [{ role: "system", content: prompt }] : [];
      });
    });

    evilBtn = document.querySelector(".mode-btn.evil");
    evilBtn.addEventListener("click", () => {
      if (evilBtn.classList.contains("locked")) {
        showPasswordPrompt();
      } else {
        if (evilBtn.classList.contains("active")) {
          evilBtn.classList.remove("active");
          evilUnlocked = false;
          sessionStorage.removeItem("evilModeUnlocked");
          lockEvilMode();
          setActiveMode("johann");
          alert("Evil Mode deaktiviert!");
        } else {
          evilBtn.classList.add("active");
          evilUnlocked = true;
          setActiveMode("evil");
          alert("Evil Mode aktiviert!");
        }
      }
    });
  }

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
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
    const text = userInput.value.trim();
    const imageFile = imageInput.files[0];

    if (!text && !imageFile) {
      alert("Bitte gib eine Nachricht ein.");
      return;
    }

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

    const historyToSend =
      currentMode === "evil"
        ? [systemPrompt, userMsg]
        : [systemPrompt, ...chatHistory.filter((msg) => msg.role !== "system"), userMsg];

    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("text", text);
      formData.append("mode", currentMode);
      formData.append("history", JSON.stringify(historyToSend));

      fetch(`${API_URL}/chat-image`, { method: "POST", body: formData })
        .then(handleResponse)
        .catch((err) => addMessage("error", "Fehler: " + err.message));
    } else {
      fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: historyToSend,
          mode: currentMode,
          message: text,
        }),
      })
        .then(handleResponse)
        .catch((err) => addMessage("error", "Fehler: " + err.message));
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

  function setActiveMode(modeName) {
    const modeButtons = document.querySelectorAll(".mode-btn");
    modeButtons.forEach((btn) => {
      if (btn.dataset.mode === modeName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  function checkUnlockStatus() {
    if (sessionStorage.getItem("evilModeUnlocked") === "true") {
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
      setActiveMode("johann");
    }
  }

  function checkPassword() {
    const entered = passwordInput.value.trim();
    if (entered === "vape") {
      passwordMsg.textContent = "Successful!";
      passwordMsg.className = "password-msg success";
      sessionStorage.setItem("evilModeUnlocked", "true");

      setTimeout(() => {
        closePasswordPrompt();
        unlockEvilMode();
        evilBtn.classList.add("active");
        setActiveMode("evil");
        modeUnlocked.evil = true;
        alert("Evil Mode aktiviert!");
      }, 800);
    } else {
      passwordMsg.textContent = "Wrong password!";
      passwordMsg.className = "password-msg error";
    }
  }

  // Sidebar füllen und Buttons binden
  sidebarContent.innerHTML = originalModeContainer.innerHTML;
  bindModeButtons();

  // Sidebar öffnen/schließen
  modeToggleBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
  });

  closeSidebarBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });

  // Submit Button Eventlistener mit preventDefault (fix für Passwort Popup)
  submitBtn.addEventListener("click", (event) => {
    event.preventDefault();
    checkPassword();
  });

  // Passwort Input: Enter-Taste auch abfangen
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      checkPassword();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closePasswordPrompt();
    }
  });

  closePopupBtn.addEventListener("click", closePasswordPrompt);

  checkUnlockStatus();
});
