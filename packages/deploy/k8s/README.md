# GraphWiz-XR Kubernetes Deployment

#

# Complete deployment guide for production environments.

#

# Prerequisites:

# - Kubernetes cluster v1.25+

# - kubectl configured

# - NGINX Ingress Controller

# - cert-manager (for TLS)

# - StorageClass for persistent volumes

#

# Usage:

# # Deploy in order:

# kubectl apply -f namespace.yaml

# kubectl apply -f secrets.yaml

# kubectl apply -f configmap.yaml

# kubectl apply -f postgres.yaml

# kubectl apply -f redis.yaml

# kubectl apply -f services/

#

# # Check deployment status:

# kubectl get pods -n graphwiz-xr

# kubectl get services -n graphwiz-xr

# kubectl get ingress -n graphwiz-xr

#

# # View logs:

# kubectl logs -f deployment/auth -n graphwiz-xr

#

# # Scale services:

# kubectl scale deployment auth --replicas=3 -n graphwiz-xr

#

# Architecture:

#

# ┌─────────────────────────────────────────────────────────┐

# │ Ingress (NGINX) │

# │ graphwiz-xr.example.com │

# └─────────────────────┬───────────────────────────────────┘

# │

# ┌─────────────────────┴───────────────────────────────────┐

# │ │

# │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │

# │ │ Hub Client │ │ Admin Client│ │ Spoke │ │

# │ │ (React) │ │ (React) │ │ (Tauri) │ │

# │ └──────┬──────┘ └──────┬──────┘ └─────────────┘ │

# │ │ │ │

# │ ┌──────┴────────────────┴──────────────────────────┐ │

# │ │ API Gateway │ │

# │ └──────┬────────────────┬─────────────────┬────────┘ │

# │ │ │ │ │

# │ ┌──────┴──────┐ ┌──────┴──────┐ ┌───────┴───────┐ │

# │ │ Auth │ │ Hub │ │ Presence │ │

# │ │ (Rust) │ │ (Rust) │ │ (Rust) │ │

# │ │ Port: 8001 │ │ Port: 8002 │ │ Port: 8003 │ │

# │ └──────┬──────┘ └──────┬──────┘ └───────┬───────┘ │

# │ │ │ │ │

# │ ┌──────┴──────┐ ┌──────┴──────┐ ┌───────┴───────┐ │

# │ │ Storage │ │ SFU │ │ Avatar │ │

# │ │ (Rust) │ │ (Rust) │ │ (Rust) │ │

# │ │ Port: 8005 │ │ Port: 8004 │ │ Port: 8006 │ │

# │ └──────┬──────┘ └──────┬──────┘ └───────┬───────┘ │

# │ │ │ │ │

# │ ┌──────┴────────────────┴──────────────────┴───────┐ │

# │ │ Infrastructure │ │

# │ │ PostgreSQL │ Redis │ Prometheus │ Grafana │ │

# │ └───────────────────────────────────────────────────┘ │

# └─────────────────────────────────────────────────────────┘

#

# Scaling Guidelines:

# - Auth: 2-10 replicas (CPU-bound for JWT operations)

# - Hub: 2-10 replicas (database-heavy)

# - Presence: 2-20 replicas (WebSocket connections, scale with users)

# - SFU: 2-20 replicas (media-heavy, scale with concurrent calls)

# - Storage: 2-10 replicas (I/O bound)

# - Avatar: 2-10 replicas (lightweight)

#

# Resource Requirements (per replica):

# - Auth: 128-256Mi RAM, 100-500m CPU

# - Hub: 128-256Mi RAM, 100-500m CPU

# - Presence: 256-512Mi RAM, 200-1000m CPU

# - SFU: 512-1024Mi RAM, 500-2000m CPU

# - Storage: 256-512Mi RAM, 200-1000m CPU

# - Avatar: 128-256Mi RAM, 100-500m CPU

# - Hub Client: 64-128Mi RAM, 50-200m CPU

#

# Monitoring:

# - Prometheus: http://prometheus:9090

# - Grafana: http://grafana:3000 (admin/admin123)

#

# Troubleshooting:

# - Check pod logs: kubectl logs -f deployment/<service> -n graphwiz-xr

# - Check events: kubectl get events -n graphwiz-xr --sort-by='.lastTimestamp'

# - Check resource usage: kubectl top pods -n graphwiz-xr

# - Check ingress: kubectl describe ingress hub-client-ingress -n graphwiz-xr
