from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import base64
import os
import json
import traceback
from typing import List, Dict, Any

# -------------------------------------------------------
# START: APP-INSTANZIIERUNG
# -------------------------------------------------------
app = Flask(__name__)

# ✅ KORREKTUR: CORS-Link auf die korrekte GitHub-Pages-URL gesetzt.
CORS(app, resources={r"/*": {"origins": "https://johannliebertus.github.io/JohannAI"}}, supports_credentials=True)

# -------------------------------------------------------
# KONFIGURATION & API-SCHLÜSSEL
# -------------------------------------------------------
# 🔑 KORREKTUR: Schlüssel wird aus der Render-Umgebungsvariable ausgelesen.
API_KEY = os.getenv("GEMINI_API_KEY") 
API_KEY_CONFIGURED = False

try:
    if not API_KEY:
        # Dies wird ausgelöst, wenn der Key in Render nicht gefunden wird.
        raise ValueError("GEMINI_API_KEY nicht in Umgebungsvariablen gefunden.")
        
    # Konfiguration mit dem ausgelesenen Schlüssel
    genai.configure(api_key=API_KEY)
    API_KEY_CONFIGURED = True
    print("✅ Gemini Modell erfolgreich konfiguriert.")
except Exception as e:
    print(f"❌ FEHLER bei der Konfiguration des Gemini-Modells: {e}")
    API_KEY_CONFIGURED = False


# -------------------------------------------------------
# Persönlichkeits-Prompts (Hier gekürzt aus Platzgründen, muss vollständig sein)
# -------------------------------------------------------
def get_personality(mode: str) -> str:
    # Stellen Sie sicher, dass hier alle Ihre Prompts stehen
    if mode == "johann":
        return """Du bist Johann Liebert – ein hochintelligenter, charismatischer und manipulativer Charakter... (vollständiger Prompt)"""
    # ... (Rest der Prompts) ...
    else:
        return "Unbekannter Modus. Bitte wählen Sie einen unterstützten Modus."


# -------------------------------------------------------
# Hilfsfunktion zur Formatierung der Historie
# -------------------------------------------------------
def format_history_for_gemini(history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if len(history) < 2:
        return []
    conversation_history = history[1:-1]
    messages = []
    for h in conversation_history:
        role = "user" if h.get("role") == "user" else "model"
        content = h.get("content", "")
        messages.append({"role": role, "parts": [{"text": content}]})
    return messages


# -------------------------------------------------------
# Chat-Endpoint (Text-Anfragen)
# -------------------------------------------------------
@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return '', 204
    
    if not API_KEY_CONFIGURED:
        return jsonify({"error": "Der KI-Dienst ist nicht konfiguriert (API-Schlüssel ungültig)."}), 503
        
    try:
        data = request.get_json(force=True)
        history = data.get("history", [])
        mode = data.get("mode", "johann")
        user_msg = data.get("message", "")

        if not user_msg.strip():
            return jsonify({"error": "Leere Nachricht"}), 400

        # 1. System-Prompt als Konfiguration
        personality_prompt = get_personality(mode)
        messages = format_history_for_gemini(history)
        messages.append({"role": "user", "parts": [{"text": user_msg}]})
        
        # 4. Modellanfrage mit system_instruction
        model_instance = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            config=genai.types.GenerateContentConfig(
                system_instruction=personality_prompt
            )
        )
        
        resp = model_instance.generate_content(messages)
        text = getattr(resp, "text", None)

        return jsonify({"response": text or "Keine Antwort vom Modell erhalten."})
        
    except Exception as e:
        # Fängt alle Fehler ab, einschließlich APIError, ohne speziellen Import
        print(f"❌ FEHLER IN /chat (Detail: {e}):\n", traceback.format_exc())
        
        # API-Probleme senden Status 500
        return jsonify({"error": "Ein API- oder Serverfehler ist aufgetreten. Bitte prüfen Sie den API-Schlüssel."}), 500


# -------------------------------------------------------
# Chat mit Bild (Multimodal-Anfragen)
# -------------------------------------------------------
@app.route("/chat-image", methods=["POST", "OPTIONS"])
def chat_image():
    if request.method == "OPTIONS":
        return '', 204
        
    if not API_KEY_CONFIGURED:
        return jsonify({"error": "Der KI-Dienst ist nicht konfiguriert (API-Schlüssel ungültig)."}), 503

    try:
        # ... (Logik zur Bildverarbeitung wie in Version 11) ...
        img_file = request.files.get("image")
        text = request.form.get("text", "")
        mode = request.form.get("mode", "johann")
        history_str = request.form.get("history", "[]")
        
        if not img_file:
            return jsonify({"error": "Kein Bild empfangen"}), 400
            
        img_data = img_file.read()
        
        img_part = {
            "inline_data": {
                "data": base64.b64encode(img_data).decode("utf-8"),
                "mime_type": img_file.mimetype or "image/jpeg"
            }
        }
        
        try:
            history = json.loads(history_str)
        except Exception:
            history = [] 

        personality_prompt = get_personality(mode)
        messages = format_history_for_gemini(history)
            
        parts = [img_part]
        if text.strip():
            parts.append({"text": text})
            
        messages.append({"role": "user", "parts": parts})

        model_instance = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            config=genai.types.GenerateContentConfig(
                system_instruction=personality_prompt
            )
        )
        
        resp = model_instance.generate_content(messages)
        text_resp = getattr(resp, "text", None)

        return jsonify({"response": text_resp or "Keine Antwort vom Modell erhalten."})
        
    except Exception as e:
        print(f"❌ FEHLER IN /chat-image (Detail: {e}):\n", traceback.format_exc())
        return jsonify({"error": "Ein interner Serverfehler bei der Bildverarbeitung ist aufgetreten."}), 500


# -------------------------------------------------------
# Server starten
# -------------------------------------------------------
if __name__ == "__main__":
    if not API_KEY_CONFIGURED:
        print("🚨 Server wird nicht gestartet, da der API-Schlüssel ungültig ist. 🚨")
    else:
        # ⚠️ WARNUNG: Dieser Code startet den Development-Server.
        # Im Render Start Command sollte 'python -m gunicorn server:app' verwendet werden.
        port = int(os.environ.get("PORT", 5000))
        print(f"🚀 Server läuft auf Port {port}")
        app.run(host="0.0.0.0", port=port)
