from typing import List, Dict
from LLMClient import LLMClient

def create_classification_prompt(agents, question):
        # List all available topics with descriptions
        agents_list = "\n".join([
            f"- {agent_id}: {data['name']} - {data['description']}"
            for agent_id, data in agents.items()
        ])
        
        # Create a prompt that instructs the LLM to classify the question
        prompt = f"""You are a classification system that determines which specialized agent should handle a given question.

Available agents:
{agents_list}

Instructions:
1. Analyze the question carefully
2. Determine which agent topic best matches the question
3. Return ONLY the topic ID (e.g., "medical" or "sleep") without any explanation
4. If the question doesn't clearly match any topic, return "general"

Question: {question}
Topic:"""
        
        return prompt
        
def main():
    llm_client = LLMClient()

    agents = {
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
            "monotoring": {
                "name": "Monitoring Agent",
                "description": "Handles medical monoroting and questions about preventive medicine"
            },
            
        }
    
    while True:
        question = input("\nAsk a question (or 'EXIT' to quit): ")
        if question.strip().upper() == "EXIT":
            break

        question = create_classification_prompt(agents, question)
        response = llm_client.generateResponse(question)
        agent = response.strip().lower()

        print(f"Agent: {agent}")

if __name__ == "__main__":
    main()