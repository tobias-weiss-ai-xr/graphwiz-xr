"""SAIA AI agent implementation with API key rotation.

Adapted for GraphWiz-XR optimization.
"""

import os
import threading
from typing import Optional, List, Dict, Any
import requests


class SAIAAgent:
    """SAIA AI agent with automatic API key rotation."""

    BASE_URL = "https://chat-ai.academiccloud.de/v1"
    AVAILABLE_MODELS = {
        # Text models
        "meta-llama-3.1-8b-instruct": {"context": 128000, "thinking": False, "images": False, "code": False},
        "openai-gpt-oss-120b": {"context": 128000, "thinking": False, "images": False, "code": False},
        "llama-3.1-sauerkrautlm-70b-instruct": {"context": 128000, "thinking": False, "images": False, "code": False},
        "llama-3.3-70b-instruct": {"context": 128000, "thinking": False, "images": False, "code": False},
        "gemma-3-27b-it": {"context": 128000, "thinking": False, "images": True, "code": False},
        "mistral-large-instruct": {"context": 128000, "thinking": False, "images": False, "code": False},
        "qwen3-32b": {"context": 32768, "thinking": False, "images": False, "code": False},
        "qwen3-235b-a22b": {"context": 32768, "thinking": True, "images": False, "code": False},

        # Code models
        "qwen2.5-coder-32b-instruct": {"context": 32768, "thinking": False, "images": False, "code": True},
        "qwen3-coder-7b": {"context": 32768, "thinking": False, "images": False, "code": True},
        "qwen3-coder-14b": {"context": 32768, "thinking": False, "images": False, "code": True},
        "codestral-22b": {"context": 32000, "thinking": False, "images": False, "code": True},

        # Vision models
        "internvl2.5-8b": {"context": 8192, "thinking": False, "images": True, "code": False},
        "qwen2.5-vl-72b-instruct": {"context": 32768, "thinking": False, "images": True, "code": False},

        # Reasoning models
        "qwq-32b": {"context": 32768, "thinking": True, "images": False, "code": False},
        "deepseek-r1": {"context": 64000, "thinking": True, "images": False, "code": False},
    }

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "meta-llama-3.1-8b-instruct",
        max_tokens: int = 4096,
        temperature: float = 0.7
    ):
        """Initialize the SAIA agent."""
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.api_keys: List[str] = []
        self.current_key_index = 0
        self.key_lock = threading.Lock()

        self._load_api_keys()

        if api_key:
            self.api_keys = [api_key]

        if not self.api_keys:
            raise ValueError(
                "SAIA API keys not configured. Set SAIA_API_KEYS environment variable "
                "or create .saia-keys file"
            )

    def _load_api_keys(self) -> None:
        """Load API keys from environment or file."""
        keys_env = os.getenv("SAIA_API_KEYS", "")
        if keys_env:
            self.api_keys = [k.strip() for k in keys_env.split(",") if k.strip()]
            return

        single_key = os.getenv("SAIA_API_KEY", "")
        if single_key:
            self.api_keys = [single_key]
            return

        key_file = os.path.join(os.getcwd(), ".saia-keys")
        if os.path.exists(key_file):
            with open(key_file) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        self.api_keys.append(line)

    def _get_next_api_key(self) -> str:
        """Get the next API key in rotation."""
        with self.key_lock:
            key = self.api_keys[self.current_key_index]
            self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
            return key

    def _make_request(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False
    ) -> str:
        """Make a request to the SAIA API."""
        url = f"{self.BASE_URL}/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self._get_next_api_key()}",
            "Accept": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "stream": stream
        }

        response = requests.post(url, json=payload, headers=headers, timeout=120)

        if response.status_code != 200:
            raise RuntimeError(
                f"SAIA API error (status {response.status_code}): {response.text}"
            )

        data = response.json()

        if "choices" not in data or len(data["choices"]) == 0:
            raise ValueError("No choices in SAIA response")

        return data["choices"][0]["message"]["content"]

    def analyze(
        self,
        project_context: str,
        goals: str,
        current_state: Optional[str] = None
    ) -> str:
        """Analyze GraphWiz-XR and identify optimization opportunities."""
        system_prompt = """You are an expert optimization agent for GraphWiz-XR, a browser-based VR platform.
Analyze the given project and identify specific, actionable improvements.

Focus areas:
- WebRTC performance (latency, SFU optimization)
- 3D rendering performance (Three.js, React Three Fiber)
- Network optimization (WebTransport, HTTP/3)
- User experience (loading times, interaction smoothness)
- Code quality (test coverage, security, documentation)

Provide your response in the following format:
1. Current State Analysis
2. Identified Issues
3. Optimization Opportunities (prioritized by impact)
4. Recommended Actions
5. Expected Outcomes"""

        user_message = f"""Project Context:
{project_context}

Optimization Goals:
{goals}"""

        if current_state:
            user_message += f"\n\nCurrent State:\n{current_state}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]

        return self._make_request(messages)

    def plan(self, issues: List[str], constraints: Optional[str] = None) -> str:
        """Create an optimization plan."""
        system_prompt = """You are an expert optimization planner for GraphWiz-XR.
Create a detailed, step-by-step plan to address the given issues.

Your plan should:
1. Prioritize actions by impact and effort
2. Consider dependencies between actions
3. Include testing and validation steps
4. Minimize risk and allow for rollbacks
5. Consider VR-specific constraints (performance, compatibility)

Format your response as a numbered list of actions with:
- Description
- Expected impact
- Estimated complexity
- Dependencies
- Risk level"""

        user_message = f"Issues to address:\n" + "\n".join(f"- {issue}" for issue in issues)

        if constraints:
            user_message += f"\n\nConstraints:\n{constraints}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]

        return self._make_request(messages)

    def generate_code(
        self,
        task: str,
        context: str,
        existing_code: Optional[str] = None
    ) -> str:
        """Generate code for a specific task."""
        system_prompt = """You are an expert software developer for GraphWiz-XR.
Generate clean, well-documented code that follows best practices.

Your response should include:
1. Brief explanation of the approach
2. The code implementation
3. Any notes about testing or integration

Focus on:
- Code quality and maintainability
- Performance (critical for VR)
- Security
- Error handling
- TypeScript/Rust best practices"""

        user_message = f"Task: {task}\n\nContext:\n{context}"

        if existing_code:
            user_message += f"\n\nExisting Code:\n```\n{existing_code}\n```"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]

        return self._make_request(messages)

    def review_changes(self, changes: str, criteria: Optional[str] = None) -> str:
        """Review proposed changes."""
        system_prompt = """You are an expert code reviewer for GraphWiz-XR.
Review the proposed changes and provide feedback.

Your review should cover:
1. Correctness and functionality
2. Code quality and style
3. Performance implications (critical for VR)
4. Security considerations
5. Testing recommendations
6. VR compatibility

End your review with one of:
- APPROVED: Changes are ready to apply
- CONDITIONAL: Changes need minor adjustments (specify)
- REJECTED: Changes need significant revision (explain)"""

        user_message = f"Changes to review:\n{changes}"

        if criteria:
            user_message += f"\n\nReview Criteria:\n{criteria}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]

        return self._make_request(messages)

    def chat(self, message: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> str:
        """Send a chat message."""
        messages = conversation_history.copy() if conversation_history else []
        messages.append({"role": "user", "content": message})

        return self._make_request(messages)
