# Jenkins

---

The ```Jenkins``` Continuous Integration and Delivery server.

**The leading open source automation server**

This is a fully functional Jenkins server, based on the weekly and LTS releases .



## Folder Structure/Conventions

---

```
    /
    ├── <module/sub-module>         # The module/sub-module service
    ├── Jenkins                     # The Jenkins Application    
    |    ├── conf                   # configuration module
    |    ├── iac                    # IaC module
    |    ├── .dockerignore          # docker ignore files
    |    └── README.md              # Jenkins Instructions and helpful links
    ├── README.md                   # Instructions and helpful links
    └── <module>                    # The module service
```


## Docker Commands

Run ```Jenkins``` as a docker container service.

### Builds the docker container image
```shell
docker build -t jenkins-server:latest -f iac/Dockerfile .
```

### Remove the docker container image
```shell
docker image rm jenkins-server
```

### Runs the docker container as background service
```
docker run --name jenkins-server -p 8016:8016 -d jenkins-server:latest
```

### Displays the docker container's log
```shell
docker logs -f jenkins-server
```

### Executes the 'bash' shell in the container
```shell
docker exec -it jenkins-server bash
```

### Stops and Remove the docker container
```shell
docker stop jenkins-server && docker container rm jenkins-server
```



## Run ```Jenkins``` as a docker container service.

# Docker Commands

### Pull Jenkins Image
```shell
docker pull jenkins/jenkins:latest
OR
docker pull jenkins/jenkins:2.502-jdk21
```

## Run ```Jenkins``` Docker Container without ```Dockerfile```

```shell
docker run --name jenkins-server -p 8016:8080 -p 50000:50000 -d -v jenkins_home:/var/jenkins_home --restart=on-failure jenkins/jenkins:2.502-jdk21

OR

docker run --name jenkins-server -p 8016:8080 -p 50000:50000 -d -v jenkins_home:/var/jenkins_home jenkins/jenkins:2.502-jdk21

OR

docker run --name jenkins-server -p 8016:8080 -p 50000:50000 -d -v jenkins_home:/var/jenkins_home jenkins/jenkins:latest
```

## Get Jenkins Admin Password
```shell
docker ps
docker logs <container-id>

OR

docker logs jenkins-server
OR
docker logs -f jenkins-server
```

## Access Jenkins UI
```shell
http://localhost:8016
```



# Reference

---

- [Jenkins Continuous Integration and Delivery server](https://hub.docker.com/r/jenkins/jenkins)
- [Official Jenkins Docker image](https://github.com/jenkinsci/docker/blob/master/README.md)



# Author

---

- Rohtash Lakra
