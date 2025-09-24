provider "docker" {}

resource "docker_image" "nginx" {
  name = "nginx:latest"
  keep_locally = false
}

resouce "docker_container" "nginx" {
  image = docker_image.nginx.image_id
  name = "Terraform Tutorial"
  ports {
      internal =  80
      external =  8080
  }
}

