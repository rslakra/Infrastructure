import json
import os
from multiprocessing import cpu_count

# gunicorn -c gunicorn_config.py wsgi:app

safety_net = 1
pool_size = RDS_POOL_SIZE = int(os.getenv('RDS_POOL_SIZE')) if os.getenv('RDS_POOL_SIZE') else 1
pool_size += safety_net
RDS_POOL_SIZE += safety_net

if not ((pool_size - safety_net) > 0):
    raise Exception('Threads has to be higher that 0.')

# The socket to bind.
bind = '0.0.0.0:' + os.getenv('PORT', '8080')
# The number of worker processes for handling requests.
workers = (cpu_count() * 2) + 1
# The type of workers to use.
worker_class = 'gthread'
# The number of worker threads for handling requests.
threads = pool_size - safety_net

# A base to use with setproctitle for process naming.
proc_name = "gunicorn"
# default_proc_name = "gunicorn"

# Workers silent for more than this many seconds are killed and restarted.
timeout = 60

# The Access log file to write to.
accesslog_var = os.getenv("ACCESS_LOG", "-")
use_accesslog = accesslog_var or None
accesslog = use_accesslog

# The Error log file to write to.
errorlog_var = os.getenv("ERROR_LOG", "-")
use_errorlog = errorlog_var or None
errorlog = use_errorlog

# The granularity of log outputs.
loglevel = 'debug'

# Redirect stdout/stderr to specified file in errorlog.
capture_output = True

# data to log as json
log_data = {
    "loglevel": loglevel,
    "bind": bind,
    "workers": workers,
    "threads": threads,
    "timeout": timeout,
    "errorlog": errorlog,
    "accesslog": accesslog,
    # Additional, non-gunicorn variables
}
print(json.dumps(log_data))
