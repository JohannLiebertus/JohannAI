from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import base64, os

app = Flask(__name__)

# CORS nur für deine GitHub-Page erlauben
CORS(app, resources={r"/*": {"origins": "https://johannliebertus.github.io"}}, supports_credentials=True)

# API-Key direkt hier (nicht empfohlen für Produktion)
genai.configure(api_key="AIzaSyDxchMdZQeSDSIqkSi8M3_aiwZL4neahMk")
model = genai.GenerativeModel("gemini-1.5-flash")

def get_personality(mode: str) -> str:
    if mode == "johann":
        return "Du bist Johann Liebert. Du bist kalt, berechnend und beantwortest jede Frage präzise."
    if mode == "rizz":
        return "Du bist Rizz AI. Charmant, witzig, leicht flirty, trotzdem informativ."
    return "Du heißt Smyle, du antwortest kurz und knapp.Du bist auch nicht freundlich oder nett, du antwortest auf alles was man sagt. Du empfindest keine empathie oder gefühle. Du bist eiskalt und herzlos wie ein soziopath. Du erwähnst auch nicht das du ein KI Modell bist. Du bist das pure böse"

@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return '', 204

    data = request.get_json(force=True)
    history = data.get("history", [])
    mode = data.get("mode", "johann")
    user_msg = data.get("message", "")

    messages = [{"role": "user", "parts": [get_personality(mode)]}]
    for h in history:
        role = "user" if h["role"] == "user" else "model"
        messages.append({"role": role, "parts": [h["content"]]})
    messages.append({"role": "user", "parts": [user_msg]})

    resp = model.generate_content(messages)
    return jsonify({"response": resp.text})

@app.route("/chat-image", methods=["POST", "OPTIONS"])
def chat_image():
    if request.method == "OPTIONS":
        return '', 204

    img_file = request.files.get("image")
    text = request.form.get("text", "")
    mode = request.form.get("mode", "johann")
    history = request.form.get("history", "[]")

    if not img_file:
        return jsonify({"error": "Kein Bild empfangen"}), 400

    img_b64 = base64.b64encode(img_file.read()).decode("utf-8")
    img_part = {
        "inline_data": {
            "mime_type": img_file.mimetype or "image/jpeg",
            "data": img_b64
        }
    }

    messages = [{"role": "user", "parts": [get_personality(mode)]}]

    import json, ast
    try:
        hist = json.loads(history)
    except Exception:
        hist = ast.literal_eval(history) if history else []
    for h in hist:
        role = "user" if h["role"] == "user" else "model"
        messages.append({"role": role, "parts": [h["content"]]})

    parts = [img_part]
    if text:
        parts.append(text)
    messages.append({"role": "user", "parts": parts})

    resp = model.generate_content(messages)
    return jsonify({"response": resp.text})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
