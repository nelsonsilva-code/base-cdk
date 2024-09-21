export type StackConfigurations<Configuration> = {
    environments: Record<string, Configuration>;
};

interface SecretsStackConfiguration {
    IDKIT_TOKEN_URL: string,
    APPLICATION_URL: string,
    NEW_RELIC_URL: string,
    VUM_UUID: string,
}

export const SecretStackConfigurations: StackConfigurations<SecretsStackConfiguration> =
    {
        environments: {
            Playground: {
                IDKIT_TOKEN_URL: 'https://identity-sandbox.vwgroup.io/oidc/v1/token?grant_type=client_credentials',
                APPLICATION_URL: 'https://insights-collector.eu01.nr-data.net/v1/accounts/2671288/events',
                NEW_RELIC_URL: 'https://log-api.eu.newrelic.com/log/v1',
                VUM_UUID: '34126a5b-49e7-49f4-8c9a-118676112ed8',
            },
            Develop: {
                IDKIT_TOKEN_URL: 'https://identity-sandbox.vwgroup.io/oidc/v1/token?grant_type=client_credentials',
                APPLICATION_URL: 'https://insights-collector.eu01.nr-data.net/v1/accounts/2671288/events',
                NEW_RELIC_URL: 'https://log-api.eu.newrelic.com/log/v1',
                VUM_UUID: '34126a5b-49e7-49f4-8c9a-118676112ed8',
            },
            Prelive: {
                IDKIT_TOKEN_URL: 'https://identity-sandbox.vwgroup.io/oidc/v1/token?grant_type=client_credentials',
                APPLICATION_URL: 'https://insights-collector.eu01.nr-data.net/v1/accounts/2671288/events',
                NEW_RELIC_URL: 'https://log-api.eu.newrelic.com/log/v1',
                VUM_UUID: '34126a5b-49e7-49f4-8c9a-118676112ed8',
            },
            Live: {
                IDKIT_TOKEN_URL: 'https://identity-sandbox.vwgroup.io/oidc/v1/token?grant_type=client_credentials',
                APPLICATION_URL: 'https://insights-collector.eu01.nr-data.net/v1/accounts/2671288/events',
                NEW_RELIC_URL: 'https://log-api.eu.newrelic.com/log/v1',
                VUM_UUID: '34126a5b-49e7-49f4-8c9a-118676112ed8',
            },
        },
    };