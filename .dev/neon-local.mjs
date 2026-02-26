import { neonConfig } from '@neondatabase/serverless';

const wsPort = process.env.WS_PROXY_PORT || '5488';
neonConfig.wsProxy = (host) => `${host}:${wsPort}/v2`;
neonConfig.useSecureWebSocket = false;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;
