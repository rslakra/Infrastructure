Infrastructure
===

The ```Infrastructure``` services.

## Folder Structure/Conventions

---

```
    /
    ├── Docekr                          # The Library Service
    ├── Kubernetes (K8S)                # The Library Service
    ├── .gitignore
    ├── README.md                       # Instructions and helpful links
    ├── robots.txt                      # tells which URLs the search engine crawlers can access on your site
    └── <module>                        # The module service
```

## Docker Commands

### Builds the docker container image

```shell
docker build -t <docker-container-name>:latest -f Dockerfile .
```

### Runs the docker container as background service

```
docker run --name <docker-container-name> -p 8080:8080 -d <docker-container-name>:latest
```

### Displays the docker container's log

```shell
docker logs -f <docker-container-name>
```

### Executes the 'bash' shell in the container

```shell
docker exec -it <docker-container-name> bash
```

### Stops and Remove the docker container

```shell
docker stop <docker-container-name>
docker container rm <docker-container-name>
```



## PORT Usage Commands

### Find Used Port
```shell
sudo lsof -i :8080
sudo lsof -i -P | grep 8080
```

The ```-i``` restricts ```lsof``` to show IP connections (as opposed to all the other things it can show).
```-P``` turns off port name conversion so that it shows port numbers rather than service names, which is easier when you know the port number you're after.

### Print Process ID
```shell
sudo lsof -i -P | grep 8080 | awk '{ print $2 }'
```

### Kill Process by ID
```shell
sudo kill -9 6235
```



# Reference

---

- [Docker](./Docker/README.md)



# Author

---

- Rohtash Lakra


## Contribution Guidelines

---

* Writing tests
* Code review
* Other Guidelines

## Version

---

```text
MAJOR.MINOR.PATCH.BUILD
```
