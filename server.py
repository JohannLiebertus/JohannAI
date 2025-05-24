from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app, origins=["https://johannliebertus.github.io"])

# Gemini konfigurieren mit deinem API-Key
genai.configure(api_key="AIzaSyDxchMdZQeSDSIqkSi8M3_aiwZL4neahMk")
model = genai.GenerativeModel("gemini-1.5-flash")

from PIL import Image
import base64
import io

@app.route("/chat-image", methods=["POST"])
def chat_image():
    try:
        text = request.form.get("text", "")
        mode = request.form.get("mode", "johann")
        history = request.form.get("history", "[]")
        history = eval(history)

        personality = "Du bist ein hilfreicher Assistent."
        if mode == "johann":
            personality = (
                "Du bist Johann Liebert. Du bist ein herzloser kalter Psychopath ohne Moral. [...]"
            )
        elif mode == "rizz":
            personality = "Du bist Rizz AI. Du bist charmant, selbstbewusst, manchmal flirty."
        else:
            personality = "Du bist ein freundlicher, neutraler Assistent."

        messages = [{"role": "user", "parts": [personality]}]

        for entry in history:
            messages.append({
                "role": "user" if entry["role"] == "user" else "model",
                "parts": [entry["content"]]
            })

        image_part = None
        if "image" in request.files:
            image = request.files["image"]
            img_bytes = image.read()
            b64_image = base64.b64encode(img_bytes).decode("utf-8")
            image_part = {
                "inline_data": {
                    "mime_type": image.mimetype,
                    "data": b64_image
                }
            }

        parts = []
        if image_part:
            parts.append(image_part)
        if text:
            parts.append(text)

        messages.append({
            "role": "user",
            "parts": parts
        })

        response = model.generate_content(messages)
        return jsonify({"response": response.text})
    except Exception as e:
        print("🔥 Fehler bei /chat-image:", e)
        return jsonify({"error": "Fehler bei Bildanalyse"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
