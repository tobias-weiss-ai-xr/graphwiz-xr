"""GraphWiz-XR context builder for agent analysis."""

from pathlib import Path
from typing import Dict, Any, Optional
import yaml


class GraphWizContextBuilder:
    """Builds rich context about GraphWiz-XR for agent analysis."""

    def __init__(self, project_path: str):
        """Initialize context builder.

        Args:
            project_path: Path to GraphWiz-XR root directory
        """
        self.project_path = Path(project_path)
        self.context_cache: Optional[Dict[str, Any]] = None

    def build_context(self) -> str:
        """Build comprehensive GraphWiz-XR context.

        Returns:
            Detailed context string for agent analysis
        """
        if self.context_cache:
            return self._format_context(self.context_cache)

        self.context_cache = {
            "project_info": self._get_project_info(),
            "architecture": self._get_architecture(),
            "tech_stack": self._get_tech_stack(),
            "services": self._get_services(),
            "performance_targets": self._get_performance_targets(),
            "current_issues": self._identify_issues(),
        }

        return self._format_context(self.context_cache)

    def _get_project_info(self) -> Dict[str, Any]:
        """Get basic project information."""
        package_json = self.project_path / "package.json"
        cargo_toml = self.project_path / "Cargo.toml"

        info = {
            "name": "GraphWiz-XR",
            "description": "Browser-based VR/Social platform (Hubs rewrite)",
            "root_path": str(self.project_path),
        }

        if package_json.exists():
            with open(package_json) as f:
                import json
                package_data = json.load(f)
                info.update({
                    "version": package_data.get("version"),
                    "package_manager": "pnpm"
                })

        if cargo_toml.exists():
            info["workspace"] = True

        return info

    def _get_architecture(self) -> Dict[str, str]:
        """Get architecture information."""
        return {
            "type": "Microservices",
            "frontend": "TypeScript + React 18",
            "backend": "Rust + Actix-Web",
            "networking": "WebTransport (HTTP/3)",
            "protocol": "gRPC + Protobuf",
            "rendering": "Three.js + React Three Fiber",
        }

    def _get_tech_stack(self) -> Dict[str, list[str]]:
        """Get technology stack details."""
        return {
            "frontend": [
                "React 18",
                "TypeScript",
                "Three.js",
                "React Three Fiber",
                "WebTransport",
            ],
            "backend": [
                "Rust",
                "Actix-Web",
                "gRPC",
                "Protobuf",
                "Tokio",
            ],
            "services": [
                "reticulum/auth",
                "reticulum/hub",
                "reticulum/presence",
                "reticulum/sfu",
                "reticulum/storage",
            ],
            "infrastructure": [
                "Docker",
                "Traefik",
                "PostgreSQL",
                "Redis",
            ]
        }

    def _get_services(self) -> Dict[str, Any]:
        """Get information about services."""
        services_path = self.project_path / "packages/services"
        services = {}

        if services_path.exists():
            reticulum_path = services_path / "reticulum"
            if reticulum_path.exists():
                services["reticulum"] = {
                    "path": str(reticulum_path),
                    "components": ["auth", "hub", "presence", "sfu", "storage"],
                    "language": "Rust"
                }

        return services

    def _get_performance_targets(self) -> Dict[str, Dict[str, float]]:
        """Get performance optimization targets."""
        return {
            "webrtc": {
                "target_latency_ms": 50,
                "current_latency_ms": 100,
                "target_fps": 90,
                "current_fps": 60,
            },
            "loading": {
                "target_time_seconds": 3,
                "current_time_seconds": 5,
            },
            "concurrent_users": {
                "target": 100,
                "current_stable": 50,
            }
        }

    def _identify_issues(self) -> list[str]:
        """Identify current known issues."""
        return [
            "WebRTC latency higher than target (100ms vs 50ms)",
            "Rendering FPS below target on Quest 2 (60 vs 90)",
            "Loading times slower than target (5s vs 3s)",
            "Test coverage below target (40% vs 80%)",
        ]

    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context as readable string.

        Args:
            context: Context dictionary

        Returns:
            Formatted context string
        """
        lines = [
            "# GraphWiz-XR Project Context",
            "",
            "## Project Information",
        ]

        info = context["project_info"]
        lines.extend([
            f"- Name: {info['name']}",
            f"- Description: {info['description']}",
            f"- Version: {info.get('version', 'unknown')}",
            "",
            "## Architecture",
        ])

        for key, value in context["architecture"].items():
            lines.append(f"- {key}: {value}")

        lines.extend([
            "",
            "## Technology Stack",
        ])

        for category, items in context["tech_stack"].items():
            lines.append(f"### {category.title()}")
            for item in items:
                lines.append(f"- {item}")

        lines.extend([
            "",
            "## Services",
        ])

        for service_name, service_info in context["services"].items():
            lines.append(f"### {service_name}")
            lines.append(f"- Path: {service_info['path']}")
            lines.append(f"- Language: {service_info['language']}")
            lines.append(f"- Components: {', '.join(service_info['components'])}")

        lines.extend([
            "",
            "## Performance Targets",
        ])

        for domain, targets in context["performance_targets"].items():
            lines.append(f"### {domain.title()}")
            for metric, value in targets.items():
                lines.append(f"- {metric}: {value}")

        lines.extend([
            "",
            "## Current Issues",
        ])

        for issue in context["current_issues"]:
            lines.append(f"- {issue}")

        return "\n".join(lines)

    def get_service_context(self, service_name: str) -> Optional[str]:
        """Get context for a specific service.

        Args:
            service_name: Name of the service (e.g., "reticulum/hub")

        Returns:
            Service-specific context or None
        """
        # Implementation would read service-specific files
        # For now, return generic context
        return f"Service: {service_name}"

    def get_code_context(self, file_path: str) -> Optional[str]:
        """Get context for a specific code file.

        Args:
            file_path: Path to the code file

        Returns:
            File content and metadata
        """
        full_path = self.project_path / file_path
        if not full_path.exists():
            return None

        with open(full_path) as f:
            content = f.read()

        return f"""File: {file_path}
Language: {file_path.split('.')[-1]}
Content:
{content}"""
