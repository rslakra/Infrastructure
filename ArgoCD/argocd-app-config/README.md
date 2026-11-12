# argocd-app-config

ArgoCD configuration that deploys **k8s-demo-app** (and the MongoDB it needs) to Kubernetes, GitOps style:
ArgoCD watches this folder in Git and keeps the cluster in sync with it.

- App source: `Samples/Node.js/k8s-demo-app` (Services repo)
- Image: `ghcr.io/rslakra/k8s-demo-app` (GitHub Container Registry)
- Config repo: `rslakra/Infrastructure`, path `ArgoCD/argocd-app-config`

#### Layout

| File | Purpose |
|---|---|
| `application.yaml` | The ArgoCD `Application`: watches `dev/` in this repo and deploys it to the `k8s-demo-app` namespace (auto-sync, prune, self-heal, creates the namespace). |
| `dev/deployment.yaml` | The k8s-demo-app Deployment (2 replicas, port 3000). The image tag is updated by CI. |
| `dev/service.yaml` | `k8s-demo-app-service`, exposing port 3000 inside the cluster. |
| `dev/mongodb.yaml` | MongoDB Deployment and `mongodb` Service. The app exits at startup if it can't reach MongoDB. Demo credentials, no persistent volume. |

#### Commands

```bash
# install ArgoCD in k8s
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# access ArgoCD UI
kubectl get svc -n argocd
kubectl port-forward svc/argocd-server 8080:443 -n argocd

# login with admin user and below token (as in documentation):
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode && echo

# you can change and delete init password

```
</br>

#### Deploy k8s-demo-app

How a change reaches the cluster:

1. A push to `master` in the Samples repo that touches `Node.js/k8s-demo-app/` runs
   `.github/workflows/k8s-demo-app-ci.yml`, which builds the image and pushes it as `:<commit sha>` and `:latest`.
2. The same workflow commits the new `:<commit sha>` tag to `dev/deployment.yaml` in this repo.
3. ArgoCD sees the commit and rolls the deployment out (automated sync).

One-time setup:

* In the Samples repo, add a secret `INFRA_REPO_TOKEN`: a fine-grained token with **Contents: read and write** on `rslakra/Infrastructure`.
* After the first push, make the `k8s-demo-app` package public (GitHub profile > Packages > Package settings),
  or create an image pull secret in the `k8s-demo-app` namespace and reference it from `dev/deployment.yaml`.

```bash
# let ArgoCD deploy it from this repo
kubectl apply -f application.yaml

# check the application and its pods
kubectl get applications -n argocd
kubectl get pods -n k8s-demo-app

# try it
kubectl port-forward svc/k8s-demo-app-service 3000:3000 -n k8s-demo-app
curl http://localhost:3000/health
```
</br>

#### Clean up

```bash
# the Application has no cascade finalizer, so deleting it leaves the deployed resources in place
kubectl delete -f application.yaml
kubectl delete namespace k8s-demo-app
```
</br>

#### Troubleshooting

* **Pods in `ImagePullBackOff`:** the `ghcr.io/rslakra/k8s-demo-app` package is still private (see the one-time setup), or the image hasn't been pushed yet. Check the Samples CI run.
* **`k8s-demo-app` pods restart (`CrashLoopBackOff`) right after a deploy:** the app exits when MongoDB isn't reachable yet. They recover once the `mongodb` pod is ready: `kubectl get pods -n k8s-demo-app`.
* **Application stays `OutOfSync` or `Unknown`:** check that the changes are pushed to `rslakra/Infrastructure` (and that the repo is public or registered in ArgoCD), then `kubectl describe application k8s-demo-app-argo-application -n argocd`.
* **CI can't update the tag in this repo:** the `INFRA_REPO_TOKEN` secret is missing or lacks write access to `rslakra/Infrastructure`.
</br>

#### Links

* Config repo: [https://github.com/rslakra/Infrastructure](https://github.com/rslakra/Infrastructure) (`ArgoCD/argocd-app-config`)

* App: `Samples/Node.js/k8s-demo-app`, image `ghcr.io/rslakra/k8s-demo-app`

* Install ArgoCD: [https://argo-cd.readthedocs.io/en/stable/getting_started/#1-install-argo-cd](https://argo-cd.readthedocs.io/en/stable/getting_started/#1-install-argo-cd)

* Login to ArgoCD: [https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)

* ArgoCD Configuration: [https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/)
