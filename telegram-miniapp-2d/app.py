from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

BOT_TOKEN = os.environ.get('BOT_TOKEN', 'PUT_YOUR_BOT_TOKEN_HERE')
ADMIN_CHAT_ID = os.environ.get('ADMIN_CHAT_ID')

TELEGRAM_API = f'https://api.telegram.org/bot{BOT_TOKEN}'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.json or {}
    text = data.get('text', 'No text')
    init_data = data.get('init_data')

    chat_id = None
    if data.get('chat_id'):
        chat_id = data.get('chat_id')
    elif ADMIN_CHAT_ID:
        chat_id = ADMIN_CHAT_ID

    if not chat_id:
        return jsonify({'ok': False, 'error': 'no chat_id available'}), 400

    url = f"{TELEGRAM_API}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': f'Feedback from webapp:\n{text}'
    }
    resp = requests.post(url, json=payload)
    return jsonify({'ok': resp.ok, 'resp': resp.json()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
