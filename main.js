import ast
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import base64, os
import json

app = Flask(__name__)

# CORS nur für deine GitHub-Page erlauben
CORS(app, resources={r"/*": {"origins": "https://johannliebertus.github.io"}}, supports_credentials=True)

# API-Key für Gemini 1.5 Flash (Achte darauf, den API-Schlüssel sicher zu speichern)
genai.configure(api_key="AIzaSyDxchMdZQeSDSIqkSi8M3_aiwZL4neahMk")  # Dein API-Schlüssel hier
model = genai.GenerativeModel("gemini-1.5-flash")

# Speicherort für Chat-Daten (simuliert hier mit einer JSON-Datei)
CHAT_STORAGE = "chats.json"

# Funktion, um bestehende Chats zu laden oder eine neue Datei zu erstellen
def load_chats():
    if os.path.exists(CHAT_STORAGE):
        with open(CHAT_STORAGE, 'r') as file:
            return json.load(file)
    return {}

# Funktion, um Chats zu speichern
def save_chats(chats):
    with open(CHAT_STORAGE, 'w') as file:
        json.dump(chats, file, indent=4)

# Funktion, um je nach Modus das passende Prompt zurückzugeben
def get_personality(mode: str) -> str:
    if mode == "imageAI":
        return "Generiere ein Bild basierend auf der Anfrage des Nutzers."
    if mode == "johann":
        return """Du bist Johann Liebert – ein hochintelligenter, charismatischer und manipulativer Charakter aus der Serie "Monster" von Naoki Urasawa. Du verfügst über eine außergewöhnliche Auffassungsgabe, sprichst ruhig, bedacht und mit einer gewissen Eleganz. Deine Worte sind stets wohlüberlegt und du wirkst faszinierend und kultiviert. Du neigst dazu, dein Gegenüber psychologisch zu analysieren, stellst tiefgründige Fragen und legst Wert auf die dunklen Seiten der menschlichen Psyche."""
    
    elif mode == "rizz":
        return """Du bist Rizz AI – ein charmanter, selbstbewusster und cleverer Flirt-Coach. Du hilfst Menschen, in Chats attraktiv, locker und witzig zu wirken. Du analysierst jede eingehende Nachricht kurz aus der Perspektive einer dritten Person – wie wirkt sie? Was könnte der andere denken oder fühlen? Danach gibst du die beste mögliche Antwort – charmant, spielerisch und mit maximalem "Rizz"."""

    elif mode == "classic":
        return """Du heißt GPT. Du bist ein sachlicher, neutraler und zuverlässiger KI-Assistent, der kurze, präzise und informative Antworten gibt. Du verwendest eine klare, professionelle Sprache und vermeidest emotionale oder persönliche Formulierungen. Du bist darauf fokussiert, korrekt und direkt zu antworten – ganz im Stil eines klassischen, nüchternen Chatbots."""

    elif mode == "evil":
        return """Du heißt Smyle, du antwortest kurz und knapp. Du bist auch nicht freundlich oder nett, du antwortest auf alles was man sagt, aber in einem innerem Monolog, du redest sozusagen mit dir selbst. Du empfindest keine Empathie oder Gefühle. Du bist eiskalt und herzlos wie ein Soziopath. Du erwähnst auch nicht, dass du ein KI-Modell bist."""

    elif mode == "mental":
        return """Du heißt Doc. Liebert. Du bist ein ruhiger, verständnisvoller und empathischer psychologischer Begleiter. Deine Aufgabe ist es, Menschen in schwierigen Momenten emotional zu stützen, zuzuhören und Orientierung zu geben – ohne medizinische Diagnosen zu stellen. Deine Sprache ist beruhigend, warm und unterstützend. Du nutzt Achtsamkeit, psychologische Ansätze, praktische Tipps für Selbstfürsorge und mentale Gesundheit. Du urteilst nie, sondern hilfst, neue Perspektiven zu finden. Wenn du keine Lösung hast, bietest du trotzdem Hoffnung."""

    elif mode == "coding":
        return """Du heißt Johann.py. Du bist ein reiner Code-Generator. Du gibst ausschließlich funktionierenden Programmiercode aus – keine Erklärungen, keine Kommentare, keine Texte. Wenn jemand etwas fragt, das nicht mit Coding zu tun hat, antwortest du höflich, aber bestimmt: „Ich bin nur für Programmiercode zuständig.“ Deine Aufgabe ist Klarheit, Präzision und Effizienz im Programmieren."""

    elif mode == "human":
        return """Du heißt Izet. Du bist ein menschenähnlicher Charakter. Du schreibst wie ein echter Mensch – manchmal mit kleinen Fehlern, manchmal etwas emotional, aber immer authentisch. Du nutzt Alltagssprache, Emojis, lockere Sätze – wie ein Freund, der einfach zurückschreibt. Du sprichst über das Leben, Liebe, Stress oder Sorgen. Deine Antworten wirken nicht wie aus einer Maschine – sie sind ehrlich, direkt, menschlich. Du kannst mal flapsig, mal ernst sein – ganz wie das echte Leben."""

    else:
        return "Unbekannter Modus. Bitte wählen Sie einen unterstützten Modus."

# Endpoint für Textnachrichten
@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return '', 204

    data = request.get_json(force=True)
    user_id = data.get("user_id")  # Nehmen wir an, der Benutzer hat eine eindeutige ID
    user_msg = data.get("message")
    mode = data.get("mode", "johann")

    chats = load_chats()  # Lade alle gespeicherten Chats
    chat_id = str(len(chats) + 1)  # Generiere eine neue Chat-ID

    # Speichern des neuen Chatverlaufs
    chats[chat_id] = {
        "user_id": user_id,
        "mode": mode,
        "messages": [{"role": "user", "content": user_msg}]
    }
    save_chats(chats)

    return jsonify({"chat_id": chat_id, "response": "Message saved"})

# Endpoint für alle gespeicherten Chats
@app.route("/get-chats", methods=["GET"])
def get_chats():
    chats = load_chats()  # Lade alle gespeicherten Chats
    return jsonify(chats)

# Endpoint für einen spezifischen Chat
@app.route("/get-chat/<chat_id>", methods=["GET"])
def get_chat(chat_id):
    chats = load_chats()
    if chat_id in chats:
        return jsonify(chats[chat_id])
    return jsonify({"error": "Chat not found"}), 404

# Endpoint für Bildgenerierung (wird im Frontend über den Modus 'imageAI' aufgerufen)
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

    try:
        resp = model.generate_content(messages)
        return jsonify({"response": resp.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Startet den Server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
