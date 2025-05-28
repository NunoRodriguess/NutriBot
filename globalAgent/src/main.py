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

    # --- THUMBNAIL GENERATION PROMPT ---
    def create_thumbnail_prompt(self, question):
        # Create a prompt that instructs the LLM to generate a thumbnail
        prompt = f"""You are a system that generates a small summary (4-8 words) of a question, just like a typical chatbot would do to provide a thumbnail for the question.
Question: {question}
Instructions:
1. Analyze the question carefully
2. Generate a concise summary that captures the essence of the question
3. The summary should be 4-8 words long
4. Do not include any additional information or explanations
Summary:"""
        return prompt
    




    # --- CLASSIFICATION PROMPT FOR THE FIRST MESSAGE ---
    # This cannot provide None as an answer
    def create_classification_prompt_first_message(self, question):
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
    


    # --- CLASSIFICATION PROMPT FOR ALL BUT THE FIRST MESSAGE ---
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
2. Determine which agent topic best matches the question, or, if the question is not related to any of the topics, return "None"
3. This step is extremely important: Your answer needs to be a SINGLE word. You can ONLY return one of the following options, without any explanation!
- nutrition
- supplements
- exercise
- habits
- monitoring
- None
Question: {question} 
Topic:"""
        
        return prompt

    def classify_message(self, message, first_message):

        print("classifying message:", message)
        print("first_message:", first_message)

        if first_message == True:
            classification_prompt = self.create_classification_prompt_first_message(message)
            llm_response_agent= self.llm_client.generateResponse(classification_prompt)
            agent = llm_response_agent.strip().lower()
            if agent not in self.agents:
                # Default to Nutrition Agent if the response is not valid - can't default to None on the first message
                agent = "nutrition"

            thumbnail_prompt = self.create_thumbnail_prompt(message)
            thumbnail = self.llm_client.generateResponse(thumbnail_prompt)
        else:
            classification_prompt = self.create_classification_prompt(message)
            llm_response_agent= self.llm_client.generateResponse(classification_prompt)
            agent = llm_response_agent.strip().lower()
            if agent not in self.agents:
                # Default to None if the response is not valid
                agent = "None"
            thumbnail = None
        return agent, thumbnail

def main():
    classifier = AgentClassifier()
    
    # Interactive test mode
    while True:
        question = input("\nAsk a question (or 'EXIT' to quit): ")
        if question.strip().upper() == "EXIT":
            break
        
        agent, thumbnail = classifier.classify_message(question)
        print(f"Agent: {agent}")
        if thumbnail:
            print(f"Thumbnail: {thumbnail}")

if __name__ == "__main__":
    main()