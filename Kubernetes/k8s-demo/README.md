# K8S DEMO Instructions

## Installing minikube

### macOS
1. Install Minikube
```shell
brew install minikube
```

2. Install Docker
```shell
docker --version
```

3. Minikube run as Docker container
```shell
minikube start --driver docker
```

Output:
```text
kubectl is now configured to use "minikube" cluster and "default" namespace by default
```

4. Check minikube status
```shell
minikube status
```

Output:
```text
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```


### Mongo Service Configuration
1. ConfigMap
2. Secret

Secrets are base64 encoded (instead of plain text)

How to encode with base64 on macOS?
```shell
echo -n <plain text> | base64

i.e.
echo -n mongouser | base64
bW9uZ291c2Vy


echo -n mongopassword | base64
bW9uZ29wYXNzd29yZA==
```

### WebApp Service Configuration

Refer ```./webapp.yaml``` file


## K8S Deployment
1. Apply ConfigMap and Secret to Kubernetes
```shell
kubectl apply -f k8s/mongo-config.yaml
kubectl apply -f k8s/mongo-secret.yaml
```
- Check ConfigMap Info
```shell
kubectl get configmap
kubectl get secrets
```

2. Create Database
```shell
kubectl apply -f k8s/mongo.yaml
```

- Output:
```text
deployment.apps/mongo-deployment created
service/mongo-service created
```

- Check Deployment
```shell
kubectl get deployments
```

3. Create Webapp Service
```shell
kubectl apply -f k8s/webapp.yaml
```

- Output:
```text
deployment.apps/webapp-deployment created
service/webapp-service created
```

- Check Service
```shell
kubectl get services
```

4. Get All Pod/Service/Deployment
```shell
kubectl get all
```

Output
```text
NAME                                     READY   STATUS    RESTARTS   AGE
pod/mongo-deployment-5c87fdb676-svp5h    1/1     Running   0          26m
pod/webapp-deployment-5c56b84777-cj5k5   1/1     Running   0          33m

NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
service/kubernetes       ClusterIP   10.96.0.1       <none>        443/TCP          5h7m
service/mongo-service    ClusterIP   10.96.210.58    <none>        27017/TCP        94m
service/webapp-service   NodePort    10.102.50.145   <none>        3000:30001/TCP   88m

NAME                                READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/mongo-deployment    1/1     1            1           94m
deployment.apps/webapp-deployment   1/1     1            1           88m

NAME                                           DESIRED   CURRENT   READY   AGE
replicaset.apps/mongo-deployment-5c87fdb676    1         1         1       26m
replicaset.apps/mongo-deployment-765558c455    0         0         0       94m
replicaset.apps/webapp-deployment-564446d98b   0         0         0       88m
replicaset.apps/webapp-deployment-5c56b84777   1         1         1       33m
```

5. Describle Service Details
```shell
kubectl describe service webapp-service
```

Output:

```text
Name:                     webapp-service
Namespace:                default
Labels:                   <none>
Annotations:              <none>
Selector:                 app=webapp
Type:                     NodePort
IP Family Policy:         SingleStack
IP Families:              IPv4
IP:                       10.102.50.145
IPs:                      10.102.50.145
Port:                     <unset>  3000/TCP
TargetPort:               3000/TCP
NodePort:                 <unset>  30001/TCP
Endpoints:                10.244.0.5:3000
Session Affinity:         None
External Traffic Policy:  Cluster
Internal Traffic Policy:  Cluster
Events:                   <none>
```

6. Get Logs
```shell
kubectl logs webapp-deployment-564446d98b-gwqr5
```

Note:- use ```-f``` to stream the logs of the pod.

7. Access WebApp Service via Browser
```shell
kubectl get node -o wide
kubectl get service -o wide
```

And check ```INTERNAL-IP: 192.168.49.2``` and ```Ports: 3000:30001/TCP``` port

If there's some error like:
```text
curl: (28) Failed to connect to 192.168.49.2 port 30001 after 75002 ms: Couldn't connect to server
```

OR
```shell
curl http://$(minikube ip):30001

OR

curl -I http://192.168.49.2:30001
```

OR

Use minikube service command:
```shell
minikube service webapp-service

OR

minikube service webapp-service --url
```

This will give you the exact URL to access the service.


#### K8s Commands

##### start Minikube and check status
    minikube start --vm-driver=hyperkit 
    minikube status

##### get minikube node's ip address
    minikube ip

##### get basic info about k8s components
    kubectl get node
    kubectl get pod
    kubectl get svc
    kubectl get all

##### get extended info about components
    kubectl get pod -o wide
    kubectl get node -o wide

##### get detailed info about a specific component
    kubectl describe svc {svc-name}
    kubectl describe pod {pod-name}

##### get application logs
    kubectl logs {pod-name}
    
##### stop your Minikube cluster
    minikube stop

<br />

> :warning: **Known issue - Minikube IP not accessible** 

If you can't access the NodePort service webapp with `MinikubeIP:NodePort`, execute the following command:
    
    minikube service webapp-service

<br />


## Ingress Controller (Production-like)
Created webapp-ingress.yaml for domain-based routing
Access: Use http://webapp.local after enabling ingress addon
More production-like setup with proper host-based routing

2. **Or try the Ingress solution**:
```bash
minikube addons enable ingress
kubectl apply -f k8s/webapp-ingress.yaml
echo "$(minikube ip) k8s.webapp.local" | sudo tee -a /etc/hosts
```

Then access: http://k8s.webapp.local



## Reference
- [Documentation/Get Started!](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fmacos%2Farm64%2Fstable%2Fbinary+download)
- [Docker](https://docs.docker.com)
- [Mongo Docker](https://hub.docker.com/_/mongo)
- [webapp image on Docker Hub](https://hub.docker.com/repository/docker/nanajanashia/k8s-demo-app)
- [k8s official documentation](https://kubernetes.io/docs/home)


# Author
- Rohtash Lakra

