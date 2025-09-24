# Learn Terraform Docker Container

---

The ```learn-terraform-docker-container``` working directory houses the configuration files that you write to describe 
the infrastructure you want Terraform to create and manage. When you initialize and apply the configuration here, 
Terraform uses this directory to store required plugins, modules (pre-written configurations), and information about 
the real infrastructure it created.

Navigate into the working directory.


## Project Structure
```
    /
    ├── <module>                            # The module service
    ├── learn-terraform-docker-container    # learn-terraform-docker-container
    │    ├── main.tf                        # An external web-service
    │    ├── README.md                      # Instructions and helpful links
    │    ├── terraform.tf                   # An internal web-service
    │    └── *                              
    └── <module>
```

## Local Development

### Quick Start Tutorial

Navigate into the working directory.


In the working directory, create a file called ```terraform.tf``` and paste the following Terraform configuration into it.
```shell
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
  }
  required_version = "~> 1.7"
}
```

And then, create a file called ```main.tf``` and paste the following Terraform configuration into it.
```shell
provider "docker" {}

resource "docker_image" "nginx" {
  name = "nginx:latest"
  keep_locally = false
}

resource "docker_container" "nginx" {
  image = docker_image.nginx.image_id
  name = "Terraform Tutorial"
  ports {
      internal =  80
      external =  8080
  }
}
```

Initialize the project, which downloads a plugin called a provider that lets Terraform interact with Docker.
```shell
terraform init
```

Results:
```shell
Initializing the backend...
Initializing provider plugins...
- Finding kreuzwerker/docker versions matching "~> 3.0.2"...
- Installing kreuzwerker/docker v3.0.2...
- Installed kreuzwerker/docker v3.0.2 (self-signed, key ID BD080C4571C6104C)
Partner and community providers are signed by their developers.
If you'd like to know more about provider signing, you can read about it here:
https://www.terraform.io/docs/cli/plugins/signing.html
Terraform has created a lock file .terraform.lock.hcl to record the provider
selections it made above. Include this file in your version control repository
so that Terraform can guarantee to make the same selections by default when
you run "terraform init" in the future.

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

Provision the ```NGINX``` server container with ```apply```. When Terraform asks you to confirm type ```yes``` and 
press ```ENTER```.
```shell
terraform apply
```


Verify the existence of the NGINX container by visiting [localhost:8080](http://localhost:8080) in your web browser or running ```docker ps``` to see the container.

To stop the container, run ```terraform destroy```.
```shell
terraform destroy
```

You've now provisioned and destroyed an NGINX webserver with Terraform.

# Reference

-[Install Terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)

# Author
- Rohtash Lakra