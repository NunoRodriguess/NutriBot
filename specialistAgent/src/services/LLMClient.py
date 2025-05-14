from together import Together
import os
import re
import together
import tiktoken

class LLMClient:
    
    # Initialize the LLM client by loading the API key
    def __init__(self, apiKey, reasoningModel: bool = False):
        # TogetherAI config
        self.client = Together(api_key=apiKey)
        self.reasoningModel = reasoningModel
        
        if self.reasoningModel:
            self.model = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"
        else:
            self.model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"


    # Send a prompt to the LLM and return the response
    def generateResponse(self, prompt: str) -> str:
        try:            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
            )

            if self.reasoningModel:
                cleanResponse = self.cleanResponse(response.choices[0].message.content)
            else:
                cleanResponse = response.choices[0].message.content

            return cleanResponse
        
        except together.error.InvalidRequestError as e:
            raise Exception("There was an issue with the request. Please check the input and try again.")
        
        except together.error.RateLimitError as e:
            raise Exception("Rate limit reached. You have exceeded the maximum number of requests for this model. Please try again later.")
            
        except Exception as e:
            raise Exception(e)
        
        
    def checkIfValidRequest(self, text: str) -> bool:    
        tokensUsed = self.countTokensUsed(text)
        maxNewTokens = 2048 
        totalLimit = 8193 
        fallBackTokens = 500
        
        totalTokensUsed = tokensUsed + maxNewTokens
        allowedTokenLimit = totalLimit - fallBackTokens
        
        print("Tokens used", tokensUsed)
        if totalTokensUsed > allowedTokenLimit:
            return False
        else:
            return True
    
        
    def countTokensUsed(self, text: str) -> int:
        # Load the tokenizer for the LLaMA model
        encoding = tiktoken.get_encoding("cl100k_base")  # LLaMA models use the "cl100k_base" encoding
        
        # Encode the text and get the number of tokens
        tokens = encoding.encode(text)
        
        return len(tokens)  
    
        
    # Remove the <think>...</think> section from the response (present in reasoning models)
    def cleanResponse(self, response):
        return re.sub(r"<think>.*?</think>", "", response, flags=re.DOTALL).strip()

