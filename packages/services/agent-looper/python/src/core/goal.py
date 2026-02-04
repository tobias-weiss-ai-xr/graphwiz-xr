"""Goal definition and tracking for optimization targets."""

from enum import Enum
from typing import Optional, Dict, Any
import yaml


class GoalCategory(Enum):
    """Categories of optimization goals."""
    PERFORMANCE = "performance"
    FEATURE = "feature"
    BUG_FIX = "bug_fix"
    USER_EXPERIENCE = "user_experience"
    ACCESSIBILITY = "accessibility"
    SEO = "seo"
    CODE_QUALITY = "code_quality"


class Goal:
    """Represents an optimization goal."""

    def __init__(
        self,
        name: str,
        description: str,
        category: GoalCategory,
        target_value: float,
        current_value: float = 0.0,
        unit: str = "value",
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.name = name
        self.description = description
        self.category = category
        self.target_value = target_value
        self.current_value = current_value
        self.unit = unit
        self.metadata = metadata or {}
        self.history = []

    def update_progress(self, new_value: float) -> None:
        """Update the current progress and track history."""
        self.history.append(self.current_value)
        self.current_value = new_value

    def progress_percentage(self) -> float:
        """Calculate progress as a percentage."""
        if self.target_value == 0:
            return 100.0 if self.current_value == 0 else 0.0
        return min(100.0, (self.current_value / self.target_value) * 100)

    def is_completed(self) -> bool:
        """Check if the goal is completed."""
        return self.current_value >= self.target_value

    def to_dict(self) -> Dict[str, Any]:
        """Convert goal to dictionary."""
        return {
            "name": self.name,
            "description": self.description,
            "category": self.category.value,
            "target_value": self.target_value,
            "current_value": self.current_value,
            "unit": self.unit,
            "metadata": self.metadata,
            "progress_percentage": self.progress_percentage(),
            "is_completed": self.is_completed()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Goal":
        """Create goal from dictionary."""
        return cls(
            name=data["name"],
            description=data["description"],
            category=GoalCategory(data["category"]),
            target_value=data["target_value"],
            current_value=data.get("current_value", 0.0),
            unit=data.get("unit", "value"),
            metadata=data.get("metadata", {})
        )


class GoalManager:
    """Manages multiple optimization goals."""

    def __init__(self):
        self.goals: Dict[str, Goal] = {}

    def add_goal(self, goal: Goal) -> None:
        """Add a new goal."""
        self.goals[goal.name] = goal

    def get_goal(self, name: str) -> Optional[Goal]:
        """Get a goal by name."""
        return self.goals.get(name)

    def update_goal(self, name: str, new_value: float) -> bool:
        """Update goal progress."""
        goal = self.get_goal(name)
        if goal:
            goal.update_progress(new_value)
            return True
        return False

    def get_all_goals(self) -> list[Goal]:
        """Get all goals."""
        return list(self.goals.values())

    def get_completed_goals(self) -> list[Goal]:
        """Get all completed goals."""
        return [g for g in self.goals.values() if g.is_completed()]

    def get_pending_goals(self) -> list[Goal]:
        """Get all pending goals."""
        return [g for g in self.goals.values() if not g.is_completed()]

    def overall_progress(self) -> float:
        """Calculate overall progress across all goals."""
        if not self.goals:
            return 0.0
        return sum(g.progress_percentage() for g in self.goals.values()) / len(self.goals)

    def load_from_yaml(self, filepath: str) -> None:
        """Load goals from YAML file."""
        with open(filepath) as f:
            data = yaml.safe_load(f)

        for goal_data in data.get("goals", []):
            goal = Goal.from_dict(goal_data)
            self.add_goal(goal)

    def save_to_yaml(self, filepath: str) -> None:
        """Save goals to YAML file."""
        data = {
            "goals": [goal.to_dict() for goal in self.goals.values()]
        }
        with open(filepath, "w") as f:
            yaml.dump(data, f, default_flow_style=False)
