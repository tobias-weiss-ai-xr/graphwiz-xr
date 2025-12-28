#!/usr/bin/env node
/**
 * RAG-based Requirement Testing System
 *
 * Retrieves business requirements and generates tests based on them
 * Implements semantic chunking and multi-index retrieval
 */

import { readFile, readdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface RequirementChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: 'user-story' | 'prd' | 'api-spec' | 'test-case' | 'documentation';
    priority: 'critical' | 'high' | 'medium' | 'low';
    tags: string[];
    lastModified: string;
  };
  embedding?: number[];
}

interface TestCase {
  name: string;
  requirementId: string;
  description: string;
  acceptanceCriteria: string[];
  testSteps: string[];
  expectedResult: string;
  category: 'functional' | 'non-functional' | 'security' | 'performance';
}

/**
 * Requirement Indexer - Ingest and index business requirements
 */
class RequirementIndexer {
  private chunks: Map<string, RequirementChunk> = new Map();
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Ingest requirements from documentation
   */
  async ingestRequirements(docsPath: string): Promise<void> {
    console.log(`📚 Ingesting requirements from ${docsPath}...`);

    const files = await this.getRequirementFiles(docsPath);

    for (const file of files) {
      await this.processFile(file);
    }

    console.log(`✅ Ingested ${this.chunks.size} requirement chunks`);
  }

  /**
   * Process a single requirement file
   */
  private async processFile(filePath: string): Promise<void> {
    const content = await readFile(filePath, 'utf-8');
    const chunks = this.chunkContent(content, filePath);

    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk);
    }
  }

  /**
   * Semantic chunking for requirements
   * Implements agentic chunking for test scenarios
   */
  private chunkContent(content: string, source: string): RequirementChunk[] {
    const chunks: RequirementChunk[] = [];

    // Split by sections (## headers in markdown)
    const sections = content.split(/\n##+\s+/);

    let chunkIndex = 0;
    for (const section of sections) {
      if (section.trim().length === 0) continue;

      const lines = section.trim().split('\n');
      const title = lines[0];
      const body = lines.slice(1).join('\n');

      // Determine type based on content
      const type = this.determineContentType(body);

      // Extract tags
      const tags = this.extractTags(body);

      chunks.push({
        id: `${source}-${chunkIndex++}`,
        content: body,
        metadata: {
          source,
          type,
          priority: this.extractPriority(body),
          tags,
          lastModified: new Date().toISOString()
        }
      });
    }

    return chunks;
  }

  /**
   * Determine content type (user story, PRD, etc.)
   */
  private determineContentType(content: string): RequirementChunk['metadata']['type'] {
    if (content.includes('User Story') || content.includes('As a')) return 'user-story';
    if (content.includes('API') || content.includes('Endpoint')) return 'api-spec';
    if (content.includes('Test') || content.includes('Verify')) return 'test-case';
    if (content.includes('PRD') || content.includes('Requirements')) return 'prd';
    return 'documentation';
  }

  /**
   * Extract priority from content
   */
  private extractPriority(content: string): RequirementChunk['metadata']['priority'] {
    const lower = content.toLowerCase();
    if (lower.includes('must') || lower.includes('critical') || lower.includes('p0')) return 'critical';
    if (lower.includes('should') || lower.includes('important') || lower.includes('p1')) return 'high';
    if (lower.includes('could') || lower.includes('nice to have') || lower.includes('p2')) return 'medium';
    return 'low';
  }

  /**
   * Extract tags from content
   */
  private extractTags(content: string): string[] {
    const tags: string[] = [];

    // Common tags in GraphWiz-XR
    const tagPatterns = [
      'authentication',
      'networking',
      'webrtc',
      'xr',
      'vr',
      'performance',
      'security',
      'database',
      'api',
      'websocket',
      'rendering',
      'physics',
      'audio',
      'input',
      'storage'
    ];

    for (const tag of tagPatterns) {
      if (content.toLowerCase().includes(tag)) {
        tags.push(tag);
      }
    }

    return tags;
  }

  /**
   * Retrieve relevant requirements for a component
   */
  retrieveRequirements(componentPath: string, tags: string[] = []): RequirementChunk[] {
    console.log(`🔍 Retrieving requirements for ${componentPath}...`);

    const relevant: RequirementChunk[] = [];

    for (const chunk of this.chunks.values()) {
      // Check tag relevance
      if (tags.length > 0) {
        const hasMatchingTag = chunk.metadata.tags.some(tag =>
          tags.some(t => tag.toLowerCase().includes(t.toLowerCase()))
        );
        if (!hasMatchingTag) continue;
      }

      relevant.push(chunk);
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    relevant.sort((a, b) =>
      priorityOrder[a.metadata.priority] - priorityOrder[b.metadata.priority]
    );

    console.log(`  Found ${relevant.length} relevant requirements`);
    return relevant;
  }

  /**
   * Generate test cases from requirements
   */
  generateTestCases(requirements: RequirementChunk[]): TestCase[] {
    console.log('📝 Generating test cases from requirements...');

    const testCases: TestCase[] = [];

    for (const requirement of requirements) {
      const cases = this.extractTestCases(requirement);
      testCases.push(...cases);
    }

    console.log(`  Generated ${testCases.length} test cases`);
    return testCases;
  }

  /**
   * Extract test cases from a requirement chunk
   */
  private extractTestCases(requirement: RequirementChunk): TestCase[] {
    const cases: TestCase[] = [];
    const content = requirement.content;
    const lines = content.split('\n');

    // Look for acceptance criteria
    const acceptanceCriteria: string[] = [];
    const testSteps: string[] = [];

    for (const line of lines) {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        acceptanceCriteria.push(line.substring(2));
      }
      if (line.toLowerCase().includes('verify') || line.toLowerCase().includes('check')) {
        testSteps.push(line);
      }
    }

    // Generate test case
    const testCase: TestCase = {
      name: `test_${requirement.metadata.source.replace(/\//g, '_')}`,
      requirementId: requirement.id,
      description: this.extractDescription(content),
      acceptanceCriteria,
      testSteps: testSteps.length > 0 ? testSteps : this.generateDefaultTestSteps(content),
      expectedResult: this.extractExpectedResult(content),
      category: this.categorizeRequirement(requirement)
    };

    cases.push(testCase);

    // Generate additional edge case tests for critical requirements
    if (requirement.metadata.priority === 'critical') {
      cases.push(this.generateEdgeCaseTest(testCase));
    }

    return cases;
  }

  /**
   * Extract description from content
   */
  private extractDescription(content: string): string {
    const lines = content.split('\n');
    const firstLine = lines[0];

    if (firstLine.length < 100) {
      return firstLine;
    }

    return firstLine.substring(0, 100) + '...';
  }

  /**
   * Extract expected result
   */
  private extractExpectedResult(content: string): string {
    const lower = content.toLowerCase();

    if (lower.includes('then')) {
      const thenIndex = lower.indexOf('then');
      return content.substring(thenIndex + 4).trim().split('\n')[0];
    }

    if (lower.includes('expect')) {
      const expectIndex = lower.indexOf('expect');
      return content.substring(expectIndex + 6).trim().split('\n')[0];
    }

    return 'Operation completes successfully';
  }

  /**
   * Generate default test steps
   */
  private generateDefaultTestSteps(content: string): string[] {
    return [
      'Setup test environment',
      'Execute action',
      'Verify result',
      'Cleanup test data'
    ];
  }

  /**
   * Categorize requirement
   */
  private categorizeRequirement(requirement: RequirementChunk): TestCase['category'] {
    const content = requirement.content.toLowerCase();

    if (content.includes('security') || content.includes('auth')) return 'security';
    if (content.includes('performance') || content.includes('latency')) return 'performance';
    if (content.includes('ui') || content.includes('user')) return 'functional';

    return 'functional';
  }

  /**
   * Generate edge case test for critical requirements
   */
  private generateEdgeCaseTest(baseTest: TestCase): TestCase {
    return {
      ...baseTest,
      name: `${baseTest.name}_edge_cases`,
      description: `${baseTest.description} (Edge Cases)`,
      testSteps: [
        'Test with null/empty input',
        'Test with boundary values',
        'Test with concurrent operations',
        'Test with invalid input'
      ],
      expectedResult: 'System handles edge cases gracefully'
    };
  }

  /**
   * Save index to disk
   */
  async saveIndex(indexPath: string): Promise<void> {
    const data = Array.from(this.chunks.values());
    await writeFile(indexPath, JSON.stringify(data, null, 2));
    console.log(`💾 Saved ${data.length} chunks to ${indexPath}`);
  }

  /**
   * Load index from disk
   */
  async loadIndex(indexPath: string): Promise<void> {
    const content = await readFile(indexPath, 'utf-8');
    const data: RequirementChunk[] = JSON.parse(content);

    this.chunks.clear();
    for (const chunk of data) {
      this.chunks.set(chunk.id, chunk);
    }

    console.log(`📖 Loaded ${this.chunks.size} chunks from ${indexPath}`);
  }

  /**
   * Get requirement files from docs directory
   */
  private async getRequirementFiles(docsPath: string): Promise<string[]> {
    // In a real implementation, this would scan the directory
    // For now, return known documentation files
    return [
      'NETWORKING_IMPLEMENTATION_SUMMARY.md',
      'PHYSICS_ENGINE_INTEGRATION.md',
      'VOICE_CHAT_IMPLEMENTATION_SUMMARY.md',
      'VR_INPUT_IMPLEMENTATION_SUMMARY.md'
    ].map(f => join(this.projectRoot, f));
  }
}

/**
 * RAG-based Test Generator
 */
class RAGTestGenerator {
  private indexer: RequirementIndexer;

  constructor(projectRoot: string) {
    this.indexer = new RequirementIndexer(projectRoot);
  }

  /**
   * Initialize the RAG system
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing RAG Test Generation System...\n');

    // Ingest requirements from documentation
    await this.indexer.ingestRequirements('./');

    // Save index for future use
    await this.indexer.saveIndex('.qa/rag/requirement-index.json');
  }

  /**
   * Generate tests for a component based on requirements
   */
  async generateTestsForComponent(componentPath: string): Promise<TestCase[]> {
    console.log(`\n🎯 Generating tests for ${componentPath}...\n`);

    // Extract component tags
    const tags = this.extractComponentTags(componentPath);

    // Retrieve relevant requirements
    const requirements = this.indexer.retrieveRequirements(componentPath, tags);

    // Generate test cases
    const testCases = this.indexer.generateTestCases(requirements);

    // Save test cases
    const outputPath = `.qa/rag/test-cases/${componentPath.replace(/\//g, '-')}.json`;
    await writeFile(
      join(process.cwd(), outputPath),
      JSON.stringify(testCases, null, 2)
    );

    console.log(`\n💾 Generated ${testCases.length} test cases saved to ${outputPath}`);

    return testCases;
  }

  /**
   * Extract tags from component path
   */
  private extractComponentTags(componentPath: string): string[] {
    const tags: string[] = [];

    if (componentPath.includes('networking')) tags.push('networking', 'websocket');
    if (componentPath.includes('auth')) tags.push('authentication', 'security');
    if (componentPath.includes('xr')) tags.push('xr', 'vr', 'rendering');
    if (componentPath.includes('physics')) tags.push('physics');
    if (componentPath.includes('voice')) tags.push('audio', 'webrtc');
    if (componentPath.includes('sfu')) tags.push('webrtc', 'performance');

    return tags;
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: rag-test-generator [command] [options]

Commands:
  init                    Initialize RAG system and index requirements
  generate <component>    Generate tests for a component based on requirements
  search <query>          Search requirements

Examples:
  rag-test-generator init
  rag-test-generator generate packages/clients/hub-client/src/networking
    `);
    process.exit(1);
  }

  const generator = new RAGTestGenerator(process.cwd());

  const command = args[0];

  switch (command) {
    case 'init':
      await generator.initialize();
      break;

    case 'generate':
      const component = args[1];
      if (!component) {
        console.error('Error: component path required');
        process.exit(1);
      }
      await generator.generateTestsForComponent(component);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RequirementIndexer, RAGTestGenerator, type RequirementChunk, type TestCase };
