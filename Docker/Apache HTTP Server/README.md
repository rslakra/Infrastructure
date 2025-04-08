# Apache HTTP Server

---

The ```Apache HTTP Server``` is the sample web application running under ```httpd/2.4```.



## Folder Structure/Conventions

---

```
    /
    ├── <module/sub-module>         # The module/sub-module service
    ├── README.md                   # Instructions and helpful links
    └── <module>                    # The module service
```



## Docker Commands

### Builds the docker container image
```shell
docker build -t apache-web-server:latest -f iac/Dockerfile .
```

### Remove the docker container image
```shell
docker image rm apache-web-server
```

### Runs the docker container as background service
```
docker run --name apache-web-server -p 80:80 -d apache-web-server:latest
```

### Displays the docker container's log
```shell
docker logs -f apache-web-server
```

### Executes the 'bash' shell in the container
```shell
docker exec -it apache-web-server bash
```

### Stops and Remove the docker container
```shell
docker stop apache-web-server && docker container rm apache-web-server
```



# Reference

---

- [The Apache HTTP Server](https://hub.docker.com/_/httpd)



# Author

---

- Rohtash Lakra
