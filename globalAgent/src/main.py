from src.LLMClient import LLMClient

class AgentClassifier:
    def __init__(self):
        self.llm_client = LLMClient()
        self.agents = {
            "nutrition": {
                "name": "Nutritional Agent",
                "description": "Handles nutrition and food related questions"
            },
            "supplements": {
                "name": "Supplements Agent",
                "description": "Handles questions about food supplements and other pharmaceuticals for illness prevention"
            },
            "exercise": {
                "name": "Exercise Agent",
                "description": "Handles questions about exercise, including walks, gym, team sports, etc"
            },
            "habits": {
                "name": "Habits Agent",
                "description": "Handles questions about sleep, work/leisure hours, ergonomics, hygiene, smoking, etc"
            },
            "monitoring": {
                "name": "Monitoring Agent",
                "description": "Handles medical monitoring and questions about preventive medicine"
            },
        }

    def create_classification_prompt(self, question):
        # List all available topics with descriptions
        agents_list = "\n".join([
            f"- {agent_id}: {data['name']} - {data['description']}"
            for agent_id, data in self.agents.items()
        ])
        
        # Create a prompt that instructs the LLM to classify the question
        prompt = f"""You are a classification system that determines which specialized agent should handle a given question.
Available agents:
{agents_list}
Instructions:
1. Analyze the question carefully
2. Determine which agent topic best matches the question
3. This step is extremely important: Your answer needs to be a SINGLE word. You can ONLY return one of the following options, without any explanation!
- nutrition
- supplements
- exercise
- habits
- monitoring
Question: {question} 
Topic:"""
        
        return prompt

    def classify_message(self, message):
        """
        Classify a message to determine which agent should handle it.
        
        Args:
            message (str): The user's message to classify
            
        Returns:
            str: The agent type (nutrition, supplements, exercise, habits, or monitoring)
        """
        classification_prompt = self.create_classification_prompt(message)
        print("Classification Prompt")
        llm_response = self.llm_client.generateResponse(classification_prompt)
        print(f"LLM Response: {llm_response}")
        
        # Extract the agent from the response and ensure it's valid
        agent = llm_response.strip().lower()
        if agent not in self.agents:
            # Default to nutrition if the agent is not recognized
            agent = "nutrition"
            
        return agent

def main():
    classifier = AgentClassifier()
    
    # Interactive test mode
    while True:
        question = input("\nAsk a question (or 'EXIT' to quit): ")
        if question.strip().upper() == "EXIT":
            break
        
        agent = classifier.classify_message(question)
        print(f"Agent: {agent}")

if __name__ == "__main__":
    main()