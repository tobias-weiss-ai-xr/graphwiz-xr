#!/usr/bin/env python3
"""Test core Agent Looper functionality without gRPC."""

import sys
from pathlib import Path

# Add src to path
script_dir = Path(__file__).parent
sys.path.insert(0, str(script_dir / "src"))

def test_saia_connection():
    """Test SAIA API connection."""
    print("=" * 60)
    print("Testing SAIA API Connection")
    print("=" * 60)

    try:
        from src.core.agent import SAIAAgent

        # Initialize agent
        agent = SAIAAgent(model="meta-llama-3.1-8b-instruct")
        print(f"✓ Agent initialized")
        print(f"  - Model: {agent.model}")
        print(f"  - API Keys: {len(agent.api_keys)} available")
        print(f"  - Max Tokens: {agent.max_tokens}")
        print(f"  - Temperature: {agent.temperature}")

        return agent
    except Exception as e:
        print(f"✗ Failed to initialize agent: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_simple_chat(agent):
    """Test simple chat with SAIA."""
    print("\n" + "=" * 60)
    print("Testing Simple Chat")
    print("=" * 60)

    try:
        response = agent.chat("Hello! Can you help me optimize a VR platform?")
        print(f"✓ Chat successful")
        print(f"  Response preview: {response[:200]}...")
        return True
    except Exception as e:
        print(f"✗ Chat failed: {e}")
        return False

def test_graphwiz_context():
    """Test GraphWiz context builder."""
    print("\n" + "=" * 60)
    print("Testing GraphWiz Context Builder")
    print("=" * 60)

    try:
        from src.graphwiz.context import GraphWizContextBuilder

        project_path = script_dir.parent.parent.parent.parent.parent
        builder = GraphWizContextBuilder(str(project_path))

        context = builder.build_context()
        print(f"✓ Context built")
        print(f"  - Length: {len(context)} characters")
        print(f"  - Preview:\n{context[:500]}...")

        return True
    except Exception as e:
        print(f"✗ Context builder failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_goal_management():
    """Test goal management."""
    print("\n" + "=" * 60)
    print("Testing Goal Management")
    print("=" * 60)

    try:
        from src.core.goal import GoalManager, Goal, GoalCategory

        manager = GoalManager()

        # Create test goals
        goals = [
            Goal(
                name="latency",
                description="Reduce WebRTC latency",
                category=GoalCategory.PERFORMANCE,
                target_value=50.0,
                current_value=100.0,
                unit="ms"
            ),
            Goal(
                name="fps",
                description="Increase rendering FPS",
                category=GoalCategory.PERFORMANCE,
                target_value=90.0,
                current_value=60.0,
                unit="fps"
            )
        ]

        for goal in goals:
            manager.add_goal(goal)
            print(f"✓ Added goal: {goal.name} ({goal.progress_percentage():.1f}%)")

        print(f"  - Total goals: {len(manager.get_all_goals())}")
        print(f"  - Overall progress: {manager.overall_progress():.1f}%")

        return True
    except Exception as e:
        print(f"✗ Goal management failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_metrics():
    """Test metrics collection."""
    print("\n" + "=" * 60)
    print("Testing Metrics Collection")
    print("=" * 60)

    try:
        from src.core.metrics import Metrics, MetricType

        metrics = Metrics()

        # Add test metrics
        metrics.add_metric("webrtc_latency", 100.0, MetricType.PERFORMANCE, "ms")
        metrics.add_metric("fps", 60.0, MetricType.PERFORMANCE, "fps")
        metrics.add_metric("concurrent_users", 50, MetricType.TECHNICAL, "users")

        print(f"✓ Metrics added")
        print(f"  - Total metrics: {len(metrics.metrics)}")
        print(f"  - Average value: {metrics.calculate_average():.2f}")
        print(f"  - Performance avg: {metrics.calculate_average(MetricType.PERFORMANCE):.2f}")

        # Export to JSON
        json_output = metrics.to_json()
        print(f"  ✓ JSON export: {len(json_output)} characters")

        return True
    except Exception as e:
        print(f"✗ Metrics failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("\n🧪 Agent Looper - Core Functionality Tests")
    print("Testing without gRPC/protobuf dependencies\n")

    results = []

    # Test SAIA connection
    agent = test_saia_connection()
    results.append(("SAIA Initialization", agent is not None))

    # Test simple chat
    if agent:
        results.append(("SAIA Chat", test_simple_chat(agent)))

    # Test other components
    results.append(("GraphWiz Context", test_graphwiz_context()))
    results.append(("Goal Management", test_goal_management()))
    results.append(("Metrics Collection", test_metrics()))

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
