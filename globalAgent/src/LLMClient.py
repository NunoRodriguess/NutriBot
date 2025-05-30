from together import Together
import os
from dotenv import load_dotenv
import re

class LLMClient:
    
    def __init__(self):
        load_dotenv()
        self.client = Together(api_key=os.getenv("API_KEY"))
        self.model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

    def generateResponse(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
    
