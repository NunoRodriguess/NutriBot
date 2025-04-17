from flask import Blueprint, request, jsonify
import uuid

chat_bp = Blueprint('chat', __name__)

conversations = {}

# Get all conversations from a user, having his username
@chat_bp.route('/chat/<username>', methods=['GET'])
def get_conversations(username):
    user_conversations = [conv for conv in conversations.values() if conv['username'] == username]
    return jsonify(user_conversations), 200

# Get a conversations from a user, having his username and the conversation id
@chat_bp.route('/chat/<username>/<conversation_id>', methods=['GET'])
def get_conversation(username, conversation_id):
    conversation = conversations.get(conversation_id)
    if not conversation or conversation['username'] != username:
        return jsonify({'error': 'Conversation not found'}), 404
    return jsonify(conversation), 200

@chat_bp.route('/chat', methods=['POST'])
def create_conversation():
    conversation_id = str(uuid.uuid4())
    conversations[conversation_id] = {
        'messages': []
    }
    return jsonify({'message': 'Conversation created', 'conversation_id': conversation_id}), 201

@chat_bp.route('/chat/<conversation_id>', methods=['PUT'])
def add_message(conversation_id):
    if conversation_id not in conversations:
        return jsonify({'error': 'Conversation not found'}), 404

    data = request.get_json()
    message = data.get('message')

    if not message or not isinstance(message, str):
        return jsonify({'error': 'Invalid message'}), 400

    conversations[conversation_id]['messages'].append(message)
    return jsonify({'message': 'Message added', 'conversation': conversations[conversation_id]}), 200