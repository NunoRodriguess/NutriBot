from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from routes.globalAgent import global_agent_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(global_agent_bp)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)