from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime
import uuid

class MongoDBConnection:
    def __init__(self):
        """
        Initialize the MongoDB connection using environment variables.
        """
        load_dotenv()
        mongo_uri = str(os.getenv("MONGO_URI"))
        mongo_db = str(os.getenv("MONGO_DB"))
        
        if not mongo_uri or not mongo_db:
            raise ValueError("MONGO_URI and MONGO_DB must be set in the environment variables.")
        
        self.client = MongoClient(mongo_uri)
        self.db = self.client[mongo_db]

    def get_user_info(self, username, collection_name="users"):
        """
        Retrieve user information from the database.
        
        :param username: The username of the user to retrieve.
        :return: User information as a dictionary.
        """
        collection = self.db[collection_name]
        user_info = collection.find_one({"_id": username})
        
        if user_info:
            return user_info
        else:
            raise ValueError(f"User {username} not found in the database.")
        
    def create_user(self, username, email, collection_name="users"):
        """
        Create a new user in the database.
        
        :param username: The username of the new user.
        :param email: The email of the new user.
        :return: The created user information as a dictionary.
        """
        collection = self.db[collection_name]
        query = {"_id": username}  # Use username as the _id

        existing_user = collection.find_one(query)

        if existing_user:
            raise ValueError(f"User {username} already exists in the database.")

        else:
            user_info = {"_id": username, "_email": email, "personal_info": [], "conversations": []}  # Set _id to username
            
            result = collection.insert_one(user_info)
            
            if result.inserted_id:
                return self.get_user_info(username)
            else:
                raise ValueError(f"Failed to create user {username}.")
            

    def update_profile(self, username, profile_data, collection_name="users"):
        """
        Update the profile information for a user inside the personal_info field.
        
        :param username: The username of the user.
        :param profile_data: A dictionary containing the profile fields to update.
        :return: The updated user profile as a dictionary.
        """
        collection = self.db[collection_name]

        result = collection.update_one(
            {"_id": username},
            {"$set": {f"personal_info.{key}": value for key, value in profile_data.items()}}
        )

        if result.modified_count > 0:
            return self.get_user_info(username)
        else:
            raise ValueError(f"Failed to update profile for user {username}.")

    def delete_user(self, username, collection_name="users"):
        """
        Delete a user from the database.
        
        :param username: The username of the user to delete.
        :return: A success message.
        """
        collection = self.db[collection_name]
        result = collection.delete_one({"_id": username})

        if result.deleted_count > 0:
            return {"message": f"User {username} deleted successfully."}
        else:
            raise ValueError(f"Failed to delete user {username}.")

    def get_conversation(self, username, conversation_id, collection_name="users"):
        """
        Retrieve a specific conversation by ID for a given username.
        
        :param username: The username of the user.
        :param conversation_id: The ID of the conversation.
        :return: The conversation as a dictionary.
        """
        collection = self.db[collection_name]
        
        user = collection.find_one({"_id": username}, {"conversations": 1})
        
        if not user:
            raise ValueError(f"User {username} not found in the database.")
        
        conversations = user.get("conversations", [])
        for conversation in conversations:
            if conversation.get("id") == conversation_id:
                return conversation
        
        raise ValueError(f"Conversation {conversation_id} not found for user {username}.")

    def create_conversation(self, username, messages=None, thumbnail=None, collection_name="users"):
        """
        Create a new conversation for a user and add it to the user's conversations field.
        
        :param username: The username of the user.
        :param messages: A list of messages (optional).
        :param thumbnail: A thumbnail URL (optional).
        :param collection_name: The name of the users collection.
        :return: The created conversation as a dictionary.
        """
        collection = self.db[collection_name]
        
        conversation_id = str(uuid.uuid4())
        
        conversation = {
            "id": conversation_id,
            "messages": messages or [],
            "thumbnail": thumbnail,
            "created_at": datetime.now()
        }
        
        result = collection.update_one(
            {"_id": username},
            {"$push": {"conversations": conversation}}
        )
        
        if result.modified_count > 0:
            return conversation
        else:
            raise ValueError(f"Failed to create conversation for user {username}.")

    def add_message_to_conversation(self, username, conversation_id, msg_id, message, role, collection_name="users"):
        """
        Add a message to an existing conversation within the user's conversations field.
        
        :param username: The username of the user.
        :param conversation_id: The ID of the conversation.
        :param msg_id: The ID of the message.
        :param message: The message text to add.
        :param role: The role of the sender ("user" or "bot").
        :param collection_name: The name of the users collection.
        :return: The updated conversation as a dictionary.
        """
        collection = self.db[collection_name]
        
        if role not in ["user", "bot"]:
            raise ValueError("Role must be either 'user' or 'bot'.")

        new_message = {
            "role": role,
            "text": message,
            "id": msg_id,
            "timestamp": datetime.now()
        }

        result = collection.update_one(
            {
                "_id": username,
                "conversations.id": conversation_id
            },
            {
                "$push": {"conversations.$.messages": new_message}
            }
        )

        if result.modified_count > 0:
            user = collection.find_one({"_id": username})
            if user:
                for conversation in user.get("conversations", []):
                    if conversation["id"] == conversation_id:
                        return conversation
            raise ValueError(f"Conversation {conversation_id} not found for user {username}.")
        else:
            raise ValueError(f"Failed to add message to conversation {conversation_id} for user {username}.")
    
    def update_conversation_thumbnail(self, username, conversation_id, thumbnail, collection_name="users"):
        """
        Update the thumbnail of a specific conversation within the user's conversations array.
        
        :param username: The username of the user.
        :param conversation_id: The ID of the conversation.
        :param thumbnail: The new thumbnail URL.
        :param collection_name: The name of the users collection.
        :return: The updated conversation as a dictionary.
        """
        collection = self.db[collection_name]
        
        result = collection.update_one(
            {
                "_id": username,
                "conversations.id": conversation_id
            },
            {
                "$set": {"conversations.$[conversation].thumbnail": thumbnail}
            },
            array_filters=[{"conversation.id": conversation_id}]
        )

        if result.modified_count > 0:
            user = collection.find_one({"_id": username})
            if user:
                for conversation in user.get("conversations", []):
                    if conversation["id"] == conversation_id:
                        return conversation
            raise ValueError(f"Conversation {conversation_id} not found for user {username}.")
        else:
            raise ValueError(f"Failed to update thumbnail for conversation {conversation_id} for user {username}.")
        
    def get_user_with_conversations(self, username, collection_users="users"):
        """
        Retrieve user information along with their conversations id, thumbnail, and creation time.
        
        :param username: The username of the user.
        :param collection_users: The name of the users collection.
        :return: A dictionary containing the username and their conversations.
        """
        user_collection = self.db[collection_users]
        user_info = user_collection.find_one({"_id": username}, {"_id": 1, "conversations": 1})
        
        if not user_info:
            raise ValueError(f"User {username} not found in the database.")
        
        conversations = user_info.get("conversations", [])
        formatted_conversations = [
            {
                "id": conversation.get("id"),
                "thumbnail": conversation.get("thumbnail"),
                "created_at": conversation.get("created_at")
            }
            for conversation in conversations
        ]

        formatted_conversations.sort(key=lambda x: x["created_at"], reverse=True)
        
        return {
            "_id": user_info["_id"],
            "conversations": formatted_conversations
        }
    
    def get_data_for_question(self, username, conversation_id, collection_name="users"):
        """
        Retrieve the data needed for a question from a specific conversation.
        
        :param username: The username of the user.
        :param conversation_id: The ID of the conversation.
        :param collection_name: The name of the users collection.
        :return: A dictionary containing the conversation data.
        """
        collection = self.db[collection_name]
        
        user = collection.find_one({"_id": username}, {"conversations": 1, "personal_info": 1})
        
        if not user:
            raise ValueError(f"User {username} not found in the database.")
        
        conversations = user.get("conversations", [])
        conversation = next((conv for conv in conversations if conv.get("id") == conversation_id), None)
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found for user {username}.")
        
        if len(conversation["messages"]) > 11: 
            last_10_messages = conversation["messages"][-11:]
            last_10_messages.pop(-1)

        else:
            last_10_messages = conversation["messages"]
            last_10_messages.pop(-1)

        personal_info = user.get("personal_info", {})

        return personal_info, last_10_messages
        
    