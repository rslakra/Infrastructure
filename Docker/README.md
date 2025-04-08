# Docker

---

The ```Docker``` commands and services.

## Folder Structure/Conventions

---

```
    /
    ├── <module>                    # The module service
    ├── Apache HTTP Server          # The Apache HTTP Server
    ├── Docker Registry             # The Sample WebApp Application    
    ├── Jenkins                     # The Jenkins
    ├── README.md                   # Instructions and helpful links
    ├── robots.txt                  # tells which URLs the search engine crawlers can access on your site
    └── <module>                    # The module service
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

To force remove an image even if it's being used by a container, you can use the ```-f``` flag:
```shell
docker rmi -f <image_name_or_id>
```


## Clean up unused images

### To remove all dangling (untagged) images
```shell
docker image prune
```

### To remove all unused images (both dangling and tagged)
```shell
docker image prune -a
```




# Reference

---

- [Apache HTTP Server](./Apache%20HTTP%20Server/README.md)
- [Jenkins](./Jenkins/README.md)
- [WebApp Docker Example](../../Technology/WebApp/README.md#docker-commands)

# Author

---

- Rohtash Lakra

