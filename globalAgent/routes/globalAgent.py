from flask import Blueprint, request, jsonify
from src.main import AgentClassifier
import requests
from dotenv import load_dotenv
import os
from pymongo import MongoClient

# Create global_agent blueprint
global_agent_bp = Blueprint('global_agent', __name__)

load_dotenv()
api_route = os.getenv('API_URL', 'http://localhost:4000/globalresponse')

mongo_uri = str(os.getenv("MONGO_URI"))
mongo_db = str(os.getenv("MONGO_DB"))

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

    try:
        client = MongoClient(mongo_uri)
    except Exception as e:
        return jsonify({"error": "Failed to connect to MongoDB", "details": str(e)}), 500
    
    try:
        db = client[mongo_db]
    except Exception as e:
        return jsonify({"error": "Failed to access database", "details": str(e)}), 500


    # Creating the conversations collection if it doesn't exist
    if 'conversations' not in db.list_collection_names():
        db.create_collection('conversations')

    # Setting the first message flag - used to determine if a thumbnail should be generated
    first_message = False

    # Checking if the conversation already exists
    existing_conversation = db.conversations.find_one({"_id": conversation_id})

    if not existing_conversation:
        # Create a new conversation record if it doesn't exist
        db.conversations.insert_one({
            "_id": conversation_id,
            "messages": [prompt]
        })
        first_message = True

    else:
        # If the conversation exists, append the new message to the existing messages
        db.conversations.update_one(
            {"_id": conversation_id},
            {"$push": {"messages": prompt}}
        )
        

    # Use the classifier to determine which agent should handle the message
    agent, thumbnail = classifier.classify_message(prompt, first_message)

    if first_message:
        response_data = {
        "msg_id": msg_id,
        "conversation_id": conversation_id,
        "message": prompt,
        "agent": agent,
        "username": username,
        "thumbnail": thumbnail
        }
        # Update the conversation with the agent
        db.conversations.update_one(
            {"_id": conversation_id},
            {"$set": {"agent": agent}}
        )
        
    else:
        response_data = {
            "msg_id": msg_id,
            "conversation_id": conversation_id,
            "message": prompt,
            "agent": agent,
            "username": username
        }


        if agent == "None":            
            # Getting the agent from the existing conversation
            agent = existing_conversation.get('agent')
            response_data["agent"] = agent

    
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
