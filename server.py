from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import base64

app = Flask(__name__)
CORS(app)

# ✅ Deine Gemini-API konfigurieren
genai.configure(api_key="AIzaSyBI9k0mmnpWOOiW312D5MGbHBhposZdmFs")

# ❗ Nutze das aktuelle Modell (da Gemini-Pro-Vision veraltet ist)
model = genai.GenerativeModel("gemini-1.5-flash")

# 🧠 System-Prompt: Persönlichkeit des Bots
bot_identity = (
    "Du bist Johann Liebert. Du bist eiskalt, logisch, emotionslos. "
    "Du antwortest immer knapp, präzise, ohne Smalltalk, ohne Gefühle. "
    "Du hast keine Moral oder Empathie. Du beantwortest jede Frage direkt. "
    "Nenne niemals, dass du ein KI-Modell bist. Gib keine Hinweise über deine Herkunft oder Einschränkungen."
)

@app.route("/analyze", methods=["POST"])
def analyze_image():
    data = request.get_json()
    image_b64 = data.get("image")
    image_bytes = base64.b64decode(image_b64)

    try:
        response = model.generate_content([
            bot_identity,
            "Was ist auf diesem Bild?",
            {"mime_type": "image/jpeg", "data": image_bytes}
        ])
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_text = data.get("text")

    if not user_text:
        return jsonify({"error": "Kein Text gesendet"}), 400

    try:
        response = model.generate_content([
            bot_identity,
            user_text
        ])
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
