import os
import time
from dotenv import load_dotenv
from services.Agent import Agent

load_dotenv()

groupNumber = os.environ.get('GROUP_NUMBER', 4) # Changed based on your group number
agent = Agent(groupNumber)

conversation_id = "123-242123-3213213"
username = "nome"
user = {
    "conversation": [
        {
            "role": "user",
            "text": "Is smoking bad?"
        },
        {
            "role": "bot",
            "text": "Yes, smoking is bad for your health."
        },
        {
            "role": "user",
            "text": "Good sleep is essential for our health and emotional well-being."
        }
    ],
    "personal_info": {
        "age": 23,
        "health": "good"
    }
}
prompt = "What are the risks of mixing alcohol with prescription or illegal drugs?"

agent.handleRequest(conversation_id, username, user, prompt)

while True:
    time.sleep(100)