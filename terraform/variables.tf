variable "aws_region" {
  description = "The AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "ecr_repository_url" {
  description = "URL of the ECR repository where Docker images are stored"
  type        = string
  # This should be set in a terraform.tfvars file or via environment variables
}