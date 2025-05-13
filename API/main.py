from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from routes.profile import profile_bp
from routes.chat import chat_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(profile_bp)
app.register_blueprint(chat_bp)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3001))
    app.run(port=port)
