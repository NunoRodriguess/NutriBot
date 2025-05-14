from flask import jsonify, request
from server.models.User import UserModel
from pydantic import ValidationError

def askQuestionToSpecialistAgent(app, prefix, specialistAgent):
    
    @app.route(f"{prefix}", methods=["POST"])
    def askQuestion():
        data = request.get_json()
        requestId = data.get("requestId")
        user = data.get("user")
        prompt = data.get("prompt")

        # Verify requestId, user and prompt fields
        if not requestId or not isinstance(user, dict) or not prompt:
            return jsonify({
                "requestId": requestId,
                "error": "Missing requestId, user or prompt fields."
            }), 400
        
        # Verify user schema
        try:
            UserModel(**user)
        except ValidationError as e:
            return jsonify({
                "requestId": requestId,
                "error": "Invalid user schema."
            }), 400
            
        try:
            specialistAgent.handleRequest(requestId, user, prompt)
        except Exception as e:
            return jsonify({
                "requestId": requestId,
                "error": str(e)
            }), 500
            
        
        return jsonify({
            "requestId": requestId,
            "message": "Request received successfully."
        }), 200
       