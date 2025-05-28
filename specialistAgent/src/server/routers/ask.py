from flask import jsonify, request
from server.models.User import UserModel
from pydantic import ValidationError

def askQuestionToSpecialistAgent(app, prefix, specialistAgent):
    
    @app.route(f"{prefix}", methods=["POST"])
    def askQuestion():
        data = request.get_json()
        conversation_id = data.get("conversation_id")
        username = data.get("username")
        user = data.get("user")
        prompt = data.get("prompt")

        # Verify requestId, user and prompt fields
        if not conversation_id or not username or not isinstance(user, dict) or not prompt:
            return jsonify({
                "error": "Missing requestId, user or prompt fields."
            }), 400
        
        # Verify user schema
        try:
            UserModel(**user)
        except ValidationError as e:
            return jsonify({
                "error": "Invalid user schema."
            }), 400

        specialistAgent.handleRequest(conversation_id, username, user, prompt)

        return jsonify({
            "message": "Request received successfully."
        }), 200
       