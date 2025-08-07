# SonarQube Setup for DevVoted

This document explains how to use SonarQube for code quality analysis in the DevVoted project.

## Quick Start

1. **Start SonarQube server:**
   ```bash
   npm run sonar:start
   ```

2. **Run full analysis (tests + scan):**
   ```bash
   npm run sonar:full
   ```

3. **View results:**
   Open http://localhost:9001 and log in with `admin/admin`

## Available Scripts

- `npm run sonar:start` - Start SonarQube Docker container
- `npm run sonar:stop` - Stop SonarQube Docker container
- `npm run sonar:scan` - Run SonarQube analysis only
- `npm run sonar:full` - Run tests with coverage + SonarQube analysis
- `npm run test:coverage` - Generate test coverage reports
- `npm run test:sonar` - Run tests with SonarQube-compatible output

## First Time Setup

1. Start the SonarQube server:
   ```bash
   npm run sonar:start
   ```

2. Wait for the server to start (check http://localhost:9001)

3. Log in with default credentials:
   - Username: `admin`
   - Password: `admin`

4. Change the default password when prompted

5. Run your first analysis:
   ```bash
   npm run sonar:full
   ```

## Configuration

The project is configured with:

- **Server**: Runs on port 9001 (to avoid conflicts with dev server on 3005)
- **Database**: PostgreSQL on port 5433
- **Project Key**: `devvoted-tanstack`
- **Coverage**: Generated in `coverage/lcov.info`
- **Test Reports**: Generated in `test-report.xml`

## Domain-Specific Analysis

The configuration is optimized for the DevVoted domain-driven architecture:

- **Analyzed Sources**: `src/` directory with domain structure
- **Test Files**: Co-located `.spec.ts` and `.spec.tsx` files
- **Exclusions**: Generated files, test utilities, config files

## Quality Gates

SonarQube will analyze:
- Code complexity and maintainability
- Test coverage across domains
- TypeScript/JavaScript code quality
- Potential bugs and security hotspots
- Code duplication

## Troubleshooting

### Container Issues
- Ensure Docker has at least 4GB memory allocated
- Check if ports 9001 and 5433 are available

### Analysis Issues
- Verify test coverage is generated: `npm run test:coverage`
- Check that `coverage/lcov.info` exists before scanning
- Ensure SonarQube server is running before analysis

### Memory Issues
- Large projects may need increased memory: set `sonar.javascript.node.maxspace=8192`
- Check Docker memory allocation for containers

## CI/CD Integration

For CI/CD pipelines, set the `SONAR_TOKEN` environment variable:

```bash
export SONAR_TOKEN=your_sonar_token
npm run sonar:full
```