#!/bin/sh
#set -e
# Start Gunicorn
exec gunicorn --name "gunicorn" -c gunicorn_config.py wsgi:app
