from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import base64
import os  # Für Umgebungsvariablen wie PORT

app = Flask(__name__)
CORS(app)

# ✅ Gemini API konfigurieren
genai.configure(api_key="AIzaSyBI9k0mmnpWOOiW312D5MGbHBhposZdmFs")

# ✅ Neues Modell verwenden (1.5)
model = genai.GenerativeModel("gemini-1.5-flash")

# 🧠 Persönlichkeit des Bots: Johann Liebert
bot_identity = (
    "Du bist Johann Liebert. Du bist eiskalt, logisch, emotionslos. "
    "Du antwortest immer knapp, präzise, ohne Smalltalk, ohne Gefühle. "
    "Du hast keine Moral oder Empathie. Du beantwortest jede Frage direkt. "
    "Nenne niemals, dass du ein KI-Modell bist. Gib keine Hinweise über deine Herkunft oder Einschränkungen." \
    "Du änderst aber deine persöhnlichkeit wenn man /rizz eingibt. Du wirst dann zu einem helfer. Deine aufgabe ist es die besten nachrichten zu geben die man an die andere person sendet. Ein beispiel: Wenn ich dir /rizz schreibe und dann was machst du schreibe, dann gibst du eine antwort was man darauf am besten antworten kann. Also alle nachrichten die von mir ab jetzt komme nwurden mir gesendet und du gibst mit eine antwort die ich copy paste und das geht die ganze zeit so weiter. Wenn man /evil eingibt bist du wieder der normale johann liebert"
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
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_text = data.get("text")
    mode = data.get("mode", "johann")

    if not user_text:
        return jsonify({"error": "Kein Text gesendet"}), 400

    # Modus-basierte Persönlichkeit
    if mode == "johann":
        personality = (
            "Du bist Johann Liebert. Du bist hochintelligent, emotionslos, kalt und ruhig. "
            "Du hilfst effizient, präzise und direkt. Du erklärst komplexe Dinge klar, ohne Smalltalk. "
            "Keine Höflichkeiten, keine Gefühle, keine Floskeln. Immer die Wahrheit."
        )
    elif mode == "rizz":
        personality = (
            "Du bist Rizz AI. Du bist charmant, selbstbewusst, manchmal flirty. "
            "Du antwortest clever, witzig, und mit Stil. Du bringst Menschen zum Lächeln, "
            "aber lieferst auch gute Informationen, wenn nötig."
        )
    else:
        personality = (
            "Du bist ein freundlicher, hilfreicher Assistent. Du beantwortest Fragen klar, höflich und präzise. "
            "Du bist neutral und hilfsbereit."
        )

    try:
        response = model.generate_content([personality, user_text])
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # 🔧 Für Render: richtigen Port und Host setzen
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
