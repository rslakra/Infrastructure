# Dockerfile for a Ubuntu 22.04 image with Python 3.12 pre-installed
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Update and install necessary packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    software-properties-common \
    curl \
    gnupg \
    ca-certificates

# Add deadsnakes PPA and install Python 3.12
RUN add-apt-repository ppa:deadsnakes/ppa -y && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    python3.12 \
    python3.12-venv \
    python3.12-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Python 3.12 as the default python3 (optional, use with caution)
# This step is generally not recommended for system-wide default changes on a host system,
# but can be acceptable within a container if you understand the implications.
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1

# Verify the installation
RUN python3.12 --version && python3 --version

# Install pip for Python 3.12
RUN curl -sS https://bootstrap.pypa.io/get-pip.py -o get-pip.py && \
    python3.12 get-pip.py && \
    rm get-pip.py && \
    pip3.12 --version

# Example of creating and activating a virtual environment (optional)
# This is generally the recommended way to manage project dependencies.
# RUN python3.12 -m venv /opt/venv
# ENV PATH="/opt/venv/bin:$PATH"
# RUN pip install --no-cache-dir some_package
# Verify the Python and pip version
RUN python3.12 --version && pip3.12 --version

# Set work directory (optional, adjust as needed)
RUN mkdir -p /app
WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install dependencies from requirements.txt (optional)
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .

# Expose port for FastAPI
EXPOSE 8000

# Define default command to run the FastAPI app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
