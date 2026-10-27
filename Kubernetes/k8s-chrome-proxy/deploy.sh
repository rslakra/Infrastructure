#!/bin/bash

# Chrome Standalone Kubernetes Deployment Script
# This script deploys the Chrome Standalone application to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="chrome-standalone"
REGISTRY="${REGISTRY:-localhost:5000}"  # Default to local registry
TAG="${TAG:-latest}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    print_success "kubectl is available"
}

# Function to check if cluster is accessible
check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    print_success "Connected to Kubernetes cluster"
}

# Function to build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    # Build Chrome headless image
    print_status "Building chrome-standalone:${TAG}..."
    docker build -f Dockerfile.chrome -t ${REGISTRY}/chrome-standalone:${TAG} .
    docker push ${REGISTRY}/chrome-standalone:${TAG}
    
    # Build Chrome interactive image
    print_status "Building chrome-standalone-interactive:${TAG}..."
    docker build -f Dockerfile.interactive -t ${REGISTRY}/chrome-standalone-interactive:${TAG} .
    docker push ${REGISTRY}/chrome-standalone-interactive:${TAG}
    
    # Build Chrome proxy image
    print_status "Building chrome-standalone-proxy:${TAG}..."
    docker build -f Dockerfile.proxy -t ${REGISTRY}/chrome-standalone-proxy:${TAG} .
    docker push ${REGISTRY}/chrome-standalone-proxy:${TAG}
    
    print_success "All images built and pushed successfully"
}

# Function to update image references in manifests
update_image_references() {
    print_status "Updating image references in manifests..."
    
    # Update image references in all YAML files
    find k8s -name "*.yaml" -exec sed -i.bak "s|chrome-standalone:latest|${REGISTRY}/chrome-standalone:${TAG}|g" {} \;
    find k8s -name "*.yaml" -exec sed -i.bak "s|chrome-standalone-interactive:latest|${REGISTRY}/chrome-standalone-interactive:${TAG}|g" {} \;
    find k8s -name "*.yaml" -exec sed -i.bak "s|chrome-standalone-proxy:latest|${REGISTRY}/chrome-standalone-proxy:${TAG}|g" {} \;
    
    # Clean up backup files
    find k8s -name "*.yaml.bak" -delete
    
    print_success "Image references updated"
}

# Function to deploy to Kubernetes
deploy_to_k8s() {
    print_status "Deploying to Kubernetes..."
    
    # Create namespace
    kubectl apply -f k8s/namespace.yaml
    
    # Apply ConfigMap
    kubectl apply -f k8s/configmap.yaml
    
    # Apply PVC
    kubectl apply -f k8s/pvc.yaml
    
    # Deploy services based on arguments
    case "${1:-all}" in
        "headless")
            kubectl apply -f k8s/chrome-headless.yaml
            print_success "Chrome headless deployed"
            ;;
        "interactive")
            kubectl apply -f k8s/chrome-interactive.yaml
            print_success "Chrome interactive deployed"
            ;;
        "proxy")
            kubectl apply -f k8s/chrome-proxy.yaml
            print_success "Chrome proxy deployed"
            ;;
        "interactive-with-proxy")
            kubectl apply -f k8s/chrome-proxy.yaml
            kubectl apply -f k8s/chrome-interactive-with-proxy.yaml
            print_success "Chrome interactive with proxy deployed"
            ;;
        "all"|*)
            kubectl apply -f k8s/chrome-headless.yaml
            kubectl apply -f k8s/chrome-interactive.yaml
            kubectl apply -f k8s/chrome-proxy.yaml
            kubectl apply -f k8s/chrome-interactive-with-proxy.yaml
            print_success "All Chrome services deployed"
            ;;
    esac
    
    # Apply ingress (optional)
    if [ "${2:-false}" = "true" ]; then
        kubectl apply -f k8s/ingress.yaml
        print_success "Ingress deployed"
    fi
}

# Function to show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    kubectl get pods -n ${NAMESPACE}
    echo ""
    kubectl get services -n ${NAMESPACE}
    echo ""
    kubectl get pvc -n ${NAMESPACE}
}

# Function to show access information
show_access_info() {
    print_status "Access Information:"
    echo ""
    
    # Get service information
    echo "Services:"
    kubectl get services -n ${NAMESPACE} -o wide
    echo ""
    
    # Get LoadBalancer external IPs
    EXTERNAL_IPS=$(kubectl get services -n ${NAMESPACE} -o jsonpath='{.items[*].status.loadBalancer.ingress[*].ip}')
    if [ -n "$EXTERNAL_IPS" ]; then
        echo "External IPs: $EXTERNAL_IPS"
        echo ""
        echo "Access URLs:"
        for ip in $EXTERNAL_IPS; do
            echo "  Chrome Interactive DevTools: http://${ip}:9222"
            echo "  Chrome Interactive VNC: ${ip}:5900"
            echo "  Chrome Interactive with Proxy DevTools: http://${ip}:9223"
            echo "  Chrome Interactive with Proxy VNC: ${ip}:5901"
        done
    else
        echo "No external IPs found. Use port-forwarding to access services:"
        echo "  kubectl port-forward -n ${NAMESPACE} svc/chrome-interactive-service 9222:9222"
        echo "  kubectl port-forward -n ${NAMESPACE} svc/chrome-interactive-service 5900:5900"
    fi
}

# Function to cleanup deployment
cleanup() {
    print_warning "Cleaning up Chrome Standalone deployment..."
    kubectl delete namespace ${NAMESPACE} --ignore-not-found=true
    print_success "Cleanup completed"
}

# Main function
main() {
    case "${1:-deploy}" in
        "deploy")
            check_kubectl
            check_cluster
            
            if [ "${SKIP_BUILD:-false}" != "true" ]; then
                build_and_push_images
                update_image_references
            fi
            
            deploy_to_k8s "${2:-all}" "${3:-false}"
            show_status
            show_access_info
            ;;
        "status")
            show_status
            ;;
        "access")
            show_access_info
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  deploy [service] [ingress]  Deploy to Kubernetes (default: all services)"
            echo "                              Services: headless, interactive, proxy, interactive-with-proxy, all"
            echo "                              Ingress: true/false"
            echo "  status                      Show deployment status"
            echo "  access                      Show access information"
            echo "  cleanup                     Remove all resources"
            echo "  help                        Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  REGISTRY                   Docker registry URL (default: localhost:5000)"
            echo "  TAG                        Image tag (default: latest)"
            echo "  SKIP_BUILD                 Skip building images (default: false)"
            echo ""
            echo "Examples:"
            echo "  $0 deploy interactive true   # Deploy interactive Chrome with ingress"
            echo "  $0 deploy all false          # Deploy all services without ingress"
            echo "  $0 status                    # Show current status"
            echo "  $0 cleanup                   # Remove all resources"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
