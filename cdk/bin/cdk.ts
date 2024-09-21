#!/usr/bin/env node
import {DisableMapPublicIpOnLaunch, LogGroupManagerStack} from '@vw-sre/vws-cdk';
import {App, Aspects, BootstraplessSynthesizer} from 'aws-cdk-lib';
import { BaseResourcesStack } from '../lib/stacks/base-resources';
import {BootstrapStack} from "../lib/stacks/bootstrap-stack";

const app = new App();

const academyEnv = {
    account: '987866352473',
    region: 'eu-west-1',
};

const currentEnv = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

if (currentEnv.account == academyEnv.account){
    new BaseResourcesStack(app, 'AcademyBaseResourcesStack', { environmentName: 'Academy', env: academyEnv});
} else {
    throw new Error(`Unrecognized account. Supported account is ${academyEnv.account}. Current account is ${currentEnv.account}`);
}

Aspects.of(app).add(new DisableMapPublicIpOnLaunch());
