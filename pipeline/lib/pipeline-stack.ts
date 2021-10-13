import * as codebuild from '@aws-cdk/aws-codebuild';
import * as cdk from '@aws-cdk/core';
import { App, Stack, StackProps, SecretValue } from '@aws-cdk/core';

export interface PipelineStackProps extends StackProps {
  readonly githubToken: string;
}

export class PipelineStack extends Stack {
  constructor(app: App, id: string, props?: cdk.StackProps) {
    super(app, id, props);

    // Build CDK
    const cdkBuild = new codebuild.Project(this, 'CdkBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'pwd',
              'cd app/lambda',
              'pwd',
              'ls src',
              'npm install'
            ],
          },
          build: {
            commands: [
              'npm run build',
              'npx cdk synth -- -o dist',
              'npx cdk deploy --require-approval=never'
            ],
          },
        },
        artifacts: {
          'base-directory': 'dist',
          files: [
            'LambdaStack.template.json',
          ],
        },
      }),
      source: codebuild.Source.gitHub({
        owner: 'richardhu2013',
        repo: 'splunk-integration',
        webhook: true, // optional, default: true if `webhookFilters` were provided, false otherwise
        webhookTriggersBatchBuild: false, // optional, default is false
        webhookFilters: [
          codebuild.FilterGroup
            .inEventOf(codebuild.EventAction.PUSH)
            .andBranchIs('master')
            // .andCommitMessageIs('the commit message'),
        ], // optional, by default all pushes and Pull Requests will trigger a build
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
    });
  }
}