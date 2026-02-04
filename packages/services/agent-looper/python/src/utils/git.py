"""Git operations for Agent Looper."""

import os
import subprocess
import logging
from typing import Optional
from pathlib import Path


class GitManager:
    """Manages Git operations."""

    def __init__(self, config: dict):
        """Initialize Git manager.

        Args:
            config: Git configuration
        """
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.repo_path = Path.cwd()

    def _run_git_command(self, args: list[str]) -> str:
        """Run a git command and return output.

        Args:
            args: Git command arguments

        Returns:
            Command output

        Raises:
            subprocess.CalledProcessError: If command fails
        """
        try:
            result = subprocess.run(
                ["git"] + args,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Git command failed: {e.stderr}")
            raise

    def is_git_repo(self) -> bool:
        """Check if current directory is a git repository."""
        git_dir = self.repo_path / ".git"
        return git_dir.exists()

    def get_current_branch(self) -> Optional[str]:
        """Get current branch name."""
        try:
            return self._run_git_command(["rev-parse", "--abbrev-ref", "HEAD"])
        except subprocess.CalledProcessError:
            return None

    def create_branch(self, branch_name: str) -> bool:
        """Create a new branch.

        Args:
            branch_name: Name of the branch to create

        Returns:
            True if successful
        """
        try:
            self._run_git_command(["checkout", "-b", branch_name])
            self.logger.info(f"Created branch: {branch_name}")
            return True
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to create branch: {e}")
            return False

    def commit_changes(self, message: str) -> bool:
        """Commit all changes.

        Args:
            message: Commit message

        Returns:
            True if successful
        """
        try:
            self._run_git_command(["add", "."])
            self._run_git_command(["commit", "-m", message])
            self.logger.info(f"Committed changes: {message}")
            return True
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to commit: {e}")
            return False

    def get_status(self) -> str:
        """Get git status."""
        try:
            return self._run_git_command(["status", "--porcelain"])
        except subprocess.CalledProcessError:
            return ""

    def has_changes(self) -> bool:
        """Check if there are uncommitted changes."""
        return bool(self.get_status())

    def push_changes(self, remote: str = "origin", branch: Optional[str] = None) -> bool:
        """Push changes to remote.

        Args:
            remote: Remote name
            branch: Branch name (defaults to current branch)

        Returns:
            True if successful
        """
        if branch is None:
            branch = self.get_current_branch()

        try:
            self._run_git_command(["push", remote, branch])
            self.logger.info(f"Pushed changes to {remote}/{branch}")
            return True
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Failed to push: {e}")
            return False
