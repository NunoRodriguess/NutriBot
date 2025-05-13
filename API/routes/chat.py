from flask import Blueprint, request, jsonify
from mongo_connector import MongoDBConnection

chat_bp = Blueprint('chat', __name__)
db = MongoDBConnection()

@chat_bp.route('/chat/<username>', methods=['GET'])
def get_conversations(username):
    try:
        user_conversations = db.get_user_with_conversations(username)
        return jsonify(user_conversations), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404

@chat_bp.route('/chat/<username>/<conversation_id>', methods=['GET'])
def get_conversation(username, conversation_id):
    try:
        conversation = db.get_conversation(username, conversation_id)
        return jsonify(conversation), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404

@chat_bp.route('/chat', methods=['POST'])
def create_conversation():
    data = request.get_json()
    username = data.get('username')
    messages = data.get('messages', [])
    thumbnail = data.get('thumbnail', None)

    if not username:
        return jsonify({'error': 'Username is required'}), 400

    try:
        conversation = db.create_conversation(username, messages, thumbnail)
        return jsonify({'message': 'Conversation created', 'conversation': conversation}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@chat_bp.route('/chat/<username>/<conversation_id>', methods=['PUT'])
def add_message(username, conversation_id):
    data = request.get_json()
    message = data.get('message')
    role = data.get('role')

    if not message or not isinstance(message, str):
        return jsonify({'error': 'Invalid message'}), 400

    if role not in ['user', 'bot']:
        return jsonify({'error': "Role must be either 'user' or 'bot'"}), 400

    try:
        updated_conversation = db.add_message_to_conversation(username, conversation_id, message, role)
        return jsonify({'message': 'Message added', 'conversation': updated_conversation}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404