FROM python:3.10-slim

WORKDIR /app

# Copy requirements file first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and env file
COPY . .

# Set Python and Flask environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_DEBUG=0

# Expose the port (this will now be handled by Flask dynamically)
EXPOSE 3000-3005

# Fix the path to point to app.py in the src directory
CMD ["python", "src/app.py"]
