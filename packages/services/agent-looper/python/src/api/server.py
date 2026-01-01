"""gRPC server for Agent Looper service."""

import asyncio
import logging
from typing import Dict, Any
from concurrent import futures
import grpc
from pathlib import Path
import sys

# Add protocol package to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent.parent / "shared" / "protocol" / "python"))

# Import generated protobuf classes
from agent import agent_pb2, agent_pb2_grpc


class AgentLooperServicer(agent_pb2_grpc.AgentLooperServicer):
    """Implements the Agent Looper gRPC service."""

    def __init__(self, looper):
        """Initialize servicer.

        Args:
            looper: Looper instance
        """
        self.looper = looper
        self.logger = logging.getLogger(__name__)
        self.active_loops: Dict[str, Any] = {}

    def StartLoop(self, request, context):
        """Start an optimization loop."""
        try:
            import yaml

            # Load configuration
            config_path = Path(request.project_path) / "packages/services/agent-looper/python/config/config.yaml"
            with open(config_path) as f:
                config = yaml.safe_load(f)

            # Create and configure looper
            from src.core.looper import Looper
            looper = Looper(config)
            looper.load_project(request.project_path)

            # Start loop in background
            loop_id = looper.run()
            self.active_loops[loop_id] = looper

            self.logger.info(f"Started optimization loop: {loop_id}")

            return agent_pb2.LoopResponse(
                success=True,
                loop_id=loop_id,
                message=f"Optimization loop started with ID: {loop_id}"
            )

        except Exception as e:
            self.logger.error(f"Failed to start loop: {e}")
            return agent_pb2.LoopResponse(
                success=False,
                loop_id="",
                message=str(e)
            )

    def StopLoop(self, request, context):
        """Stop an optimization loop."""
        try:
            if request.loop_id not in self.active_loops:
                return agent_pb2.LoopResponse(
                    success=False,
                    loop_id=request.loop_id,
                    message="Loop ID not found"
                )

            looper = self.active_loops[request.loop_id]
            looper.stop()
            del self.active_loops[request.loop_id]

            self.logger.info(f"Stopped optimization loop: {request.loop_id}")

            return agent_pb2.LoopResponse(
                success=True,
                loop_id=request.loop_id,
                message="Optimization loop stopped"
            )

        except Exception as e:
            self.logger.error(f"Failed to stop loop: {e}")
            return agent_pb2.LoopResponse(
                success=False,
                loop_id=request.loop_id,
                message=str(e)
            )

    def GetStatus(self, request, context):
        """Get status of an optimization loop."""
        try:
            if request.loop_id not in self.active_loops:
                return agent_pb2.StatusResponse(
                    loop_id=request.loop_id,
                    running=False,
                    iteration=0,
                    current_phase="not_found",
                    goals=[],
                    started_at=0,
                    last_activity=0
                )

            looper = self.active_loops[request.loop_id]
            status = looper.get_status()

            # Convert goals to protobuf
            goal_statuses = []
            for goal in status.get("goals", []):
                goal_statuses.append(agent_pb2.GoalStatus(
                    name=goal.get("name", ""),
                    progress=goal.get("progress", 0.0),
                    completed=goal.get("completed", False),
                    category=goal.get("category", "")
                ))

            return agent_pb2.StatusResponse(
                loop_id=status.get("loop_id", request.loop_id),
                running=status.get("running", False),
                iteration=status.get("iteration", 0),
                current_phase="analyzing",  # Would be tracked in real implementation
                goals=goal_statuses,
                started_at=0,  # Would be tracked
                last_activity=0  # Would be tracked
            )

        except Exception as e:
            self.logger.error(f"Failed to get status: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return agent_pb2.StatusResponse()

    def SubmitGoal(self, request, context):
        """Submit a new optimization goal."""
        try:
            # This would add a goal to the looper
            self.logger.info(f"Goal submitted: {request.goal.name}")

            return agent_pb2.GoalResponse(
                success=True,
                message=f"Goal '{request.goal.name}' submitted successfully",
                goal=request.goal
            )

        except Exception as e:
            self.logger.error(f"Failed to submit goal: {e}")
            return agent_pb2.GoalResponse(
                success=False,
                message=str(e)
            )

    def Analyze(self, request, context):
        """Request immediate analysis."""
        try:
            looper = self.active_loops.get(request.loop_id)
            if not looper:
                return agent_pb2.AnalyzeResponse(
                    success=False,
                    analysis="",
                    recommendations=[],
                    issues=[]
                )

            # Trigger analysis phase
            analysis = looper.analyze_phase()

            return agent_pb2.AnalyzeResponse(
                success=True,
                analysis=analysis,
                recommendations=[],  # Would parse from analysis
                issues=[]  # Would parse from analysis
            )

        except Exception as e:
            self.logger.error(f"Failed to analyze: {e}")
            return agent_pb2.AnalyzeResponse(
                success=False,
                analysis=str(e),
                recommendations=[],
                issues=[]
            )

    def ReviewChanges(self, request, context):
        """Approve or reject changes."""
        try:
            # This would handle the review decision
            decision = request.decision
            self.logger.info(f"Review decision: {decision} for iteration {request.iteration_id}")

            return agent_pb2.ReviewResponse(
                success=True,
                message=f"Changes {decision}ed",
                applied=(decision == "approve")
            )

        except Exception as e:
            self.logger.error(f"Failed to review changes: {e}")
            return agent_pb2.ReviewResponse(
                success=False,
                message=str(e),
                applied=False
            )

    def GetMetrics(self, request, context):
        """Get optimization metrics."""
        try:
            looper = self.active_loops.get(request.loop_id)
            if not looper:
                return agent_pb2.MetricsResponse(metrics=[])

            metrics = looper.metrics.to_dict()

            metric_list = []
            for name, data in metrics.get("metrics", {}).items():
                metric_list.append(agent_pb2.Metric(
                    name=name,
                    value=data["value"],
                    unit=data["unit"],
                    timestamp=int(data.get("timestamp", 0)),
                    labels=data.get("metadata", {})
                ))

            return agent_pb2.MetricsResponse(metrics=metric_list)

        except Exception as e:
            self.logger.error(f"Failed to get metrics: {e}")
            return agent_pb2.MetricsResponse(metrics=[])


def serve(port: int = 50051, looper=None):
    """Start the gRPC server.

    Args:
        port: Port to listen on
        looper: Looper instance (optional)
    """
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    servicer = AgentLooperServicer(looper)

    # Register servicer with generated code
    agent_pb2_grpc.add_AgentLooperServicer_to_server(servicer, server)

    server.add_insecure_port(f"[::]:{port}")
    server.start()

    logging.info(f"Agent Looper gRPC server started on port {port}")

    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(0)
        logging.info("Server stopped")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    serve()
