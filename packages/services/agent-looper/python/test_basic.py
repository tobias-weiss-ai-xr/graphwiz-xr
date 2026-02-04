#!/usr/bin/env python3
"""Basic test for Agent Looper components."""

import sys
import os
from pathlib import Path

# Add paths
script_dir = Path(__file__).parent
sys.path.insert(0, str(script_dir / "src"))

# Add protobuf path - from agent-looper/python go up to packages then to shared/protocol/python
proto_path = script_dir.parent.parent.parent / "shared" / "protocol" / "python"
print(f"Looking for protobuf at: {proto_path}")
if proto_path.exists():
    sys.path.insert(0, str(proto_path))
    print(f"✓ Added to Python path: {proto_path}")
    # Also add parent directory for 'agent' module
    sys.path.insert(0, str(proto_path / "agent"))
    print(f"✓ Added agent module to path")
else:
    print(f"✗ Warning: Proto path not found: {proto_path}")

def test_imports():
    """Test that all modules can be imported."""
    print("Testing imports...")

    try:
        from src.core.agent import SAIAAgent
        print("  ✓ SAIAAgent imported")
    except Exception as e:
        print(f"  ✗ SAIAAgent failed: {e}")
        return False

    try:
        from src.core.goal import GoalManager, Goal, GoalCategory
        print("  ✓ GoalManager imported")
    except Exception as e:
        print(f"  ✗ GoalManager failed: {e}")
        return False

    try:
        from src.core.metrics import Metrics
        print("  ✓ Metrics imported")
    except Exception as e:
        print(f"  ✗ Metrics failed: {e}")
        return False

    try:
        from src.graphwiz.context import GraphWizContextBuilder
        print("  ✓ GraphWizContextBuilder imported")
    except Exception as e:
        print(f"  ✗ GraphWizContextBuilder failed: {e}")
        return False

    try:
        from agent import agent_pb2, agent_pb2_grpc
        print("  ✓ Protobuf modules imported")
    except Exception as e:
        print(f"  ✗ Protobuf failed: {e}")
        return False

    return True

def test_saia_agent():
    """Test SAIA agent initialization."""
    print("\nTesting SAIA Agent...")

    try:
        from src.core.agent import SAIAAgent

        # Check for API keys
        key_file = Path(__file__).parent / ".saia-keys"
        if not key_file.exists():
            print("  ✗ SAIA API keys file not found")
            return False

        print(f"  ✓ API keys file found: {key_file}")

        # Try to initialize agent
        agent = SAIAAgent(model="meta-llama-3.1-8b-instruct")
        print(f"  ✓ Agent initialized with {len(agent.api_keys)} API keys")
        print(f"  ✓ Using model: {agent.model}")

        return True
    except Exception as e:
        print(f"  ✗ Agent initialization failed: {e}")
        return False

def test_goal_manager():
    """Test goal manager."""
    print("\nTesting Goal Manager...")

    try:
        from src.core.goal import GoalManager, Goal, GoalCategory

        manager = GoalManager()

        # Add a test goal
        goal = Goal(
            name="test_goal",
            description="Test goal for validation",
            category=GoalCategory.PERFORMANCE,
            target_value=100.0,
            current_value=50.0,
            unit="ms"
        )

        manager.add_goal(goal)
        print(f"  ✓ Added goal: {goal.name}")

        # Check progress
        progress = goal.progress_percentage()
        print(f"  ✓ Goal progress: {progress:.1f}%")

        return True
    except Exception as e:
        print(f"  ✗ Goal manager test failed: {e}")
        return False

def test_graphwiz_context():
    """Test GraphWiz context builder."""
    print("\nTesting GraphWiz Context Builder...")

    try:
        from src.graphwiz.context import GraphWizContextBuilder

        project_path = Path(__file__).parent.parent.parent.parent.parent
        builder = GraphWizContextBuilder(str(project_path))

        context = builder.build_context()
        print(f"  ✓ Context built successfully")
        print(f"  ✓ Context length: {len(context)} characters")

        # Check for key sections
        if "GraphWiz-XR" in context:
            print(f"  ✓ Contains GraphWiz-XR project info")

        if "WebRTC" in context:
            print(f"  ✓ Contains performance targets")

        return True
    except Exception as e:
        print(f"  ✗ Context builder test failed: {e}")
        return False

def test_protobuf():
    """Test protobuf messages."""
    print("\nTesting Protobuf Messages...")

    try:
        from agent import agent_pb2

        # Create test messages
        start_req = agent_pb2.StartRequest()
        start_req.project_path = "/test/path"
        start_req.goals.append("test_goal")
        start_req.auto_apply = False

        print(f"  ✓ StartRequest created")
        print(f"    - project_path: {start_req.project_path}")
        print(f"    - goals: {list(start_req.goals)}")
        print(f"    - auto_apply: {start_req.auto_apply}")

        goal = agent_pb2.Goal()
        goal.name = "test"
        goal.description = "Test goal"
        goal.category = "performance"
        goal.target_value = 100.0
        goal.current_value = 50.0
        goal.unit = "ms"

        print(f"  ✓ Goal message created")

        return True
    except Exception as e:
        print(f"  ✗ Protobuf test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("Agent Looper - Component Tests")
    print("=" * 60)

    results = []

    # Run tests
    results.append(("Imports", test_imports()))
    results.append(("SAIA Agent", test_saia_agent()))
    results.append(("Goal Manager", test_goal_manager()))
    results.append(("GraphWiz Context", test_graphwiz_context()))
    results.append(("Protobuf", test_protobuf()))

    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {name}: {status}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
