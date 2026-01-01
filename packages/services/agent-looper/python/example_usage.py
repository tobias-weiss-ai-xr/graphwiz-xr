#!/usr/bin/env python3
"""Example: Using Agent Looper to optimize GraphWiz-XR

This example shows how to use the Agent Looper to analyze and optimize
the GraphWiz-XR VR platform without needing the gRPC server.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.core.agent import SAIAAgent
from src.core.goal import GoalManager, Goal, GoalCategory
from src.core.metrics import Metrics, MetricType
from src.graphwiz.context import GraphWizContextBuilder


def main():
    print("=" * 70)
    print("Agent Looper - GraphWiz-XR Optimization Example")
    print("=" * 70)

    # 1. Initialize the SAIA Agent
    print("\n📊 Step 1: Initializing SAIA Agent...")
    agent = SAIAAgent(
        model="meta-llama-3.1-8b-instruct",
        max_tokens=4096,
        temperature=0.7
    )
    print(f"✓ Agent ready with {len(agent.api_keys)} API keys")

    # 2. Build GraphWiz-XR Context
    print("\n🏗️  Step 2: Building GraphWiz-XR Context...")
    project_path = Path(__file__).parent.parent.parent.parent.parent
    context_builder = GraphWizContextBuilder(str(project_path))
    project_context = context_builder.build_context()
    print(f"✓ Context built ({len(project_context)} characters)")

    # 3. Set up optimization goals
    print("\n🎯 Step 3: Setting Optimization Goals...")
    goal_manager = GoalManager()

    goals = [
        Goal(
            name="webrtc_latency",
            description="Reduce WebRTC end-to-end latency",
            category=GoalCategory.PERFORMANCE,
            target_value=50.0,
            current_value=100.0,
            unit="ms",
            metadata={"service": "reticulum/sfu", "priority": "high"}
        ),
        Goal(
            name="rendering_fps",
            description="Achieve 90 FPS on Quest 2",
            category=GoalCategory.PERFORMANCE,
            target_value=90.0,
            current_value=60.0,
            unit="fps",
            metadata={"service": "hub-client", "priority": "high"}
        ),
        Goal(
            name="test_coverage",
            description="Increase test coverage to 80%",
            category=GoalCategory.CODE_QUALITY,
            target_value=80.0,
            current_value=40.0,
            unit="%",
            metadata={"priority": "medium"}
        )
    ]

    for goal in goals:
        goal_manager.add_goal(goal)
        print(f"  ✓ {goal.name}: {goal.current_value}{goal.unit} → {goal.target_value}{goal.unit}")

    # 4. Initialize metrics
    print("\n📈 Step 4: Initializing Metrics...")
    metrics = Metrics()

    # Add current metrics
    metrics.add_metric("webrtc_latency", 100.0, MetricType.PERFORMANCE, "ms")
    metrics.add_metric("rendering_fps", 60.0, MetricType.PERFORMANCE, "fps")
    metrics.add_metric("test_coverage", 40.0, MetricType.TECHNICAL, "%")
    metrics.add_metric("concurrent_users", 50, MetricType.TECHNICAL, "users")
    print(f"✓ Tracking {len(metrics.metrics)} metrics")

    # 5. Request analysis from SAIA
    print("\n🤖 Step 5: Requesting Analysis from SAIA...")
    print("Contacting SAIA API...")

    goals_description = "\n".join(
        f"- {g.name}: {g.description} (Current: {g.current_value}{g.unit}, Target: {g.target_value}{g.unit})"
        for g in goal_manager.get_all_goals()
    )

    try:
        analysis = agent.analyze(
            project_context=project_context,
            goals=goals_description,
            current_state=metrics.to_json()
        )

        print("✓ Analysis received!")
        print("\n" + "=" * 70)
        print("ANALYSIS RESULTS")
        print("=" * 70)
        print(analysis)
        print("=" * 70)

    except Exception as e:
        print(f"⚠️  Analysis failed: {e}")
        print("This is expected if SAIA API is unavailable")

    # 6. Create optimization plan
    print("\n📋 Step 6: Creating Optimization Plan...")

    issues = [
        "WebRTC latency is 2x higher than target (100ms vs 50ms)",
        "Rendering FPS is below target (60 vs 90 FPS)",
        "Test coverage needs improvement (40% vs 80%)"
    ]

    try:
        plan = agent.plan(
            issues=issues,
            constraints="Must maintain backward compatibility and pass all tests"
        )

        print("✓ Optimization plan created!")
        print("\n" + "=" * 70)
        print("OPTIMIZATION PLAN")
        print("=" * 70)
        print(plan)
        print("=" * 70)

    except Exception as e:
        print(f"⚠️  Planning failed: {e}")

    # 7. Generate code for one optimization
    print("\n💻 Step 7: Example Code Generation...")
    print("Requesting code for WebRTC optimization...")

    try:
        code = agent.generate_code(
            task="Optimize WebTransport configuration for lower latency",
            context="GraphWiz-XR uses WebTransport for real-time VR communication",
            existing_code=None
        )

        print("✓ Code generated!")
        print("\n" + "=" * 70)
        print("GENERATED CODE")
        print("=" * 70)
        print(code[:1000] + "..." if len(code) > 1000 else code)
        print("=" * 70)

    except Exception as e:
        print(f"⚠️  Code generation failed: {e}")

    # 8. Update metrics (simulating improvement)
    print("\n📊 Step 8: Simulating Optimization Results...")

    # Simulate improvements
    metrics.update_metric("webrtc_latency", 75.0)  # Improved from 100ms
    metrics.update_metric("rendering_fps", 75.0)   # Improved from 60 FPS

    print("\nUpdated Metrics:")
    for name, data in metrics.metrics.items():
        print(f"  {name}: {data['value']}{data['unit']}")

    # Update goal progress
    for goal in goal_manager.get_all_goals():
        if goal.name == "webrtc_latency":
            goal.update_progress(75.0)
        elif goal.name == "rendering_fps":
            goal.update_progress(75.0)

    print(f"\nGoal Progress:")
    for goal in goal_manager.get_all_goals():
        print(f"  {goal.name}: {goal.progress_percentage():.1f}%")

    # 9. Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"✓ Agent initialized and configured")
    print(f"✓ Project context built")
    print(f"✓ {len(goals)} optimization goals defined")
    print(f"✓ {len(metrics.metrics)} metrics tracked")
    print(f"✓ Analysis and planning completed")
    print(f"✓ Code generation demonstrated")
    print(f"✓ Overall progress: {goal_manager.overall_progress():.1f}%")
    print("\n🎉 Agent Looper is ready to optimize GraphWiz-XR!")
    print("=" * 70)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
