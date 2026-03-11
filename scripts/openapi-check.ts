import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const run = (command: string) => {
  execSync(command, {
    stdio: 'inherit',
  });
};

const checkOpenApiArtifacts = () => {
  run('pnpm run gen:client');

  if (!existsSync('.git')) {
    console.warn('Skip OpenAPI diff check because .git is not available.');

    return;
  }

  run('git diff --exit-code -- openapi/openapi.json generated/openapi-client');
};

void checkOpenApiArtifacts();
