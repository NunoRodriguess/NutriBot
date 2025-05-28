import os
from dotenv import load_dotenv
from flask import Flask
from server.routers.index import registerRoutes
from services.Agent import Agent

load_dotenv()
groupNumber = int(os.environ.get('GROUP_NUMBER', 4)) # Changed based on your group number

def create_app():
    app = Flask(__name__)

    # Basic config
    app.config['DEBUG'] = False
    
    specialistAgent = Agent(groupNumber)

    # Register routes from external module
    registerRoutes(app, "/api", specialistAgent)

    return app

if __name__ == '__main__':

    app = create_app()
    
    # Group1 - Port 3001
    # Group2 - Port 3002 
    # .....
    app.run(port=3000+groupNumber) 

