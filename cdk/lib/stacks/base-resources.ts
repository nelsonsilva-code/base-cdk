import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {
  GatewayVpcEndpointAwsService,
  InterfaceVpcEndpointAwsService, InterfaceVpcEndpointService,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {CfnProxy} from "@vw-sre/vws-cdk";
import {PrivateDnsNamespace} from "aws-cdk-lib/aws-servicediscovery";
import {Topic} from "aws-cdk-lib/aws-sns";
import {Key} from "aws-cdk-lib/aws-kms";
import {EmailSubscription} from "aws-cdk-lib/aws-sns-subscriptions";
import {EnvironmentStage} from "@nelsonsilva-code/cdk-commons";
import {ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {ConfigurationSet, EmailIdentity, EmailSendingEvent, EventDestination, Identity} from "aws-cdk-lib/aws-ses";
import {Alarm, ComparisonOperator, Metric, TreatMissingData} from "aws-cdk-lib/aws-cloudwatch";
import {SnsAction} from "aws-cdk-lib/aws-cloudwatch-actions";

interface BaseResourcesStackProps extends StackProps {
  environmentName: EnvironmentStage['stage'],
  env: {
    account: string,
    region: string,
  },
}

export class BaseResourcesStack extends Stack {
  constructor(scope: Construct, id: string, props: BaseResourcesStackProps) {
    super(scope, id, props);

    this.createVpc(props.environmentName)

  }

  private createVpc(environmentName: string){

    const vwsProxy = new CfnProxy(this, 'EnvironmentProxy', {
      allowedCidrs: [],
      allowedPorts: [443],
      allowedSuffixes: ['vwgroup.io','cariad.digital', 'vwapps.run', 'log-api.eu.newrelic.com','gradle.org','nr-data.net','nr-assets.net'],
    });

    const vpc = new Vpc(this, 'AcademyVpc', {
      vpcName: `${environmentName}-Vpc`,
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

    this.createPrivateDnsNamespace(vpc, environmentName)

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
    vpc.addInterfaceEndpoint('Ecr', {
      service: InterfaceVpcEndpointAwsService.ECR,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    vpc.addInterfaceEndpoint('ECS', {
      service: InterfaceVpcEndpointAwsService.ECS,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    vpc.addInterfaceEndpoint('ApiGateWay', {
      service: InterfaceVpcEndpointAwsService.APIGATEWAY,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    vpc.addInterfaceEndpoint('EcrDocker', {
      service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    vpc.addInterfaceEndpoint('CloudWatch', {
      service: InterfaceVpcEndpointAwsService.CLOUDWATCH,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    vpc.addInterfaceEndpoint('KinesisStreams', {
      service: InterfaceVpcEndpointAwsService.KINESIS_STREAMS,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    vpc.addInterfaceEndpoint('SQS', {
      service: InterfaceVpcEndpointAwsService.SQS,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    });
    vpc.addInterfaceEndpoint('SSMMessages', {
      service:InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
    })

    return vpc;
  }
  private getEnvironmentPrefix(environment: string) {
    return environment !== 'Production' ? `${environment}.` : '';
  }

  private createPrivateDnsNamespace(vpc: Vpc, environmentName: string) {
    environmentName = environmentName.toLowerCase()
    const name = this.getEnvironmentPrefix(environmentName) + 'internal';

    const privateDnsNamespace = new PrivateDnsNamespace(this, `${environmentName}AcademyPrivateDnsNamespace`, {
      name,
      vpc,
      description: `Private DNS namespace for Junior Academy 2024 in ${environmentName} environment`,
    });

    new StringParameter(this, `${environmentName}AcademyPrivateDnsNamespaceArn`, {
      parameterName: `/${environmentName}/academy/private-dns-namespace-arn`,
      stringValue: privateDnsNamespace.namespaceArn,
    });

    new StringParameter(this, `${environmentName}AcademyPrivateDnsNamespaceId`, {
      parameterName: `/${environmentName}/academy/private-dns-namespace-id`,
      stringValue: privateDnsNamespace.namespaceId,
    });

    return privateDnsNamespace;
  }
}
