"""Metrics collection and analysis."""

from enum import Enum
import json
from typing import Dict, Any, Optional
from datetime import datetime


class MetricType(Enum):
    """Types of metrics."""
    PERFORMANCE = "performance"
    USER = "user"
    BUSINESS = "business"
    TECHNICAL = "technical"


class Metrics:
    """Collects and manages optimization metrics."""

    def __init__(self):
        self.metrics: Dict[str, Dict[str, Any]] = {}
        self.timestamp = datetime.now().isoformat()

    def add_metric(
        self,
        name: str,
        value: float,
        metric_type: MetricType,
        unit: str = "value",
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Add a metric."""
        self.metrics[name] = {
            "value": value,
            "type": metric_type.value,
            "unit": unit,
            "metadata": metadata or {},
            "timestamp": datetime.now().isoformat()
        }

    def get_metric(self, name: str) -> Optional[Dict[str, Any]]:
        """Get a metric by name."""
        return self.metrics.get(name)

    def update_metric(self, name: str, new_value: float) -> bool:
        """Update an existing metric."""
        if name in self.metrics:
            self.metrics[name]["value"] = new_value
            self.metrics[name]["timestamp"] = datetime.now().isoformat()
            return True
        return False

    def get_metrics_by_type(self, metric_type: MetricType) -> Dict[str, Dict[str, Any]]:
        """Get all metrics of a specific type."""
        return {
            k: v for k, v in self.metrics.items()
            if v.get("type") == metric_type.value
        }

    def calculate_average(self, metric_type: Optional[MetricType] = None) -> float:
        """Calculate average of metrics."""
        if metric_type:
            metrics = self.get_metrics_by_type(metric_type)
        else:
            metrics = self.metrics

        if not metrics:
            return 0.0

        values = [m["value"] for m in metrics.values()]
        return sum(values) / len(values)

    def to_dict(self) -> Dict[str, Any]:
        """Convert metrics to dictionary."""
        return {
            "timestamp": self.timestamp,
            "metrics": self.metrics,
            "summary": {
                "total_metrics": len(self.metrics),
                "average_value": self.calculate_average()
            }
        }

    def to_json(self) -> str:
        """Convert metrics to JSON string."""
        return json.dumps(self.to_dict(), indent=2)

    def export_to_file(self, filepath: str) -> None:
        """Export metrics to JSON file."""
        with open(filepath, "w") as f:
            f.write(self.to_json())

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Metrics":
        """Create metrics from dictionary."""
        metrics = cls()
        metrics.timestamp = data.get("timestamp", datetime.now().isoformat())
        for name, metric_data in data.get("metrics", {}).items():
            metrics.metrics[name] = metric_data
        return metrics
