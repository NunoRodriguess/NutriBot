import os
import queue
import threading
import requests
from dotenv import load_dotenv
from src.classifiers.AgentClassifier import AgentClassifier
from src.database.ConversationRepository import ConversationRepository
from src.models.MessageRequest import MessageRequest

class GlobalAgentService:
    def __init__(self):
        load_dotenv()
        self.api_route = os.getenv('API_URL', 'http://localhost:4000/globalresponse')
        self.classifier = AgentClassifier()
        self.conversation_repo = ConversationRepository()
        
        # Create a queue and start a worker thread for congestion control
        self.task_queue = queue.Queue()
        self.worker_thread = threading.Thread(target=self._process_queue, daemon=True)
        self.worker_thread.start()
        
    def _process_queue(self):
        """Process tasks from the queue to handle congestion"""
        while True:
            try:
                message_request = self.task_queue.get()
                print(f"[Worker] Processing request {message_request.conversation_id}-{message_request.username}")
                
                self._process_message(message_request)
                
            except Exception as e:
                print(f"[Worker] Error processing request: {e}")
            finally:
                self.task_queue.task_done()
    
    def handle_request(self, message_request: MessageRequest):
        """Add request to queue for processing"""
        self.task_queue.put(message_request)
        print(f"Task added to queue for request {message_request.conversation_id}-{message_request.username}")
    
    def _process_message(self, message_request: MessageRequest):
        """Process the message classification and routing"""
        try:
            # Check if this is the first message in the conversation
            is_first_message = not self.conversation_repo.conversation_exists(message_request.conversation_id)
            
            # Create or update conversation
            if is_first_message:
                self.conversation_repo.create_conversation(message_request.conversation_id, message_request.prompt)
            else:
                self.conversation_repo.add_message(message_request.conversation_id, message_request.prompt)
            
            # Classify the message
            print(f"Classifying message")
            agent, thumbnail = self._classify_message(message_request.prompt, is_first_message)
            print(f"Message classified as agent: {agent}, thumbnail: {thumbnail}")
            
            # Prepare response data
            print(f"Preparing response data")
            response_data = self._prepare_response_data(message_request, agent, thumbnail, is_first_message)
            print(f"Response data prepared: {response_data}")
            
            # Update conversation with agent if first message
            if is_first_message:
                self.conversation_repo.set_conversation_agent(message_request.conversation_id, agent)
            elif agent.lower() == "none":
                # Get agent from existing conversation
                existing_agent = self.conversation_repo.get_conversation_agent(message_request.conversation_id)
                response_data["agent"] = existing_agent
            
            # Send to the API
            print(f"Forwarding response data to API")
            self._forward_to_api(response_data)
            print(f"Message processed successfully for conversation")
            
        except Exception as e:
            print(f"Error processing message: {e}")
            raise
    
    def _classify_message(self, prompt: str, is_first_message: bool):
        """Classify the message using the classifier"""
        return self.classifier.classify_message(prompt, is_first_message)
    
    def _prepare_response_data(self, message_request: MessageRequest, agent: str, thumbnail: str, is_first_message: bool):
        """Prepare the response data dictionary"""
        response_data = {
            "msg_id": message_request.id,
            "conversation_id": message_request.conversation_id,
            "message": message_request.prompt,
            "agent": agent,
            "username": message_request.username
        }
        
        if is_first_message and thumbnail:
            response_data["thumbnail"] = thumbnail
            
        return response_data
    
    def _forward_to_api(self, response_data: dict):
        """Forward the processed data to the next API"""
        headers = {'Content-Type': 'application/json'}
        print(f"Forwarding data to API")
        try:
            print(f"API route: {self.api_route}")
            response = requests.post(self.api_route, json=response_data, headers=headers)
            print(f"Response status code: {response.status_code}")
            
            if response.status_code != 200:
                raise Exception(f"API call failed with status {response.status_code}: {response.text}")
                
            print(f"Message routed successfully for conversation {response_data['conversation_id']}")
            
        except requests.RequestException as e:
            raise Exception(f"Request to API failed: {str(e)}")