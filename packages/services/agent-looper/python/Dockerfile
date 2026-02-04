FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    protobuf-compiler \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ /app/src/
COPY config/ /app/config/
COPY simple_server.py /app/

# Copy protobuf files
COPY protobuf/ /app/protobuf

# Set up environment
ENV PYTHONPATH=/app:/app/protobuf
ENV SAIA_API_KEYS=""

# Install Flask for HTTP API
RUN pip install flask==3.0.0

# Create logs directory
RUN mkdir -p /app/logs

# Expose HTTP port
EXPOSE 50051

# Run the simple HTTP server
CMD ["python", "simple_server.py"]
