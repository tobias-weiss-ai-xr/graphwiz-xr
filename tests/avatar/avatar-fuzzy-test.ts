/**
 * Avatar System Fuzzy Testing Suite
 *
 * Generates random avatar configurations and tests edge cases
 * to find bugs and validate system robustness.
 */

export interface AvatarConfig {
  body_type: 'human' | 'robot' | 'alien' | 'animal' | 'abstract';
  primary_color: string;
  secondary_color: string;
  height: number;
  custom_model_url?: string;
}

export interface TestResult {
  testId: string;
  timestamp: number;
  config: AvatarConfig;
  passed: boolean;
  errors: string[];
  warnings: string[];
  duration: number;
}

/**
 * Color validation utilities
 */
export const ColorUtils = {
  /**
   * Generate random hex color
   */
  randomHex(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  },

  /**
   * Generate random color with specific format
   */
  randomColorFormat(): string {
    const formats = [
      () => this.randomHex(),
      () => `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
      () => `hsl(${Math.random() * 360}, ${Math.random() * 100}%, ${Math.random() * 100}%)`,
      () => 'invalid', // Intentional invalid
      () => '', // Empty
      () => '#', // Incomplete
      () => '#GGGGGG', // Invalid hex
      () => '#00000000', // With alpha
      () => 'transparent',
      () => 'inherit',
    ];
    return formats[Math.floor(Math.random() * formats.length)]();
  },

  /**
   * Validate hex color format
   */
  isValidHex(color: string): boolean {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
  },
};

/**
 * Avatar configuration fuzzing generator
 */
export class AvatarFuzzer {
  private bodyTypes = ['human', 'robot', 'alien', 'animal', 'abstract'] as const;
  private edgeCaseColors = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#',
    '',
    'invalid',
    '#GGGGGG',
    '#123',
    '#12345678',
    'rgb(0, 0, 0)',
    'rgba(255, 255, 255, 0.5)',
    'hsl(0, 100%, 50%)',
    'transparent',
    'inherit',
    'currentColor',
    '#0000000000000000000000000000000000000000', // Extremely long
  ];

  /**
   * Generate random valid avatar config
   */
  randomValid(): AvatarConfig {
    return {
      body_type: this.bodyTypes[Math.floor(Math.random() * this.bodyTypes.length)],
      primary_color: ColorUtils.randomHex(),
      secondary_color: ColorUtils.randomHex(),
      height: 0.5 + Math.random() * 2.5, // 0.5 to 3.0
    };
  }

  /**
   * Generate random avatar config with possible invalid values
   */
  randomFuzzy(): AvatarConfig {
    return {
      body_type: this.randomBodyType(),
      primary_color: this.edgeCaseColors[Math.floor(Math.random() * this.edgeCaseColors.length)],
      secondary_color: this.edgeCaseColors[Math.floor(Math.random() * this.edgeCaseColors.length)],
      height: this.randomHeight(),
    };
  }

  /**
   * Generate body type (with possible invalid values)
   */
  private randomBodyType(): any {
    const options = [
      ...this.bodyTypes,
      'invalid',
      '',
      null,
      undefined,
      'HUMAN', // Case test
      ' Human ', // Whitespace
      123, // Number instead of string
      {}, // Object
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate height (with edge cases)
   */
  private randomHeight(): any {
    const options = [
      0.5, // Min
      1.7, // Default
      3.0, // Max
      0, // Below min
      -1.5, // Negative
      5.0, // Above max
      1.23456789, // Many decimals
      NaN,
      Infinity,
      -Infinity,
      null,
      undefined,
      '', // Empty string
      '1.7', // String number
      'invalid',
      {},
      [],
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate specific edge case config
   */
  static edgeCases(): Record<string, AvatarConfig> {
    return {
      minHeight: {
        body_type: 'human',
        primary_color: '#FF0000',
        secondary_color: '#0000FF',
        height: 0.5,
      },
      maxHeight: {
        body_type: 'robot',
        primary_color: '#00FF00',
        secondary_color: '#FFFF00',
        height: 3.0,
      },
      belowMinHeight: {
        body_type: 'alien',
        primary_color: '#000000',
        secondary_color: '#FFFFFF',
        height: 0.1,
      },
      aboveMaxHeight: {
        body_type: 'animal',
        primary_color: '#FF00FF',
        secondary_color: '#00FFFF',
        height: 5.0,
      },
      negativeHeight: {
        body_type: 'abstract',
        primary_color: '#CCCCCC',
        secondary_color: '#999999',
        height: -1.0,
      },
      emptyColors: {
        body_type: 'human',
        primary_color: '',
        secondary_color: '',
        height: 1.7,
      },
      invalidColors: {
        body_type: 'robot',
        primary_color: 'invalid-color',
        secondary_color: '#GGGGGG',
        height: 1.7,
      },
      allInvalid: {
        body_type: 'invalid-type',
        primary_color: 'not-a-color',
        secondary_color: '',
        height: -999,
      },
      sameColors: {
        body_type: 'alien',
        primary_color: '#4CAF50',
        secondary_color: '#4CAF50',
        height: 1.7,
      },
      contrastingColors: {
        body_type: 'animal',
        primary_color: '#000000',
        secondary_color: '#FFFFFF',
        height: 1.7,
      },
    };
  }
}

/**
 * Avatar validation utilities
 */
export class AvatarValidator {
  /**
   * Validate avatar configuration
   */
  static validate(config: AvatarConfig): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate body_type
    const validBodyTypes = ['human', 'robot', 'alien', 'animal', 'abstract'];
    if (!config.body_type || typeof config.body_type !== 'string') {
      errors.push(`body_type is missing or invalid: ${config.body_type}`);
    } else if (!validBodyTypes.includes(config.body_type as any)) {
      errors.push(`body_type must be one of: ${validBodyTypes.join(', ')}, got: ${config.body_type}`);
    }

    // Validate primary_color
    if (!config.primary_color || typeof config.primary_color !== 'string') {
      errors.push(`primary_color is missing or invalid: ${config.primary_color}`);
    } else if (!ColorUtils.isValidHex(config.primary_color)) {
      warnings.push(`primary_color is not a valid hex color: ${config.primary_color}`);
    }

    // Validate secondary_color
    if (!config.secondary_color || typeof config.secondary_color !== 'string') {
      errors.push(`secondary_color is missing or invalid: ${config.secondary_color}`);
    } else if (!ColorUtils.isValidHex(config.secondary_color)) {
      warnings.push(`secondary_color is not a valid hex color: ${config.secondary_color}`);
    }

    // Validate height
    if (typeof config.height !== 'number' || isNaN(config.height)) {
      errors.push(`height must be a number, got: ${config.height}`);
    } else if (config.height < 0.5) {
      errors.push(`height is below minimum (0.5m): ${config.height}`);
    } else if (config.height > 3.0) {
      errors.push(`height is above maximum (3.0m): ${config.height}`);
    } else if (config.height < 1.0 || config.height > 2.5) {
      warnings.push(`height is outside typical range (1.0-2.5m): ${config.height}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Fuzzy test runner
 */
export class FuzzyTestRunner {
  private results: TestResult[] = [];

  /**
   * Run single fuzzy test
   */
  async runTest(config: AvatarConfig): Promise<TestResult> {
    const startTime = performance.now();
    const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Validate config
      const validation = AvatarValidator.validate(config);

      const result: TestResult = {
        testId,
        timestamp: Date.now(),
        config,
        passed: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
        duration: performance.now() - startTime,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const result: TestResult = {
        testId,
        timestamp: Date.now(),
        config,
        passed: false,
        errors: [`Test threw exception: ${error}`],
        warnings: [],
        duration: performance.now() - startTime,
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * Run batch of fuzzy tests
   */
  async runBatch(count: number, generator: () => AvatarConfig): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (let i = 0; i < count; i++) {
      const config = generator();
      const result = await this.runTest(config);
      results.push(result);
    }

    return results;
  }

  /**
   * Run edge case tests
   */
  async runEdgeCases(): Promise<TestResult[]> {
    const edgeCases = AvatarFuzzer.edgeCases();
    const results: TestResult[] = [];

    for (const [name, config] of Object.entries(edgeCases)) {
      const result = await this.runTest(config);
      result.testId = `edge-${name}`;
      results.push(result);
    }

    return results;
  }

  /**
   * Get test statistics
   */
  getStats() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const warnings = this.results.filter(r => r.warnings.length > 0).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return {
      total: this.results.length,
      passed,
      failed,
      warnings,
      passRate: (passed / this.results.length) * 100,
      totalDuration,
      avgDuration: totalDuration / this.results.length,
    };
  }

  /**
   * Generate test report
   */
  generateReport(): string {
    const stats = this.getStats();
    const lines: string[] = [];

    lines.push('='.repeat(80));
    lines.push('FUZZY TEST REPORT');
    lines.push('='.repeat(80));
    lines.push(`Total Tests: ${stats.total}`);
    lines.push(`Passed: ${stats.passed} (${stats.passRate.toFixed(2)}%)`);
    lines.push(`Failed: ${stats.failed}`);
    lines.push(`Warnings: ${stats.warnings}`);
    lines.push(`Total Duration: ${stats.totalDuration.toFixed(2)}ms`);
    lines.push(`Avg Duration: ${stats.avgDuration.toFixed(2)}ms`);
    lines.push('');

    // Show failed tests
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      lines.push('FAILED TESTS:');
      lines.push('-'.repeat(80));
      failedTests.forEach(test => {
        lines.push(`[${test.testId}]`);
        lines.push(`  Config: ${JSON.stringify(test.config)}`);
        lines.push(`  Errors: ${test.errors.join(', ')}`);
        lines.push('');
      });
    }

    // Show tests with warnings
    const warningTests = this.results.filter(r => r.warnings.length > 0);
    if (warningTests.length > 0) {
      lines.push('TESTS WITH WARNINGS:');
      lines.push('-'.repeat(80));
      warningTests.forEach(test => {
        lines.push(`[${test.testId}]`);
        lines.push(`  Config: ${JSON.stringify(test.config)}`);
        lines.push(`  Warnings: ${test.warnings.join(', ')}`);
        lines.push('');
      });
    }

    lines.push('='.repeat(80));

    return lines.join('\n');
  }

  /**
   * Clear results
   */
  clear() {
    this.results = [];
  }
}

/**
 * Multi-client fuzzy testing utilities
 */
export class MultiClientFuzzer {
  private fuzzer = new FuzzyTestRunner();

  /**
   * Simulate multiple clients with random avatar configs
   */
  async simulateMultipleClients(clientCount: number): Promise<Map<string, AvatarConfig>> {
    const clients = new Map<string, AvatarConfig>();

    for (let i = 0; i < clientCount; i++) {
      const clientId = `client-${i}-${Date.now()}`;
      const config = new AvatarFuzzer().randomValid();
      clients.set(clientId, config);

      // Run validation test
      await this.fuzzer.runTest(config);
    }

    return clients;
  }

  /**
   * Test concurrent avatar updates
   */
  async testConcurrentUpdates(clientCount: number, updatesPerClient: number): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const clients = await this.simulateMultipleClients(clientCount);

    for (let [clientId, _] of clients) {
      for (let i = 0; i < updatesPerClient; i++) {
        const config = new AvatarFuzzer().randomFuzzy();
        const result = await this.fuzzer.runTest(config);
        result.testId = `${clientId}-update-${i}`;
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Get statistics
   */
  getStats() {
    return this.fuzzer.getStats();
  }

  /**
   * Generate report
   */
  generateReport() {
    return this.fuzzer.generateReport();
  }
}
