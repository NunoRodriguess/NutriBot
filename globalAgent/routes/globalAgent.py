from flask import Blueprint, request, jsonify
from src.main import AgentClassifier
import requests
from dotenv import load_dotenv
import os

# Create global_agent blueprint
global_agent_bp = Blueprint('global_agent', __name__)

load_dotenv()
api_route = os.getenv('API_URL', 'http://localhost:4000/globalresponse')

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
    
    headers = {'Content-Type': 'application/json'}

    try:
        # Send the response to the API route
        response = requests.post(api_route, json=response_data, headers=headers)
        
        if response.status_code == 200:
            return jsonify({"message": "Message routed successfully", "data": response_data}), 200
        else:
            return jsonify({"error": "Failed to route message", "details": response.text}), response.status_code
    except requests.RequestException as e:
        return jsonify({"error": "Request to API failed", "details": str(e)}), 500
