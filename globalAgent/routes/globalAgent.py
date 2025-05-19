from flask import Blueprint, request, jsonify
from src.main import AgentClassifier

# Create global_agent blueprint
global_agent_bp = Blueprint('global_agent', __name__)

# Initialize the classifier
classifier = AgentClassifier()

@global_agent_bp.route('/globalagent', methods=['POST'])

def route_message():

    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Invalid request: No JSON data"}), 400
    
    # Extract information from request
    msg_id = data.get('id')
    prompt = data.get('prompt')
    username = data.get('username')
    conversation_id = data.get('conversation_id')
    
    if not all([msg_id, prompt, username, conversation_id]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Use the classifier to determine which agent should handle the message
    agent = classifier.classify_message(prompt)
    
    # Return the decision to the main system
    response_data = {
        "msg_id": msg_id,
        "conversation_id": conversation_id,
        "message": prompt,
        "agent": agent,
        "username": username
    }
    
    return jsonify(response_data), 200
