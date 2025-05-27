FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and env file
COPY src/ ./src/

# Set Python and Flask environment variables
ENV PYTHONPATH="/app:${PYTHONPATH}"
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=src/app.py
ENV FLASK_DEBUG=0

# Expose the port (this will now be handled by Flask dynamically)
EXPOSE 3000-3005

# Set the entrypoint to use the dynamic port from GROUP_NUMBER
CMD python -m flask run --host=0.0.0.0 --port=$FLASK_PORT
