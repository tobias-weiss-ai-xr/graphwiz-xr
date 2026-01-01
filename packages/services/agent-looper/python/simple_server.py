#!/usr/bin/env python3
"""Simple HTTP API server for Agent Looper (without gRPC)."""

from flask import Flask, request, jsonify
from pathlib import Path
import sys

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.core.agent import SAIAAgent
from src.core.goal import GoalManager, Goal, GoalCategory
from src.core.metrics import Metrics, MetricType
from src.graphwiz.context import GraphWizContextBuilder

app = Flask(__name__)

# Global components
agent = None
goal_manager = None
metrics = None
context_builder = None

def initialize():
    """Initialize the agent components."""
    global agent, goal_manager, metrics, context_builder

    print("Initializing Agent Looper...")

    # Initialize agent
    agent = SAIAAgent(model="meta-llama-3.1-8b-instruct")
    print(f"✓ SAIA Agent initialized with {len(agent.api_keys)} API keys")

    # Initialize goal manager
    goal_manager = GoalManager()

    # Add default goals
    goals = [
        Goal("webrtc_latency", "Reduce WebRTC latency", GoalCategory.PERFORMANCE,
             50.0, 100.0, "ms"),
        Goal("rendering_fps", "Increase rendering FPS", GoalCategory.PERFORMANCE,
             90.0, 60.0, "fps"),
        Goal("test_coverage", "Increase test coverage", GoalCategory.CODE_QUALITY,
             80.0, 40.0, "%")
    ]
    for goal in goals:
        goal_manager.add_goal(goal)
    print(f"✓ Goal Manager initialized with {len(goals)} goals")

    # Initialize metrics
    metrics = Metrics()
    metrics.add_metric("webrtc_latency", 100.0, MetricType.PERFORMANCE, "ms")
    metrics.add_metric("rendering_fps", 60.0, MetricType.PERFORMANCE, "fps")
    metrics.add_metric("test_coverage", 40.0, MetricType.TECHNICAL, "%")
    print(f"✓ Metrics initialized with {len(metrics.metrics)} metrics")

    # Initialize context builder
    project_path = Path("/opt/git/graphwiz-xr")
    context_builder = GraphWizContextBuilder(str(project_path))
    print("✓ Context Builder initialized")

    print("✓ Agent Looper ready!")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "agent-looper",
        "components": {
            "agent": agent is not None,
            "goals": goal_manager is not None,
            "metrics": metrics is not None,
            "context": context_builder is not None
        }
    })

@app.route('/api/v1/analyze', methods=['POST'])
def analyze():
    """Analyze the project."""
    try:
        data = request.get_json()

        # Build context
        project_context = context_builder.build_context()

        # Get goals description
        goals_desc = "\n".join(
            f"- {g.name}: {g.description} ({g.current_value}{g.unit} → {g.target_value}{g.unit})"
            for g in goal_manager.get_all_goals()
        )

        # Get current state
        current_state = metrics.to_json()

        # Request analysis
        analysis = agent.analyze(project_context, goals_desc, current_state)

        return jsonify({
            "success": True,
            "analysis": analysis,
            "timestamp": metrics.timestamp
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/v1/plan', methods=['POST'])
def plan():
    """Create an optimization plan."""
    try:
        data = request.get_json()
        issues = data.get('issues', [])
        constraints = data.get('constraints', '')

        plan = agent.plan(issues, constraints)

        return jsonify({
            "success": True,
            "plan": plan
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/v1/goals', methods=['GET', 'POST'])
def goals():
    """Get or set goals."""
    if request.method == 'GET':
        return jsonify({
            "success": True,
            "goals": [g.to_dict() for g in goal_manager.get_all_goals()],
            "overall_progress": goal_manager.overall_progress()
        })
    else:
        try:
            data = request.get_json()
            goal = Goal(
                name=data['name'],
                description=data['description'],
                category=GoalCategory(data['category']),
                target_value=float(data['target_value']),
                current_value=float(data.get('current_value', 0)),
                unit=data.get('unit', 'value')
            )
            goal_manager.add_goal(goal)
            return jsonify({
                "success": True,
                "goal": goal.to_dict()
            })
        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500

@app.route('/api/v1/metrics', methods=['GET'])
def get_metrics():
    """Get current metrics."""
    return jsonify({
        "success": True,
        "metrics": metrics.to_dict()
    })

@app.route('/api/v1/chat', methods=['POST'])
def chat():
    """Send a chat message to the agent."""
    try:
        data = request.get_json()
        message = data.get('message', '')

        response = agent.chat(message)

        return jsonify({
            "success": True,
            "response": response
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with information."""
    return jsonify({
        "service": "Agent Looper",
        "version": "0.1.0",
        "status": "running",
        "endpoints": {
            "health": "GET /health",
            "analyze": "POST /api/v1/analyze",
            "plan": "POST /api/v1/plan",
            "goals": "GET/POST /api/v1/goals",
            "metrics": "GET /api/v1/metrics",
            "chat": "POST /api/v1/chat"
        }
    })

if __name__ == '__main__':
    initialize()
    print("\n" + "=" * 60)
    print("Agent Looper HTTP API Server")
    print("=" * 60)
    print("Server starting on http://0.0.0.0:50051")
    print("=" * 60)
    app.run(host='0.0.0.0', port=50051, debug=False)
