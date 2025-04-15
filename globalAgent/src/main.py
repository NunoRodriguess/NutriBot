from LLMClient import LLMClient
import pandas as pd
import time

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
3. This step is extremely important: Your answer needs to be a SINGLE word. You can ONLY return one of the following options, without any explanation!
- nutrition
- supplements
- exercise
- habits
- monitoring

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
            "monitoring": {
                "name": "Monitoring Agent",
                "description": "Handles medical monoroting and questions about preventive medicine"
            },
            
        }
    
    # Input version
    
    while True:
        question = input("\nAsk a question (or 'EXIT' to quit): ")
        if question.strip().upper() == "EXIT":
            break

        question = create_classification_prompt(agents, question)
        response = llm_client.generateResponse(question)
        agent = response.strip().lower()

        print(f"Agent: {agent}")
    
    
    # Test version
    '''
    test_file = pd.read_csv('test/test_questions.csv')
    correct_count = 0
    for i,r in test_file.iterrows():
        print('Question being analyzed')
        time.sleep(1)
        question = r['question']
        agent = r['agent']

        q = create_classification_prompt(agents, question)
        response = llm_client.generateResponse(q)
        chosen_agent = response.strip().lower()

        if chosen_agent == agent:
             correct_count += 1
        else:
             print(f"Failed on question: {question}\nCorrect agent: {agent} || Chosen Agent: {chosen_agent}")

    print(f"Correct agent picked {correct_count} out of 60 times!")
    # 55/60
    '''


if __name__ == "__main__":
    main()