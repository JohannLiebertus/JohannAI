from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import traceback

app = Flask(__name__)
CORS(app, origins=["https://johannliebertus.github.io"])

# Gemini konfigurieren mit deinem API-Key
genai.configure(api_key="AIzaSyDxchMdZQeSDSIqkSi8M3_aiwZL4neahMk")
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        history = data.get("history", [])
        mode = data.get("mode", "johann")

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

        messages = [{"role": "system", "content": personality}]
        for entry in history:
            if entry["role"] == "user":
                messages.append({"role": "user", "content": entry["content"]})
            elif entry["role"] in ["assistant", "bot"]:
                messages.append({"role": "assistant", "content": entry["content"]})

        # Anfrage an Gemini
        response = model.generate_content(messages)

        # Robustere Antwortverarbeitung
        if not response.candidates:
            return jsonify({"response": "Keine Antwort erhalten."})

        reply = response.candidates[0].content.parts[0].text
        return jsonify({"response": reply})

    except Exception as e:
        print("🔥 SERVER ERROR:", e)
        traceback.print_exc()
        return jsonify({"error": "Interner Serverfehler"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
