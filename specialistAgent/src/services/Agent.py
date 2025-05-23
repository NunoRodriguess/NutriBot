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
        
        globalOrchestratorAPIPort = os.getenv("GLOBAL_ORCHESTRATOR_API_PORT")
        if not globalOrchestratorAPIPort:
            raise ValueError("GLOBAL_ORCHESTRATOR_BASE_URL environment variable not set.")
        self.globalOrchestratorEndpoint = f"http://localhost:{globalOrchestratorAPIPort}/reply"
        
        self.groupConfig = loadGroupConfig("src/config/groupConfig.json", f"Group_{groupNumber}")
        
        self.contextPrompt = loadInitialPrompt(self.groupConfig["contextPrompt"])
        
        self.pineconeHandler = PineconeHandler(self.groupConfig["pineconeAPI_Key"],
                                               self.groupConfig["chunkedData"],
                                               self.groupConfig["topK"],
                                               self.groupConfig["targetThreshold"],
                                               self.groupConfig["minimumThreshold"],
                                               self.groupConfig["maxHierarchyLevel"])

        self.llmClient = LLMClient(self.groupConfig["togetherAI_API_Key"],
                                   self.groupConfig["reasoningModel"])
        
        # Create a queue and start a worker thread
        self.taskQueue = queue.Queue()
        self.workerThread = threading.Thread(target=self._processQueue, daemon=True)
        self.workerThread.start()
        
        
    def _processQueue(self):
        while True:
            try:
                requestId, user, prompt = self.taskQueue.get()
                print(f"[Worker] Processing request {requestId}")
                
                response = self.submitQuestion(prompt, user)
                print(f"[Worker] Response for {requestId}: {response}")
                
                # sendWebhook(self.globalOrchestratorEndpoint, {
                #     "requestId": requestId,
                #     "message": response
                # })
                
            except Exception as error:
                print(f"[Worker] Error handling request {requestId}: {error}")
                
                # sendWebhook(self.globalOrchestratorEndpoint, {
                #     "requestId": requestId,
                #     "error": str(error)
                # })
                
            finally:
                self.taskQueue.task_done()
                
    
    def handleRequest(self, requestId, user, prompt):
        self.taskQueue.put((requestId, user, prompt))
        print(f"Task added to queue for request {requestId}")
        
        
    def submitQuestion(self, prompt, user):
        # Retrieve relevant articles from Pinecone
        context = self.pineconeHandler.query(prompt)
        if context == "":
            raise Exception("The articles does not provide enough information to answer completely.")
        
        userInformation = user["preferences"]
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
            
