# Docker Registry

---

What makes the Docker Platform so powerful is how easy it is to use images from a central location.
Docker Hub is the premier Image Repository with thousands of Official Images ready for use. It’s also just as easy
to push your own images to the Docker Hub registry so that everyone can benefit from your Dockerized applications.

But in certain scenarios, you might not want to push your images outside your firewall. Considering that, you can
set up a local registry using the open source software project Distribution.

This ```Docker Registry``` helps to understand and setting up and configuring a local instance of the Distribution
project where your teams can share images with docker commands they already know like ```docker push```
and ```docker pull```.


## Folder Structure/Conventions

---

```
    /
    ├── <module>                    # The module service
    ├── Docker Registry             # The Sample WebApp Application    
    |    ├── conf                   # configuration module
    |    ├── iac                    # IaC module
    |    ├── webapp                 # webapp files
    |    |    ├── css               # CSS files
    |    |    ├── images            # image files
    |    |    ├── js                # JS files
    |    |    └── index.html        # index.html file
    |    ├── .dockerignore          # docker ignore files
    |    └── README.md              # Instructions and helpful links
    ├── README.md                   # Instructions and helpful links
    └── <module>                    # The module service
```



## Setup Docker Hub Registry

---

### Set up the local registry using one of the following commands

```
docker run -d -p 5016:5000 --restart=always --name local-registry registry:latest

OR

docker run -d -p 5000:5000 --restart=always --name local-registry registry:latest

OR

docker run -d -p 5000:5000 --name local-registry registry:latest
```

### Displays the Docker Hub Registry container's log
```shell
docker logs -f local-registry
```

### Executes the 'sh' shell in the container
```shell
docker exec -it local-registry sh
```

### Remove Registry

```shell
docker container stop local-registry && docker container rm -v local-registry

OR

docker container stop registry && docker container rm -v registry
```

To force remove an image even if it's being used by a container, you can use the ```-f``` flag:
```shell
docker rmi -f local-registry
docker rmi -f registry
```

### Display available images of the registry

```shell
curl -X GET http://localhost:5016/v2/_catalog

OR

curl http://localhost:5016/v2/_catalog

OR

curl -X GET http://localhost:5000/v2/_catalog
```

- Response

```json
{"repositories":[]}
```



## Common Docker Commands

---

### Builds the docker container image
```shell
docker build -t webapp-service:latest -f iac/Dockerfile .
```

### Runs the docker container as background service
```
docker run --name webapp-service -p 80:80 -d webapp-service:latest
```

### Displays the docker container's log
```shell
docker logs -f webapp-service
```

### Executes the 'bash' shell in the container
```shell
docker exec -it webapp-service bash
```

### Stops and Remove the docker container
```shell
docker stop webapp-service && docker container rm webapp-service
```

### Remove the docker container image
```shell
docker image rm webapp-service
docker rmi webapp-service
docker rmi localhost:5016/webapp-service
docker rmi localhost:5000/webapp-service
```



## Manage Docker Hub Registry Images

-----

### Builds Docker Image & Tag to Docker Hub Registry
```shell
docker build -t localhost:5016/webapp-service:latest -f iac/Dockerfile .

OR

docker build -t localhost:5000/webapp-service:latest -f iac/Dockerfile .
```

### Tag Docker Image to Docker Hub Registry

Tag the existing image to point to your local registry:

```shell
docker tag webapp-service:latest localhost:5016/webapp-service:latest

OR

docker tag webapp-service:latest localhost:5000/webapp-service:latest
```

### Push Docker Image to Docker Hub Registry
```shell
docker push localhost:5016/webapp-service:latest

OR

sudo -E docker push localhost:5016/webapp-service:latest

OR

docker push localhost:5000/webapp-service
```

### Verify Docker Hub Registry Setup

- Verify listing available images of the Docker Hub Registry
```shell
curl -X GET http://localhost:5016/v2/_catalog
```

**Response**:
```json
{"repositories":["webapp-service"]}
```

- Verify using login to Docker Hub Registry container

Log in to the Docker Hub Registry container and verify whether the image is present in it.

```shell
docker exec -it local-registry sh
ls -la var/lib/registry/docker/registry/v2/repositories/
```


### Remove Docker Image from Docker Hub Registry
```shell

```

### Pull Docker Hub Registry Images

- Remove local image, if exists
```shell
docker rmi localhost:5016/webapp-service:latest
```

Finally, pull the image from our local registry and verify that it is now pulled to our local instance of Docker.

```shell
docker pull localhost:5016/webapp-service:latest
```
**Response**:
```text
latest: Pulling from webapp-service
Digest: sha256:0e3df0ed52d02fc77f5ed93bd401a7805f958ce164479177d5419a616e3f663e
Status: Downloaded newer image for localhost:5016/webapp-service:latest
localhost:5016/webapp-service:latest
```


### Runs the docker container as background service
```shell
docker run --name webapp-service -p 80:80 -d localhost:5016/webapp-service:latest
```

- Shows the docker container's log

```shell
docker logs -f webapp-service
```

- Executes the 'bash' shell in the container

```shell
docker exec -it webapp-service bash
```

```shell
docker stop webapp-service && docker container rm webapp-service
```



## PORT Usage Commands

---

### Find Used Port
```shell
sudo lsof -i :80
sudo lsof -i -P | grep 80
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


## Docker Compose

### Deploy with ```docker compose```
```shell
docker compose up -d
OR
docker compose -f iac/compose.yaml up -d
```

### Stop and remove the containers
```shell
docker compose down
```


---

The following code needs to update and might not work.

---

## Kubernetes

---

Kubernetes (often shortened to K8S) is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. It helps manage and orchestrate these containers across multiple hosts, providing mechanisms for deployment, maintenance, and scaling of applications.

### Local K8S Development

### Kubectl

- Kubernetes Commands


#### Create Deployment

```shell
kubectl apply --validate=true --dry-run=true -f iac/deployment.yaml

Then

kubectl create -f iac/deployment.yaml
```

#### Deployment

- Create

```shell
kubectl create deployment webapp-service-deployment --image=localhost:5016/webapp-service

OR

kubectl apply -f iac/deployment.yaml
```

The pod can be deployed using:

```shell
kubectl create -f iac/k8s/iws-pod.yaml
```

- Delete

```shell
kubectl delete deployment webapp-service-deployment
OR
kubectl delete -f iac/deployment.yaml
```

- Replace

```shell
kubectl edit deployment webapp-service-deployment
```

Note: -
In local ```minikube``` the external IP is not allocated by default.
To allocate an external IP run the following command:

````shell
minikube service mongo-express-service
````

- Check the logs of the ```mongo-express``` pod:

```shell
kubectl logs mongo-express-5d74874b84-79vr9
```

And notice the **basicAuth** credentials to login:

```text
Mongo Express server listening at http://0.0.0.0:8081
Server is open to allow connections from anyone (0.0.0.0)
basicAuth credentials are "admin:pass", it is recommended you change this in your config.js!
```



# Reference

- [Build a Scalable Flask Web Project From Scratch](https://kubeyaml.com/)
- [connection-refused-on-pushing-a-docker-image](https://stackoverflow.com/questions/52698748/connection-refused-on-pushing-a-docker-image)
- [The Apache HTTP Server](https://hub.docker.com/_/httpd)

## Docker

- [Docker Awesome Compose](https://github.com/docker/awesome-compose)
- [How to Use Your Own Docker Registry](https://www.docker.com/blog/how-to-use-your-own-registry-2/)
- [Kubernetes](../../Kubernetes/README.md)



# Author

- Rohtash Lakra
