import os
from pymongo import MongoClient
from dotenv import load_dotenv

class ConversationRepository:
    def __init__(self):
        load_dotenv()
        self.mongo_uri = os.getenv("MONGO_URI")
        self.mongo_db = os.getenv("MONGO_DB")
        self._client = None
        self._db = None
    
    @property
    def client(self):
        if self._client is None:
            self._client = MongoClient(self.mongo_uri)
        return self._client
    
    @property
    def db(self):
        if self._db is None:
            self._db = self.client[self.mongo_db]
            # Ensure conversations collection exists
            if 'conversations' not in self._db.list_collection_names():
                self._db.create_collection('conversations')
        return self._db
    
    def conversation_exists(self, conversation_id: str) -> bool:
        return self.db.conversations.find_one({"_id": conversation_id}) is not None
    
    def create_conversation(self, conversation_id: str, first_message: str):
        self.db.conversations.insert_one({
            "_id": conversation_id,
            "messages": [first_message]
        })
    
    def add_message(self, conversation_id: str, message: str):
        self.db.conversations.update_one(
            {"_id": conversation_id},
            {"$push": {"messages": message}}
        )
    
    def set_conversation_agent(self, conversation_id: str, agent: str):
        self.db.conversations.update_one(
            {"_id": conversation_id},
            {"$set": {"agent": agent}}
        )
    
    def get_conversation_agent(self, conversation_id: str) -> str:
        conversation = self.db.conversations.find_one({"_id": conversation_id})
        return conversation.get('agent') if conversation else None
    
    def get_conversation(self, conversation_id: str):
        return self.db.conversations.find_one({"_id": conversation_id})