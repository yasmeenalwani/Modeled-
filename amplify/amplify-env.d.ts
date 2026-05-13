/**
 * Ambient declaration for Amplify-generated env modules.
 * These are created at build time in .amplify/generated/
 */
declare module '$amplify/env/*' {
  const env: {
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_SESSION_TOKEN: string;
    AWS_REGION: string;
    AMPLIFY_DATA_DEFAULT_NAME: string;
    [key: string]: string | undefined;
  };
  export { env };
}

/** AWS SDK v3 - resolved at build time by function bundler */
declare module '@aws-sdk/client-ses';
declare module '@aws-sdk/client-sns';
declare module '@aws-sdk/client-rekognition';
declare module '@aws-sdk/client-bedrock-runtime';
declare module '@aws-sdk/client-dynamodb';
declare module '@aws-sdk/lib-dynamodb';
declare module '@aws-sdk/client-pinpoint';
