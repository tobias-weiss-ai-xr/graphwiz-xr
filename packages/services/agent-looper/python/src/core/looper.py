"""Main loop orchestration for continuous GraphWiz-XR optimization."""

import time
import logging
from typing import Optional, Dict, Any
from pathlib import Path

from src.core.agent import SAIAAgent
from src.core.goal import GoalManager
from src.core.metrics import Metrics
from src.utils.git import GitManager
from src.utils.logger import setup_logging


class Looper:
    """Main orchestration loop for GraphWiz-XR optimization."""

    def __init__(self, config: Dict[str, Any]):
        """Initialize the looper.

        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.logger = setup_logging(config.get("logging", {}))

        # Initialize components
        saia_config = config.get("saia", {})
        self.agent = SAIAAgent(
            api_key=saia_config.get("api_key"),
            model=saia_config.get("model", "meta-llama-3.1-8b-instruct"),
            max_tokens=saia_config.get("max_tokens", 8192),
            temperature=saia_config.get("temperature", 0.7)
        )

        self.goals = GoalManager()
        self.metrics = Metrics()

        # Git manager
        git_config = config.get("looper", {}).get("git", {})
        self.git = GitManager(git_config)

        # GraphWiz-specific context builder
        from src.graphwiz.context import GraphWizContextBuilder
        self.context_builder = GraphWizContextBuilder(
            config.get("graphwiz", {}).get("project_path", ".")
        )

        # State
        self.iteration = 0
        self.running = False
        self.loop_id: Optional[str] = None

    def load_project(self, project_path: str) -> None:
        """Load GraphWiz-XR project configuration and goals.

        Args:
            project_path: Path to GraphWiz-XR directory
        """
        project_path = Path(project_path)
        config_file = project_path / "packages/services/agent-looper/python/config/config.yaml"
        goals_file = project_path / "packages/services/agent-looper/python/config/goals.yaml"

        if config_file.exists():
            self.logger.info(f"Loading GraphWiz-XR config from {config_file}")
            import yaml
            with open(config_file) as f:
                project_config = yaml.safe_load(f)
                self.config.update(project_config)

        if goals_file.exists():
            self.logger.info(f"Loading GraphWiz-XR goals from {goals_file}")
            self.goals.load_from_yaml(goals_file)

    def analyze_phase(self) -> str:
        """Analyze current state and identify improvements."""
        self.logger.info("Starting analysis phase")

        # Build GraphWiz-XR specific context
        project_context = self.context_builder.build_context()
        goals_description = self._describe_goals()
        current_state = self.metrics.to_json()

        analysis = self.agent.analyze(project_context, goals_description, current_state)
        self.logger.info(f"Analysis complete: {len(analysis)} characters")

        return analysis

    def plan_phase(self, analysis: str) -> str:
        """Create optimization plan based on analysis."""
        self.logger.info("Starting planning phase")

        issues = self._extract_issues(analysis)
        constraints = self.config.get("looper", {}).get("constraints")

        plan = self.agent.plan(issues, constraints)
        self.logger.info(f"Planning complete: {len(plan)} characters")

        return plan

    def execute_phase(self, plan: str) -> bool:
        """Execute optimization plan."""
        self.logger.info("Starting execution phase")

        actions = self._parse_plan(plan)

        for action in actions:
            self.logger.info(f"Executing action: {action['description']}")

            try:
                if action.get("requires_code"):
                    code = self.agent.generate_code(
                        action["task"],
                        action.get("context", ""),
                        action.get("existing_code")
                    )
                    # Apply code changes through GraphWiz integrator
                    from src.graphwiz.integrator import GraphWizIntegrator
                    integrator = GraphWizIntegrator(self.config.get("graphwiz", {}))
                    integrator.apply_changes(code, action)

                if action.get("metric_update"):
                    metric_name, value = action["metric_update"]
                    self.metrics.update_metric(metric_name, value)

            except Exception as e:
                self.logger.error(f"Error executing action: {e}")
                return False

        self.logger.info("Execution phase complete")
        return True

    def review_phase(self, changes: str) -> bool:
        """Review changes before committing."""
        self.logger.info("Starting review phase")

        criteria = self.config.get("looper", {}).get("review_criteria")
        review = self.agent.review_changes(changes, criteria)

        self.logger.info(f"Review result: {review}")

        return "APPROVED" in review

    def commit_phase(self) -> bool:
        """Commit successful changes."""
        self.logger.info("Starting commit phase")

        git_config = self.config.get("looper", {}).get("git", {})
        auto_apply = self.config.get("looper", {}).get("auto_apply", False)

        if not auto_apply:
            self.logger.info("Auto-apply disabled, skipping commit")
            return False

        try:
            import uuid
            self.loop_id = self.loop_id or str(uuid.uuid4())
            commit_message = f"[Agent Looper {self.loop_id}] Iteration {self.iteration}"
            self.git.commit_changes(commit_message)
            self.logger.info(f"Commit successful: {commit_message}")
            return True
        except Exception as e:
            self.logger.error(f"Commit failed: {e}")
            return False

    def iterate(self) -> bool:
        """Run a single optimization iteration."""
        self.iteration += 1
        self.logger.info(f"=== Starting iteration {self.iteration} ===")

        try:
            # Analysis
            analysis = self.analyze_phase()

            # Planning
            plan = self.plan_phase(analysis)

            # Execution
            success = self.execute_phase(plan)
            if not success:
                self.logger.warning("Execution failed, skipping commit")
                return False

            # Review
            if self.review_phase("Changes from execution"):
                # Commit
                self.commit_phase()

            self.logger.info(f"=== Iteration {self.iteration} complete ===")
            return True

        except Exception as e:
            self.logger.error(f"Iteration {self.iteration} failed: {e}")
            return False

    def run(self) -> str:
        """Run the continuous optimization loop.

        Returns:
            Loop ID for tracking
        """
        import uuid
        self.loop_id = str(uuid.uuid4())
        self.running = True
        self.logger.info(f"Starting Agent Looper (ID: {self.loop_id})")

        looper_config = self.config.get("looper", {})
        max_iterations = looper_config.get("max_iterations", 100)
        interval = looper_config.get("iteration_interval", 3600)

        while self.running and self.iteration < max_iterations:
            self.iterate()

            if self.iteration < max_iterations:
                self.logger.info(f"Waiting {interval}s before next iteration...")
                time.sleep(interval)

        self.logger.info("Agent Looper stopped")
        return self.loop_id

    def stop(self) -> None:
        """Stop the optimization loop."""
        self.running = False
        self.logger.info("Stopping Agent Looper")

    def get_status(self) -> Dict[str, Any]:
        """Get current looper status.

        Returns:
            Status dictionary
        """
        return {
            "loop_id": self.loop_id,
            "running": self.running,
            "iteration": self.iteration,
            "goals": [
                {
                    "name": g.name,
                    "progress": g.progress_percentage(),
                    "completed": g.is_completed(),
                    "category": g.category.value
                }
                for g in self.goals.get_all_goals()
            ]
        }

    def _describe_goals(self) -> str:
        """Describe current optimization goals."""
        goals_list = self.goals.get_all_goals()
        return "\n".join(
            f"- {g.name}: {g.description} (Progress: {g.progress_percentage():.1f}%)"
            for g in goals_list
        )

    def _extract_issues(self, analysis: str) -> list[str]:
        """Extract issues from analysis."""
        return [analysis]

    def _parse_plan(self, plan: str) -> list[Dict[str, Any]]:
        """Parse plan into actionable steps."""
        return [{"description": plan, "requires_code": False}]


def create_looper_from_config(config_path: str) -> Looper:
    """Create a Looper instance from a config file.

    Args:
        config_path: Path to YAML configuration file

    Returns:
        Configured Looper instance
    """
    import yaml

    with open(config_path) as f:
        config = yaml.safe_load(f)

    return Looper(config)
