import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as eventsources from '@aws-cdk/aws-lambda-event-sources';
import * as s3n from '@aws-cdk/aws-s3-notifications';
import * as path from 'path';

export class SplunkIntegrationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 lambda function definition
    const lambdaFunction = new lambda.Function(this, 'lambda-function', {
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 1024,
      // timeout: cdk.Duration.seconds(5),
      handler: 'index.main',
      code: lambda.Code.fromAsset(path.join(__dirname, '/../src/')),
      environment: {
        REGION: cdk.Stack.of(this).region,
        AVAILABILITY_ZONES: JSON.stringify(
          cdk.Stack.of(this).availabilityZones,
        ),
      },
    });
    // 👇 create a policy statement
    const listBucketsPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:ListAllMyBuckets'],
      resources: ['arn:aws:s3:::*'],
    });

    // 👇 attach the policy to the function's role
    lambdaFunction.role?.attachInlinePolicy(
      new iam.Policy(this, 'list-buckets', {
        statements: [listBucketsPolicy],
      }),
    );
    
    const importedBucketFromArn = s3.Bucket.fromBucketArn(
      this,
      'imported-bucket-from-arn',
      'arn:aws:s3:::mytestnoncompliant',
    );
    importedBucketFromArn.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(lambdaFunction))
  }
}
