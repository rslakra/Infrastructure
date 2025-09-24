# Terraform

---

Infrastructure as Code (IaC) tools allow you to manage infrastructure with configuration files rather than through a graphical user interface. IaC allows you to build, change, and manage your infrastructure in a safe, consistent, and repeatable way by defining resource configurations that you can version, reuse, and share.

Terraform is HashiCorp's infrastructure as code tool. It lets you define resources and infrastructure in human-readable, declarative configuration files, and manages your infrastructure's lifecycle. Using Terraform has several advantages over manually managing your infrastructure:

- Terraform can manage infrastructure on multiple cloud platforms.
- The human-readable configuration language helps you write infrastructure code quickly.
- Terraform's state allows you to track resource changes throughout your deployments.
- You can commit your configurations to version control to safely collaborate on infrastructure.


Terraform plugins called providers let Terraform interact with cloud platforms and other services via their application programming interfaces (APIs).

## Project Structure
```
    /
    ├── <module>                            # The module service
    ├── learn-terraform-docker-container    # learn-terraform-docker-container
    │    ├── ews                    # An external web-service
    │    ├── iws                    # An internal web-service
    │    ├── .env                   # The .env file
    │    ├── .gitignore             # The .gitignore file
    │    ├── .pylintrc              # The .pylintrc file
    │    ├── README.md              # Instructions and helpful links
    │    ├── robots.txt             # tells which URLs the search engine crawlers can access on your site
    │    ├── robots.txt             # tells which URLs the search engine crawlers can access on your site
    │    ├── runEWSApp.sh           # An EWS run script
    │    └── runIWSApp.sh           # An IWS run script
    └── <module>
```

## Local Development

### Install Terraform

First, install the HashiCorp ```tap```, a repository of all our Homebrew packages.

```shell
brew tap hashicorp/tap
```

Now, install Terraform with ```hashicorp/tap/terraform```.
```shell
brew install hashicorp/tap/terraform
```

To update to the latest version of Terraform, first update Homebrew.
```shell
brew update
```

Then, run the ```upgrade``` command to download and use the latest Terraform version.
```shell
brew upgrade hashicorp/tap/terraform
```

Verify the installation

```shell
terraform -help
```

Add any subcommand to ```terraform -help``` to learn more about what it does and available options.
```shell
terraform -help plan
```

Enable tab completion

```shell
touch ~/.zshrc
```

Then install the autocomplete package.
```shell
terraform -install-autocomplete
```


### Quick Start Tutorial

After you install ```Terraform``` and ```Docker``` on your local machine, **start Docker Desktop**.

```shell
open -a Docker
```

Create a directory named ```learn-terraform-docker-container```.
```shell
mkdir learn-terraform-docker-container
```

Navigate into the working directory.
```shell
cd learn-terraform-docker-container
```

Follow [learn-terraform-docker-container](./learn-terraform-docker-container/README.md) instructions


### Check python settings
```shell
python3 --version
python3 -m pip --version
python3 -m ensurepip --default-pip
```

### Setup a virtual environment
```
python3 -m pip install virtualenv
python3 -m venv venv
source deactivate
source venv/bin/activate
```

### Upgrade PIP Requirements (Dependencies)
```shell
pip install --upgrade pip
```

### Configuration Setup

- Create or update local .env configuration file.

```shell
touch .env
HOST = 127.0.0.1
PORT = 8080
DEBUG = True
DEFAULT_POOL_SIZE = 1
RDS_POOL_SIZE = 1
```

**By default**, Flask will run the application on **port 5000**.

## EWS & IWS Services Instructions
- [EWS Application](./ews/README.md)
- [IWS Application](./iws/README.md)

### Build Service
```shell
python3 -m build
```

### Save Requirements (Dependencies)
```shell
pip freeze > requirements.txt
```

## Unit Tests
```shell
python -m unittest discover -s ./tests -p "test_*.py"
```

# Reference

- [Infrastructure as Code](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code)


# Author
- Rohtash Lakra