import os
import time
from dotenv import load_dotenv
from services.Agent import Agent

load_dotenv()

groupNumber = os.environ.get('GROUP_NUMBER', 4) # Changed based on your group number
agent = Agent(groupNumber)

requestId = "123-242123-3213213"
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
    "preferences": {
        "age": 23,
        "health": "good"
    }
}
prompt = "How many hours of sleep should I get?"

agent.handleRequest(requestId, user, prompt)

while True:
    time.sleep(100)