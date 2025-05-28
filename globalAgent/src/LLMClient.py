from together import Together
import os
from dotenv import load_dotenv
import re

class LLMClient:
    
    # Initialize the LLM client by loading the API key
    def __init__(self):
        load_dotenv()
        self.client = Together(api_key=os.getenv("API_KEY"))
        self.model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

    # Send a prompt to the LLM and return the response
    def generateResponse(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
    
