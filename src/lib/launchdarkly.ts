import 'dotenv/config';
import * as LaunchDarkly from '@launchdarkly/node-server-sdk';

let ldClient: LaunchDarkly.LDClient | null = null;

export async function getLDClient(): Promise<LaunchDarkly.LDClient> {
  if (ldClient) {
    return ldClient;
  }

  const sdkKey = process.env.LAUNCHDARKLY_SDK_KEY;

  if (!sdkKey) {
    throw new Error('LAUNCHDARKLY_SDK_KEY environment variable is not set');
  }

  ldClient = LaunchDarkly.init(sdkKey);
  await ldClient.waitForInitialization();

  return ldClient;
}

export async function getFeatureFlag(
  flagKey: string,
  defaultValue: boolean
): Promise<boolean> {
  try {
    const client = await getLDClient();

    // Use an anonymous context for server-side evaluation
    const context: LaunchDarkly.LDContext = {
      kind: 'user',
      key: 'anonymous',
      anonymous: true,
    };

    return await client.variation(flagKey, context, defaultValue);
  } catch (error) {
    console.error(`Error evaluating feature flag '${flagKey}':`, error);
    return defaultValue;
  }
}
