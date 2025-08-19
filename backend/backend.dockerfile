FROM python:3.10-slim

# Working directory
WORKDIR /app

# copying requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy from source to destination
COPY . .

# Exposing the 8000 port
EXPOSE 8000

# Command to run when container starts
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]