#!/usr/bin/env node
import { DisableMapPublicIpOnLaunch } from '@vw-sre/vws-cdk';
import { App, Aspects } from 'aws-cdk-lib';
import { BaseResourcesStack } from '../lib/stacks/base-resources';

const app = new App();

const playgroundEnv = {
    account: '462707719390',
    region: 'eu-west-1',
};
const devEnv = {
    account: '823810905047',
    region: 'eu-west-1',
};
const prodEnv = {
    account: '060139155903',
    region: 'eu-west-1',
};
const currentEnv = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

if (currentEnv.account == playgroundEnv.account){
    new BaseResourcesStack(app, 'PlaygroundBaseResourcesStack', { environmentName: 'Playground' });
} else if (currentEnv.account == devEnv.account) {
    new BaseResourcesStack(app, 'DevelopmentBaseResourcesStack', { environmentName: 'Development' });
} else if (currentEnv.account == prodEnv.account) {
    new BaseResourcesStack(app, 'PreliveBaseResourcesStack', { environmentName: 'Prelive' });
    new BaseResourcesStack(app, 'LiveBaseResourcesStack', { environmentName: 'Live' });
}

Aspects.of(app).add(new DisableMapPublicIpOnLaunch());
