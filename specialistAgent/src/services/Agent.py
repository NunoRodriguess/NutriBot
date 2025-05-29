from services.LLMClient import LLMClient
from services.PineconeHandler import PineconeHandler
from services.utils import loadInitialPrompt, loadGroupConfig, formatPrompt, sendWebhook
from dotenv import load_dotenv
import os
import queue
import threading

class Agent:
    
    def __init__(self, groupNumber):
        load_dotenv()
        
        PINECONE_API_KEY = os.getenv(f"Group_{groupNumber}-PINECONE_API_KEY")
        TOGETHER_AI_API_KEY = os.getenv(f"Group_{groupNumber}-TOGETHER_AI_API_KEY")
        if not PINECONE_API_KEY:
            raise ValueError(f"Missing environment variable: Group_{groupNumber}-PINECONE_API_KEY")

        if not TOGETHER_AI_API_KEY:
            raise ValueError(f"Missing environment variable: Group_{groupNumber}-TOGETHER_AI_API_KEY")
        
                
        self.globalOrchestratorPartialEndpoint = "http://localhost:4000/chat" 
        self.groupConfig = loadGroupConfig("src/config/groupConfig.json", f"Group_{groupNumber}")
        self.contextPrompt = loadInitialPrompt(self.groupConfig["contextPrompt"])
                    
        self.pineconeHandler = PineconeHandler(PINECONE_API_KEY,
                                               self.groupConfig["chunkedData"],
                                               self.groupConfig["topK"],
                                               self.groupConfig["targetThreshold"],
                                               self.groupConfig["minimumThreshold"],
                                               self.groupConfig["maxHierarchyLevel"])

        self.llmClient = LLMClient(TOGETHER_AI_API_KEY,
                                   self.groupConfig["reasoningModel"])
        
        # Create a queue and start a worker thread
        self.taskQueue = queue.Queue()
        self.workerThread = threading.Thread(target=self._processQueue, daemon=True)
        self.workerThread.start()
        
        
    def _processQueue(self):
        while True:
            try:
                conversation_id, username, user, prompt = self.taskQueue.get()
                print(f"[Worker] Processing request {conversation_id}-{username}")
                
                response = self.submitQuestion(prompt, user)
                print(f"[Worker] Response for {conversation_id}-{username}: {response}")
                
                sendWebhook(f"{self.globalOrchestratorPartialEndpoint}/{username}/{conversation_id}", {
                    "message": response,
                    "role": "bot"
                })
                
            except Exception as error:
                print(f"[Worker] Error handling request {conversation_id}-{username}: {error}")
                
                sendWebhook(f"{self.globalOrchestratorPartialEndpoint}/{username}/{conversation_id}", {
                    "error": str(error),
                    "role": "bot"
                })
                
            finally:
                self.taskQueue.task_done()
                
    
    def handleRequest(self, conversation_id, username, user, prompt):
        self.taskQueue.put((conversation_id, username, user, prompt))
        print(f"Task added to queue for request {conversation_id}-{username}")
        
        
    def submitQuestion(self, prompt, user):
        # Retrieve relevant articles from Pinecone
        context = self.pineconeHandler.query(prompt)
        userInformation = user["personal_info"]
        userHistory = user["conversation"]
        
        promptWithoutUserHistory = formatPrompt(self.contextPrompt, prompt, context, userInformation)   
        
        # If prompt is too long, automatically error out
        isValidRequest = self.llmClient.checkIfValidRequest(promptWithoutUserHistory)
        if not isValidRequest:
            raise Exception("The prompt received is too long.")
        
        # If not, we will check to see if we can add some user history as well
        promptWithUserHistory = self.checkMaxUserHistory(prompt, context, userInformation, userHistory)
        
        # If its not possible to add any history, just send the default prompt
        if promptWithUserHistory:
            finalPrompt = promptWithUserHistory
        else:
            finalPrompt = promptWithoutUserHistory
            
        print(f"\n\n{finalPrompt}\n\n")
        
        response = self.llmClient.generateResponse(finalPrompt)
        return response
            
    
    # Attempts to build a valid prompt using the full user history.
    # If the prompt is too long, it progressively removes the oldest entries
    # from userHistory (one at a time from the front) and retries.
    # Returns the first successfully validated prompt.
    # If no version of the prompt is valid with any history added, returns None.
    def checkMaxUserHistory(self, prompt, context, userInformation, userHistory):
        for i in range(len(userHistory) + 1):
            trimmedHistory = userHistory[i:]
            formattedPrompt = formatPrompt(self.contextPrompt, prompt, context, userInformation, trimmedHistory)

            if self.llmClient.checkIfValidRequest(formattedPrompt):
                return formattedPrompt

        return None
            
