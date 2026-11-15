# DockerMultiLayer

---

## Setup Environment
```shell
python3 -m pip install virtualenv
python3 -m venv venv
source ./venv/bin/activate
pip install --upgrade pip
python -m pip install -r requirements.txt 
```


## Run Application

```shell
python -m flask --app wsgi:app run --port 8080 --debug
```

OR

```shell
gunicorn -c gunicorn_config.py wsgi:app

OR

gunicorn --name "gunicorn" -c gunicorn_config.py wsgi:app
```

- Access Service
```shell
http://0.0.0.0:8080

OR

http://0.0.0.0:8080/?name=Rohtash
```


## Docker Commands

- Builds the docker container image

```shell
docker build -t docker-multi-layer:latest -f Dockerfile .
```

- Runs the docker container as background service

```shell
docker run --name docker-multi-layer -p 8080:8080 -d docker-multi-layer:latest
```

- Shows the docker container's log

```shell
docker logs -f docker-multi-layer
```

- Executes the 'bash' shell in the container

```shell
docker exec -it docker-multi-layer bash
```

- Stops and Remove the docker container

```shell
docker stop docker-multi-layer && docker container rm docker-multi-layer
```

## Extract Process Name
```shell
for pid in $(ls /proc || grep -E '^[0-9]+$'); do cat /prod/$pid/cmdline; echo; done
```

## Access Logs

- Check Application Logs
```shell
cat /var/log/gunicorn/error.log
```

- Check Datadog Logs
```shell
cat /var/log/datadog/agent.log
```
