# Cognitive Quality Assurance Guide for GraphWiz-XR

This guide implements the cognitive QA architecture from [GraphWiz.ai](https://graphwiz.ai/ai/cognitive-quality-assurance/), providing a comprehensive framework for AI-assisted testing of the GraphWiz-XR VR/Social platform.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Persona-Based Testing](#persona-based-testing)
4. [RAG-Based Requirement Testing](#rag-based-requirement-testing)
5. [Mutation Testing Pipeline](#mutation-testing-pipeline)
6. [Automated Validation (VALTEST)](#automated-validation-valtest)
7. [Quality Rubrics](#quality-rubrics)
8. [Getting Started](#getting-started)

## Overview

The Cognitive QA framework transforms AI from a generic code generator into a specialized testing expert through:

- **Persona Adoption**: Role-based testing with specialized expertise
- **RAG Integration**: Requirement-based test generation from documentation
- **Mutation Testing**: Quality validation through mutation score analysis
- **Automated Validation**: VALTEST pipeline for comprehensive test validation
- **Chain-of-Thought**: Structured reasoning for test generation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cognitive QA Framework                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Persona    │  │     RAG      │  │   Mutation   │     │
│  │   Agents     │  │   Indexer    │  │    Tester    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │             │
│         └─────────────────┴──────────────────┘             │
│                           │                                 │
│                   ┌───────▼────────┐                        │
│                   │  Validation    │                        │
│                   │   Pipeline     │                        │
│                   │   (VALTEST)    │                        │
│                   └───────┬────────┘                        │
│                           │                                 │
│                   ┌───────▼────────┐                        │
│                   │ Quality Rubrics│                        │
│                   │   & Metrics    │                        │
│                   └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Persona-Based Testing

### Available Personas

#### 1. Senior QA Automation Engineer
- **Expertise**: TypeScript, Rust, WebRTC, Performance testing
- **Mindset**: Security-first, quality-focused, edge-case oriented
- **Best for**: Unit tests, integration tests, general test generation

#### 2. XR/VR Testing Specialist
- **Expertise**: WebXR API, Three.js, VR devices, Spatial audio
- **Mindset**: User experience focused, immersion-critical
- **Best for**: XR rendering tests, VR input tests, 3D graphics validation

#### 3. Security Testing Expert
- **Expertise**: OWASP Top 10, Authentication, WebSocket security
- **Mindset**: Attack-oriented, defensive thinking
- **Best for**: Security tests, input validation, penetration testing

#### 4. Performance Analyst
- **Expertise**: Load testing, Memory profiling, Network optimization
- **Mindset**: Metrics-driven, optimization-focused
- **Best for**: Performance tests, load tests, scalability tests

#### 5. Integration Testing Architect
- **Expertise**: Microservice integration, Database validation, API contracts
- **Mindset**: System-wide perspective, data-flow oriented
- **Best for**: Integration tests, E2E tests, API contract tests

### Using Personas

```bash
# Generate test plan with Senior QA Engineer persona
node .qa/agents/qa-agent.ts plan packages/clients/hub-client/src/networking \
  --persona senior_qa_engineer

# Generate security tests with Security Expert persona
node .qa/agents/qa-agent.ts plan packages/services/reticulum/auth/src \
  --persona security_expert

# Generate XR tests with XR Specialist persona
node .qa/agents/qa-agent.ts plan packages/clients/hub-client/src/xr \
  --persona xr_specialist
```

## RAG-Based Requirement Testing

### Overview

RAG (Retrieval-Augmented Generation) retrieves business requirements from documentation and generates tests that validate actual business logic rather than just code structure.

### Features

- **Semantic Chunking**: Intelligently segments documentation
- **Multi-Index Retrieval**: Searches both requirements and code
- **Requirement Alignment**: Tests align with actual business rules
- **Traceability**: Links tests back to source requirements

### Usage

```bash
# Initialize RAG system and index requirements
node .qa/rag/requirement-indexer.ts init

# Generate tests for a component based on requirements
node .qa/rag/requirement-indexer.ts generate packages/clients/hub-client/src/networking
```

### Requirement Ingestion

The system ingests requirements from:
- Implementation summaries (e.g., `NETWORKING_IMPLEMENTATION_SUMMARY.md`)
- Feature documentation
- API specifications
- Test case documentation

### Semantic Chunking Strategies

1. **Semantic Chunking**: Groups related sentences thematically
2. **Agentic Chunking**: Organizes by action blocks (Arrange-Act-Assert)
3. **Parent-Child Indexing**: Maintains context while allowing granular retrieval

## Mutation Testing Pipeline

### Overview

Mutation testing validates test quality by measuring how well tests detect artificial faults (mutations) injected into the code.

### Metrics

- **Mutation Score**: Percentage of mutations detected by tests
- **Killed**: Mutations that caused tests to fail (good!)
- **Survived**: Mutations that tests didn't catch (bad!)
- **Timeout**: Mutations that caused infinite loops or excessive execution time

### Mutation Operators

#### TypeScript/JavaScript
- Binary operators (`===` → `!==`, `&&` → `||`)
- Boolean literals (`true` ↔ `false`)
- Arithmetic operators (`+` → `-`, `*` → `/`)
- Relational operators (`>` → `<`, `>=` → `<=`)

#### Rust
- Binary operators (`==` → `!=`, `&&` → `||`)
- Boolean literals (`true` ↔ `false`)
- Relational operators (`>` → `<`)

### Usage

```bash
# Run mutation testing on a component
node .qa/validators/mutation-tester.ts test packages/clients/hub-client/src/networking

# Generate mutation report
node .qa/validators/mutation-tester.ts test packages/services/reticulum/auth/src
```

### Interpreting Results

- **80%+**: Excellent - Tests are robust
- **60-79%**: Good - Room for improvement
- **40-59%**: Acceptable - Needs improvement
- **<40%**: Poor - Tests need significant work

## Automated Validation (VALTEST)

### Overview

VALTEST is a comprehensive validation pipeline that ensures AI-generated tests are high-quality through multiple validation stages.

### Validation Stages

#### Stage 1: Compilation Check
- Verifies code compiles without errors
- Checks TypeScript types and Rust compilation
- **Weight**: 30% of overall score

#### Stage 2: Test Execution
- Runs all tests and verifies they pass
- Checks for flaky tests
- **Weight**: 30% of overall score

#### Stage 3: Coverage Check
- Measures code coverage
- **Target**: 70%+ for good quality
- **Weight**: 20% of overall score

#### Stage 4: Mutation Testing
- Measures mutation score
- **Target**: 60%+ for acceptable, 80%+ for excellent
- **Weight**: 20% of overall score

### Usage

```bash
# Run complete validation pipeline
node .qa/validators/validation-pipeline.ts validate packages/clients/hub-client/src/networking

# Pipeline exits with error code if validation fails
node .qa/validators/validation-pipeline.ts validate packages/services/reticulum/auth/src
```

### Quality Levels

- **Excellent** (85%+): Ready for production
- **Good** (70-84%): Minor improvements needed
- **Acceptable** (60-69%): Improvements recommended
- **Poor** (<60%): Significant work needed

## Quality Rubrics

### Test Quality Criteria

#### 1. Correctness (30%)
- Tests validate actual requirements
- No false positives or false negatives
- Accurate assertions

#### 2. Coverage (25%)
- Line coverage > 70%
- Branch coverage > 60%
- Edge cases covered

#### 3. Maintainability (20%)
- Clear, descriptive test names
- Follows naming conventions
- Well-documented
- DRY principle (Don't Repeat Yourself)

#### 4. Performance (15%)
- Fast execution (< 5 seconds per test)
- No unnecessary setups
- Efficient mocking

#### 5. Reliability (10%)
- Deterministic (no flakiness)
- Independent tests
- Proper setup/teardown

### Component-Specific Rubrics

#### Networking Components
- **Must test**: Connection lifecycle, error handling, reconnection logic
- **Coverage target**: 95%+
- **Mutation score target**: 80%+
- **Special considerations**: Race conditions, timeouts

#### Authentication Components
- **Must test**: OWASP Top 10, JWT validation, OAuth flows
- **Coverage target**: 90%+
- **Mutation score target**: 85%+
- **Security tests**: Required

#### XR/VR Components
- **Must test**: Device compatibility, performance (60fps), input handling
- **Coverage target**: 70%+
- **Visual tests**: Baseline comparison
- **Special considerations**: Frame rate, memory leaks

#### WebRTC/SFU Components
- **Must test**: Latency, throughput, packet loss, jitter
- **Coverage target**: 80%+
- **Performance tests**: Required
- **Load tests**: Required

## Getting Started

### 1. Setup

```bash
# Install dependencies (if not already installed)
npm install --save-dev typescript @types/node

# Make scripts executable
chmod +x .qa/agents/qa-agent.ts
chmod +x .qa/rag/requirement-indexer.ts
chmod +x .qa/validators/mutation-tester.ts
chmod +x .qa/validators/validation-pipeline.ts
```

### 2. Run Initial Analysis

```bash
# Generate test plan for networking component
node .qa/agents/qa-agent.ts plan packages/clients/hub-client/src/networking

# Run validation pipeline
node .qa/validators/validation-pipeline.ts validate packages/clients/hub-client/src/networking
```

### 3. Iterate Based on Feedback

The validation pipeline will provide recommendations:

```
🔴 [CRITICAL] Low mutation score (45%). Add tests for edge cases
   Action: Identify surviving mutations and add targeted tests

🟠 [HIGH] Increase coverage to at least 70%
   Action: Add tests for uncovered code paths
```

### 4. Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/qa-validation.yml
name: Cognitive QA Validation

on: [pull_request]

jobs:
  qa-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Run QA Validation
        run: |
          node .qa/validators/validation-pipeline.ts validate packages/clients/hub-client/src/networking
          node .qa/validators/validation-pipeline.ts validate packages/services/reticulum/auth/src
```

## Advanced Usage

### Chain-of-Thought Test Generation

The framework uses CoT reasoning to generate better tests:

```bash
# The agent will:
# 1. Explication: Understand the component
# 2. Planning: Design test strategy
# 3. Refinement: Validate completeness
# 4. Implementation: Generate test code
```

### Custom Personas

Create custom personas in `.qa/prompts/personas.yaml`:

```yaml
personas:
  my_custom_persona:
    name: "My Custom QA Engineer"
    expertise:
      - "Specific technology"
      - "Domain knowledge"
    mindset: "Quality philosophy"
    temperature: 0.1
    top_p: 0.9
```

### Multi-Component Validation

Validate multiple components at once:

```bash
for component in packages/clients/hub-client/src/*/; do
  node .qa/validators/validation-pipeline.ts validate "$component"
done
```

## Best Practices

1. **Start with personas**: Choose the right persona for your component
2. **Use RAG for business logic**: Retrieve requirements before generating tests
3. **Always run mutation testing**: It's the gold standard for test quality
4. **Monitor coverage**: But don't optimize for it alone
5. **Fix compilation first**: Other stages are meaningless if code doesn't compile
6. **Iterate based on feedback**: Use validation pipeline recommendations
7. **Integrate into CI**: Make QA part of your development workflow

## References

- [Cognitive Quality Assurance Architecture](https://graphwiz.ai/ai/cognitive-quality-assurance/)
- [VALTEST: Automated Validation of LLM Evaluators](https://arxiv.org/abs/2306.09990)
- [Software Testing with Large Language Models](https://arxiv.org/abs/2311.07607)
- [Mutation Testing Best Practices](https://pitest.org/quickstart/mutationtesting101/)

## Contributing

To extend the Cognitive QA framework:

1. Add new personas to `.qa/prompts/personas.yaml`
2. Implement custom mutation operators in `.qa/validators/mutation-tester.ts`
3. Extend validation stages in `.qa/validators/validation-pipeline.ts`
4. Add new quality rubrics to this guide

## License

Part of the GraphWiz-XR project.
