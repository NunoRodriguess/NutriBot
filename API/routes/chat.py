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
api_agent_port = int(os.getenv('API_AGENT_PORT', 3000))
global_agent = str(os.getenv('GLOBAL_AGENT'))
is_local = True

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

@chat_bp.route('/chat/<username>/<conversation_id>', methods=['DELETE'])
def delete_conversation(username, conversation_id):
    try:
        db.delete_conversation(username, conversation_id)
        return jsonify({'message': f'Conversation {conversation_id} deleted successfully for user {username}'}), 200
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
def global_agent_response():
    data = request.get_json()
    msg_id = data.get('msg_id')
    conversation_id = data.get('conversation_id')
    message = data.get('message')
    agent = data.get('agent')
    username = data.get('username')
    thumbnail = data.get('thumbnail', None)
    
    print("Received global agent response")
    print("Message ID:", msg_id)
    print("Conversation ID:", conversation_id)
    print("Message:", message)
    print("Agent:", agent)
    print("Thumbnail:", thumbnail)

    # If the thumbnail is not None, update the conversation thumbnail
    if thumbnail is not None:
        db.update_conversation_thumbnail(username, conversation_id, thumbnail)

    # Encontrar na fila de espera
    if msg_id in waiting_for_global_queue:
        print("Message found in waiting queue")
        waiting_for_global_queue.remove(msg_id)
        try:
            print("Username:", username)
            print("Conversation ID:", conversation_id)
            personal_info, last_10_msgs = db.get_data_for_question(str(username), str(conversation_id))
            general_agent_fields = ["age", "weight", "height", "sex"]
            nutrition_fields = general_agent_fields + ["allergies", "diet"]
            supplements_fields = general_agent_fields + ["icm", "body_fat", "physical_activity", "medications", "allergies"]
            exercise_fields = general_agent_fields + ["icm", "avg_sleep_hours", "smoking", "avg_working_hours"]
            habits_fields = general_agent_fields + ["smoking", "avg_working_hours", "avg_sleep_hours"]
            monitoring_fields = general_agent_fields + ["diseases", "medications", "allergies", "alcohol_consumption", "physical_activity"]
            if agent == "nutrition":
                route = api_agent_port + 1
                personal_info = {k: personal_info[k] for k in nutrition_fields if k in personal_info}
            elif agent == "supplements":
                route = api_agent_port + 2
                personal_info = {k: personal_info[k] for k in supplements_fields if k in personal_info}
            elif agent == "exercise":
                route = api_agent_port + 3
                personal_info = {k: personal_info[k] for k in exercise_fields if k in personal_info}
            elif agent == "habits":
                route = api_agent_port + 4
                personal_info = {k: personal_info[k] for k in habits_fields if k in personal_info}
            elif agent == "monitoring":
                route = api_agent_port + 5
                personal_info = {k: personal_info[k] for k in monitoring_fields if k in personal_info}


            headers = {
                'Content-Type': 'application/json'
            }

            if is_local:
                route = "http://localhost:" + str(route) + "/api/ask"

            to_ask = {
                "conversation_id": conversation_id,
                "username": username,
                "prompt": message,
                "user": {
                    "personal_info": personal_info,
                    "conversation": last_10_msgs
                }
            }

            response = requests.post(route, json=to_ask, headers=headers)

            return jsonify({'message': 'Message added'}), 200
        except ValueError as e:
            print("Error while processing global agent response:", str(e))
            return jsonify({'error': str(e)}), 404

    else:
        print("Message not found in waiting queue")
        return jsonify({'error': 'Message not found in waiting queue'}), 404
    


@chat_bp.route('/chat/<username>/<conversation_id>', methods=['PUT'])
def add_message(username, conversation_id):
    data = request.get_json()
    message = data.get('message')

    if not message:
        error = data.get('error')
        updated_conversation = db.add_message_to_conversation(username, conversation_id, msg_id, str(error), role)

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
            route = global_agent + "/globalagent"

            headers = {
                'Content-Type': 'application/json'
            }

            waiting_for_global_queue.append(str(msg_id))
            print(waiting_for_global_queue)

            response = requests.post(route, json=to_find_llm, headers=headers)

            if response.status_code == 200:
                return jsonify({'message': 'Message added', 'conversation': updated_conversation}), 200

            else:
                return jsonify({'error': 'Error in global agent response'}), 500
        else:
            return jsonify({'message': 'Message added', 'conversation': updated_conversation}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404