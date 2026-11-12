# Multi-Region Website Infrastructure - Terraform Example
# This is a simplified example for AWS

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
  }
  
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "multi-region-website/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "MultiRegionWebsite"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  region             = var.aws_region
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  environment        = var.environment
}

# EKS Cluster Module
module "eks" {
  source = "./modules/eks"
  
  cluster_name    = "${var.project_name}-${var.environment}"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  node_group_size = var.eks_node_group_size
  instance_types  = var.eks_instance_types
  environment     = var.environment
  
  depends_on = [module.vpc]
}

# RDS PostgreSQL Module
module "rds" {
  source = "./modules/rds"
  
  db_name         = var.db_name
  db_username     = var.db_username
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  instance_class  = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  environment     = var.environment
  
  depends_on = [module.vpc]
}

# ElastiCache Redis Module
module "redis" {
  source = "./modules/redis"
  
  cluster_id      = "${var.project_name}-redis-${var.environment}"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  node_type       = var.redis_node_type
  environment     = var.environment
  
  depends_on = [module.vpc]
}

# Application Load Balancer Module
module "alb" {
  source = "./modules/alb"
  
  name            = "${var.project_name}-alb-${var.environment}"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.public_subnet_ids
  certificate_arn = var.ssl_certificate_arn
  environment     = var.environment
  
  depends_on = [module.vpc]
}

# S3 Bucket for Static Assets
module "s3" {
  source = "./modules/s3"
  
  bucket_name  = "${var.project_name}-assets-${var.environment}"
  environment  = var.environment
  enable_cdn   = true
}

# Outputs
output "eks_cluster_endpoint" {
  value       = module.eks.cluster_endpoint
  description = "EKS cluster endpoint"
}

output "eks_cluster_name" {
  value       = module.eks.cluster_name
  description = "EKS cluster name"
}

output "rds_endpoint" {
  value       = module.rds.endpoint
  description = "RDS PostgreSQL endpoint"
  sensitive   = true
}

output "redis_endpoint" {
  value       = module.redis.endpoint
  description = "ElastiCache Redis endpoint"
  sensitive   = true
}

output "alb_dns_name" {
  value       = module.alb.dns_name
  description = "Application Load Balancer DNS name"
}

output "s3_bucket_name" {
  value       = module.s3.bucket_name
  description = "S3 bucket name for static assets"
}


