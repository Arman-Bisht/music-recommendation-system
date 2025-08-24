# Music Recommender DevOps Workflow

This document outlines the DevOps workflow and tools used for deploying the Music Recommender application.

## Project Structure

The application consists of two main components:

- **Frontend**: React application built with Vite
- **Backend**: FastAPI application with machine learning model for music recommendations

## DevOps Tools and Workflow

### Local Development

- **Docker Compose**: Used for local development and testing
  - Run `docker-compose up` to start both frontend and backend services locally
  - Frontend will be available at http://localhost:80
  - Backend will be available at http://localhost:8000

### Continuous Integration/Continuous Deployment (CI/CD)

- **GitHub Actions**: Automated workflow for testing, building, and deploying the application
  - Triggers on push to main/master branch or pull requests
  - Runs tests for both frontend and backend
  - Builds and pushes Docker images to container registry
  - Deploys to production environment

### Infrastructure as Code (IaC)

- **Terraform**: Used to provision and manage cloud infrastructure
  - AWS ECS Fargate for container orchestration
  - VPC, subnets, security groups, and other networking components
  - IAM roles and policies for secure access

### Container Orchestration

- **Kubernetes** (Alternative deployment option)
  - Deployment configurations for both frontend and backend
  - Service definitions for internal and external access
  - Resource limits and health checks for reliability

## Deployment Options

### Option 1: AWS ECS with Terraform

1. Configure AWS credentials
2. Update `terraform/variables.tf` with your specific values
3. Run Terraform commands:
   ```
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

### Option 2: Kubernetes

1. Set up a Kubernetes cluster (EKS, GKE, AKS, or local with minikube)
2. Update the image registry in deployment files
3. Apply Kubernetes configurations:
   ```
   kubectl apply -f kubernetes/backend-deployment.yaml
   kubectl apply -f kubernetes/frontend-deployment.yaml
   ```

## Monitoring and Logging

- **CloudWatch** (AWS): When using the Terraform/AWS deployment
  - Container logs
  - Metrics and alarms

- **Prometheus and Grafana** (Kubernetes): When using Kubernetes deployment
  - Can be added to monitor application performance
  - Dashboards for visualizing metrics

## Security Considerations

- Container images are scanned for vulnerabilities during CI/CD process
- Least privilege IAM roles
- Network security with security groups/network policies
- HTTPS for all external endpoints (configure in production)

## Scaling Strategy

- Horizontal scaling of containers based on load
- Auto-scaling configurations available in both ECS and Kubernetes

## Backup and Disaster Recovery

- Regular backups of the machine learning model
- Multi-AZ deployment for high availability
- Automated rollback in case of failed deployments

## Getting Started with DevOps Workflow

1. Set up GitHub repository with the provided GitHub Actions workflow
2. Configure secrets in GitHub repository settings:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
   - `DEPLOY_HOST`
   - `DEPLOY_USER`
   - `DEPLOY_KEY`
3. Choose deployment option (AWS ECS or Kubernetes) and follow the respective setup instructions
4. Make code changes, commit, and push to trigger the CI/CD pipeline

## Future Improvements

- Implement blue-green or canary deployment strategies
- Add comprehensive test coverage
- Set up centralized logging solution
- Implement infrastructure monitoring
- Add cost optimization strategies