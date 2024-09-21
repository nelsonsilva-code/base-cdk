import { Construct } from 'constructs';
import { Stack, StackProps} from 'aws-cdk-lib';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LogGroupManagerDeploymentPolicy } from '@vw-sre/vws-cdk/lib/stacks/log-group-manager-stack';
import {VpcDefaultHandlerDeploymentPolicy} from "@vw-sre/vws-cdk";

export class BootstrapStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new ManagedPolicy(this, 'Policy', {
      managedPolicyName: 'CdkBootstrap',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'acm:*',
            'application-autoscaling:*',
            'apigateway:*',
            'cloudformation:*',
            'cloudfront:*',
            'cloudwatch:*',
            'codebuild:*',
            'codedeploy:*',
            'codepipeline:*',
            'codestar-connections:PassConnection',
            'dynamodb:*',
            'ec2:*',
            'ecs:*',
            'ecr:*',
            'ecr-public:*',
            'elasticache:*',
            'elasticloadbalancing:*',
            'events:*',
            'firehose:*',
            'iam:*',
            'kinesis:*',
            'kms:*',
            'lambda:*',
            'logs:*',
            'rds:*',
            'route53:*',
            's3:*',
            'secretsmanager:*',
            'serverlessrepo:*',
            'servicediscovery:*',
            'sns:*',
            'ses:*',
            'sqs:*',
            'ssm:*',
          ],
          resources: ['*'],
        }),
      ],
    });

    new LogGroupManagerDeploymentPolicy(this, 'LogGroupManagerDeploymentPolicy', {
      stackName: 'LogGroupManagerStack',
      managedPolicyName: 'LogGroupManagerDeployment',
    });

    new VpcDefaultHandlerDeploymentPolicy(this, "VpcDefaultHandlerDeploymentPolicy",{
      stackName: "VpcDefaultHandlerStack",
      managedPolicyName: "VpcDefaultHandlerDeployment",
    });
  }
}