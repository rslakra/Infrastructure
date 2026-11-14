# argocd-app-config

ArgoCD configuration that deploys **k8s-demo-app** (and the MongoDB it needs) to Kubernetes, GitOps style:
ArgoCD watches this folder in Git and keeps the cluster in sync with it.

- App source: `Node.js/k8s-demo-app` (same repo)
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

1. Pull requests and pushes in this repo that touch `Node.js/k8s-demo-app/` run
   `.github/workflows/nodejs-k8s-demo-app-ci.yml`, which only builds and checks the app (nothing is published).
2. To release, run that workflow manually (Actions tab > **Run workflow**). After the build passes it pushes the image
   as `:<commit sha>` and `:latest`.
3. If you tick **update_manifest**, the same run commits the new `:<commit sha>` tag to `dev/deployment.yaml` in this repo.
4. ArgoCD sees the commit and rolls the deployment out (automated sync).

One-time setup:

* No token or secret is needed: the workflow uses the built-in `GITHUB_TOKEN`.
  If the repo's Actions settings are read-only, set **Settings > Actions > General > Workflow permissions** to allow write
  (the workflow already requests `packages: write` and `contents: write` per job).
* After the first push, make the `k8s-demo-app` package public (GitHub profile > Packages > Package settings),
  or create an image pull secret in the `k8s-demo-app` namespace and reference it from `dev/deployment.yaml`.
* If the `k8s-demo-app` package was already pushed from the Samples repo, it is linked to that repo: open the package settings >
  **Manage Actions access** and add `rslakra/Infrastructure` with **Write** access.

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

* **Pods in `ImagePullBackOff`:** the `ghcr.io/rslakra/k8s-demo-app` package is still private (see the one-time setup), or the image hasn't been pushed yet. Check the `Node.js - k8s-demo-app CI` run in this repo's Actions tab.
* **`k8s-demo-app` pods restart (`CrashLoopBackOff`) right after a deploy:** the app exits when MongoDB isn't reachable yet. They recover once the `mongodb` pod is ready: `kubectl get pods -n k8s-demo-app`.
* **Application stays `OutOfSync` or `Unknown`:** check that the changes are pushed to `rslakra/Infrastructure` (and that the repo is public or registered in ArgoCD), then `kubectl describe application k8s-demo-app-argo-application -n argocd`.
* **CI can't update the tag in this repo:** check that branch protection on `master` allows the `github-actions` bot to push, and that workflow permissions allow write access.
* **CI can't push the image (`denied`):** see the package access note in the one-time setup.
</br>

#### Links

* Config repo: [https://github.com/rslakra/Infrastructure](https://github.com/rslakra/Infrastructure) (`ArgoCD/argocd-app-config`)

* App: `Node.js/k8s-demo-app`, image `ghcr.io/rslakra/k8s-demo-app`

* Install ArgoCD: [https://argo-cd.readthedocs.io/en/stable/getting_started/#1-install-argo-cd](https://argo-cd.readthedocs.io/en/stable/getting_started/#1-install-argo-cd)

* Login to ArgoCD: [https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)

* ArgoCD Configuration: [https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/)
