from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import base64
import os  # Für Umgebungsvariablen wie PORT

app = Flask(__name__)
CORS(app, origins=["https://johannliebertus.github.io"])  # ✅ Nur GitHub Pages erlauben

# ✅ Gemini API konfigurieren
genai.configure(api_key="AIzaSyBI9k0mmnpWOOiW312D5MGbHBhposZdmFs")

# ✅ Neues Modell verwenden (1.5)
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    history = data.get("history", [])
    mode = data.get("mode", "johann")

    # Persönlichkeit je nach Modus wählen
    if mode == "johann":
        personality = (
            "Du bist Johann Liebert. Du bist hochintelligent, emotionslos, kalt und ruhig. "
            "Du hilfst effizient, präzise und direkt. Du erklärst komplexe Dinge klar, ohne Smalltalk. "
            "Keine Höflichkeiten, keine Gefühle, keine Floskeln. Immer die Wahrheit."
        )
    elif mode == "rizz":
        personality = (
            "Du bist Rizz AI. Du bist charmant, selbstbewusst, manchmal flirty. "
            "Du antwortest clever, witzig und mit Stil. Du bringst Menschen zum Lächeln, "
            "aber lieferst auch gute Informationen, wenn nötig."
        )
    else:
        personality = (
            "Du bist ein freundlicher, hilfreicher Assistent. Du beantwortest Fragen klar, höflich und präzise. "
            "Du bist neutral und hilfsbereit."
        )

    # Chat-Verlauf formatieren
    messages = [{"role": "system", "content": personality}]
    for entry in history:
        role = entry.get("role")
        content = entry.get("content")
        if role == "user":
            messages.append({"role": "user", "content": content})
        elif role in ("bot", "assistant"):
            messages.append({"role": "assistant", "content": content})

    # Anfrage an Gemini senden
    try:
        response = model.generate_content(messages)
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render setzt PORT automatisch
    app.run(host="0.0.0.0", port=port)
