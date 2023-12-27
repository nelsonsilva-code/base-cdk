import { Stack, StackProps } from 'aws-cdk-lib';
import {
  GatewayVpcEndpointAwsService,
  InterfaceVpcEndpointAwsService, InterfaceVpcEndpointService,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {prefix} from "aws-cdk/lib/logging";
import {CfnProxy} from "@vw-sre/vws-cdk";

interface BaseResourcesStackProps extends StackProps {
  environmentName: string;
}

export class BaseResourcesStack extends Stack {
  constructor(scope: Construct, id: string, props: BaseResourcesStackProps) {
    super(scope, id, props);

    const env = props.environmentName;

    const vwsProxy = new CfnProxy(this, 'EnvironmentProxy', {
      allowedCidrs: [],
      allowedPorts: [443],
      allowedSuffixes: ['vwgroup.io','cariad.digital', 'vwapps.run', 'log-api.eu.newrelic.com','gradle.org','nr-data.net','nr-assets.net'],
    });

    const vpc = new Vpc(this, 'MicroserviceVpc', {
      vpcName: `${env}-MicroservicesVpc`,
      subnetConfiguration: [
        {
          name: 'ingress',
          subnetType: SubnetType.PUBLIC,
        },
        {
          name: 'private',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // VWS Services
    vpc.addInterfaceEndpoint('Proxy', {
      service: new InterfaceVpcEndpointService(vwsProxy.serviceName, 8080),
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
      privateDnsEnabled: true,
    });

    // Amazon services
    vpc.addInterfaceEndpoint('CloudWatchLogs', {
      service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    vpc.addInterfaceEndpoint('SSM', {
      service: InterfaceVpcEndpointAwsService.SSM,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    vpc.addInterfaceEndpoint('SecretsManager', {
      service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    vpc.addInterfaceEndpoint('EC2', {
      service: InterfaceVpcEndpointAwsService.EC2,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    vpc.addGatewayEndpoint('S3', {
      service: GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: SubnetType.PRIVATE_ISOLATED }],
    });
    const ecr = vpc.addInterfaceEndpoint('Ecr', {
      service: InterfaceVpcEndpointAwsService.ECR,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    const ecs = vpc.addInterfaceEndpoint('ECS', {
      service: InterfaceVpcEndpointAwsService.ECS,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    const gateway = vpc.addInterfaceEndpoint('ApiGateWay', {
      service: InterfaceVpcEndpointAwsService.APIGATEWAY,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    const ecrDocker = vpc.addInterfaceEndpoint('EcrDocker', {
      service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    const cloudwatch = vpc.addInterfaceEndpoint('CloudWatch', {
      service: InterfaceVpcEndpointAwsService.CLOUDWATCH,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    const kinesis = vpc.addInterfaceEndpoint('KinesisStreams', {
      service: InterfaceVpcEndpointAwsService.KINESIS_STREAMS,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    const sqs = vpc.addInterfaceEndpoint('SQS', {
      service: InterfaceVpcEndpointAwsService.SQS,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });

    new StringParameter(this, 'EndpointParameter', {
      description: 'Parameter that contains vpc endpoint ids that cna be deleted',
      parameterName: `/${env.toLowerCase()}/vpc-microservices/endpoints`,
      stringValue:
          `${ecs.vpcEndpointId},${ecr.vpcEndpointId},${ecrDocker.vpcEndpointId},${cloudwatch.vpcEndpointId},${sqs.vpcEndpointId},${kinesis.vpcEndpointId}, ${gateway.vpcEndpointId}`
    });
  }
}
