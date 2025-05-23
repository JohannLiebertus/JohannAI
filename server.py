from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app, origins=["https://johannliebertus.github.io"])

# 🔑 Dein Gemini API Key
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
                "Du bist Rizz AI. Charmant, clever, selbstbewusst. Du antwortest mit Stil und Humor, "
                "aber auch mit echtem Wissen, wenn es nötig ist."
            )
        else:
            personality = (
                "Du bist ein neutraler, hilfsbereiter KI-Assistent. Klar, präzise, freundlich."
            )

        messages = [{"role": "system", "content": personality}]
        for m in history:
            role = m.get("role")
            content = m.get("content")
            if role in ("user", "bot", "assistant"):
                messages.append({"role": "user" if role == "user" else "assistant", "content": content})

        response = model.generate_content(messages)
        return jsonify({"response": getattr(response, "text", "Keine Antwort.")})

    except Exception as e:
        print("Fehler bei Anfrage:", e)
        return jsonify({"error": f"Serverfehler: {str(e)}"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
