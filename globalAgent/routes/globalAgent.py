from flask import Blueprint, request, jsonify
from src.services.GlobalAgentService import GlobalAgentService
from src.models.MessageRequest import MessageRequest
from pydantic import ValidationError

global_agent_bp = Blueprint('global_agent', __name__)

global_agent_service = GlobalAgentService()

@global_agent_bp.route('/globalagent', methods=['POST'])
def route_message():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Invalid request: No JSON data"}), 400
        
        try:
            message_request = MessageRequest(**data)
        except ValidationError as e:
            return jsonify({"error": "Invalid request schema", "details": str(e)}), 400
        
        # Handle the request asynchronously
        global_agent_service.handle_request(message_request)
        
        return jsonify({"message": "Request received successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500