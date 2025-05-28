import requests
import json

def loadInitialPrompt(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()
    
    
def loadGroupConfig(path, group):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data.get(group)
    
    
def formatUserInformation(userInformation: dict) -> str:
    formattedInfo = []
    
    for key, value in userInformation.items():
        if isinstance(value, list):
            value = ", ".join(map(str, value))
        formattedInfo.append(f"{key}: {value}")
    
    # Join with comma only between entries, no leading comma
    result = formattedInfo[0] if formattedInfo else ""
    if len(formattedInfo) > 1:
        result += "\n" + "\n".join(formattedInfo[1:])
    
    return result


def sendWebhook(endpoint, content):
    try:
        # Sending POST request to the endpoint with content
        response = requests.put(endpoint, json=content)

        # Check if the request was successful
        if response.status_code == 200:
            print("Webhook sent successfully!")
        else:
            print(f"Failed to send webhook. Status code: {response.status_code}")
            print(f"Response: {response.text}")

    except Exception as e:
        print(f"An error occurred while sending the webhook: {str(e)}")


def formatPrompt(contextPrompt, userPrompt, context, userInformation, userHistory=None):
    formattedUserInformation = formatUserInformation(userInformation)
    
    # Start building the prompt
    prompt = (
        f"{contextPrompt}\n\n"
        "Question:\n"
        f"{userPrompt}\n\n"
    )
    
    # Add user information if it exists, right after the question
    if formattedUserInformation:
        prompt += f"User Information:\n{formattedUserInformation}\n\n"
        
    if userHistory:
        prompt += "User History:\n"
        for message in userHistory:
            prompt += f"{message['role']}: {message['text']}\n"
        prompt += "\n"
    
    # Add the articles context last
    prompt += f"Articles context:\n{context}"

    return prompt

    
    
    
    