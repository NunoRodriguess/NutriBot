from flask import Blueprint, request, jsonify
from mongo_connector import MongoDBConnection
import uuid
from dotenv import load_dotenv
import os
import requests

chat_bp = Blueprint('chat', __name__)
db = MongoDBConnection()
waiting_for_global_queue = []

load_dotenv()
nutrition_api = str(os.getenv('NUTRITION_API'))
supplements_api = str(os.getenv('SUPPLEMENTS_API'))
physical_api = str(os.getenv('PHISICAL_API'))
others_api = str(os.getenv('OTHERS_API'))
checkup_api = str(os.getenv('CHECKUP_API'))
global_agent = str(os.getenv('GLOBAL_AGENT'))

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
    
@chat_bp.route('/llmresponse', methods=['POST'])
def llm_response():
    data = request.get_json()
    username = data.get('username')
    conversation_id = data.get('conversation_id')
    msg_id = str(uuid.uuid4())
    response = data.get('response')

    if not username or not conversation_id or not response:
        return jsonify({'error': 'Invalid data'}), 400
    
    try:
        updated_conversation = db.add_message_to_conversation(username, conversation_id, msg_id, response, "bot")
        return jsonify({'message': 'Response added', 'conversation': updated_conversation}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    
@chat_bp.route('/globalresponse', methods=['POST'])
def global_agent_response(message_id):
    data = request.get_json()
    msg_id = data.get('id')
    conversation_id = data.get('conversation_id')
    message = data.get('message')
    agent = data.get('agent')
    username = data.get('username')
    msg_in_id = str(msg_id) + "|" + str(conversation_id)

    # Encontrar na fila de espera
    if msg_in_id in waiting_for_global_queue:
        waiting_for_global_queue.remove(msg_in_id)
        try:
            personal_info, last_10_msgs = db.get_data_for_question(username, conversation_id)
            if agent == "nutrition":
                route = nutrition_api
            elif agent == "supplements":
                route = supplements_api
            elif agent == "exercise":
                route = physical_api
            elif agent == "habits":
                route = others_api
            elif agent == "monitoring":
                route = checkup_api


            headers = {
                'Content-Type': 'application/json'
            }

            to_ask = {
                "id": conversation_id,
                "username": username,
                "prompt": message,
                "personal_info": personal_info,
                "last_10_msgs": last_10_msgs
            }

            response = requests.post(route, json=to_ask, headers=headers)

            return jsonify({'message': 'Message added'}), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 404

    else:
        return jsonify({'error': 'Message not found in waiting queue'}), 404
    


@chat_bp.route('/chat/<username>/<conversation_id>', methods=['PUT'])
def add_message(username, conversation_id):
    data = request.get_json()
    message = data.get('message')
    role = data.get('role')
    msg_id = str(uuid.uuid4()) + "|" + str(conversation_id)

    if not message or not isinstance(message, str):
        return jsonify({'error': 'Invalid message'}), 400

    if role not in ['user', 'bot']:
        return jsonify({'error': "Role must be either 'user' or 'bot'"}), 400

    try:
        updated_conversation = db.add_message_to_conversation(username, conversation_id, msg_id, message, role)
        if role == "user":
            to_find_llm = {
                "id": msg_id,
                "prompt": message,
                "username": username,
                "conversation_id": conversation_id
            }
            route = global_agent+"/globalagent"

            headers = {
                'Content-Type': 'application/json'
            }

            response = requests.post(route, json=to_find_llm, headers=headers)

            waiting_for_global_queue.append(msg_id + ";" + conversation_id)

            if response.status_code == 200:
                return jsonify({'message': 'Message added', 'conversation': updated_conversation}), 200

            else:
                return jsonify({'error': 'Error in global agent response'}), 500
        else:
            return jsonify({'message': 'Message added', 'conversation': updated_conversation}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404