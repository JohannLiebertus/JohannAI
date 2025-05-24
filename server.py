from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from PIL import Image
import os
import io
import base64

app = Flask(__name__)
CORS(app, origins=["https://johannliebertus.github.io"])

genai.configure(api_key="AIzaSyDxchMdZQeSDSIqkSi8M3_aiwZL4neahMk")
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route("/chat-image", methods=["POST"])
def chat_with_image():
    try:
        image_file = request.files.get("image")
        user_text = request.form.get("text", "")
        mode = request.form.get("mode", "johann")

        if not image_file:
            return jsonify({"error": "Kein Bild hochgeladen"}), 400

        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # Gemini erwartet Base64-encoding
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

        # Rollenlogik wie bei /chat
        if mode == "johann":
            personality = "..."  # Dein Text
        elif mode == "rizz":
            personality = "..."  # Dein Text
        else:
            personality = "Du bist ein neutraler Assistent ..."

        response = model.generate_content([
            {"role": "user", "parts": [personality]},
            {"role": "user", "parts": [user_text]},
            {"role": "user", "parts": [{"mime_type": "image/jpeg", "data": image_b64}]}
        ])

        return jsonify({"response": response.text})

    except Exception as e:
        print("🔥 Fehler bei /chat-image:", e)
        return jsonify({"error": "Interner Fehler"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
