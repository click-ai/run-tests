import core from '@actions/core';
import clickai from 'clickai';
import { downloadCloudflared } from './tunnel';

function checkIsUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export async function run() {
  try {
    const tests = core.getInput('tests', {
      required: false,
      trimWhitespace: true
    });
    const apiKey = core.getInput('apiKey', {
      required: true,
      trimWhitespace: true
    });

    const input = core.getInput('input', {
      required: false,
      trimWhitespace: true
    });

    const proxyUrlsString = core.getInput('proxyUrls', {
      required: false,
      trimWhitespace: true
    });

    const proxyUrls = proxyUrlsString
      .split(/[\r\n,]+/)
      .map(row => row.trim())
      .filter(checkIsUrl);

    const cloudflaredPath = await downloadCloudflared();

    console.log('Starting proxy to urls:', proxyUrls.join(', '));

    let proxyMap: Record<string, string> | undefined = undefined;
    if (proxyUrls.length > 0) {
      const res = await clickai.runTunnelMultiple({
        urls: proxyUrls,
        cloudflaredPath
      });

      proxyMap = res.reduce(
        (acc, t) => {
          acc[t.url] = t.publicUrl;
          return acc;
        },
        {} as Record<string, string>
      );
    }

    console.log('Proxy started, scheduling tests');

    let automationIds = [[]];

    if (tests) {
      automationIds = JSON.parse(tests.trim());

      // Verify automationIds is string[][]
      if (
        !Array.isArray(automationIds) ||
        !automationIds.every(Array.isArray) ||
        !automationIds.flat().every(id => typeof id === 'string')
      ) {
        throw new Error('tests must be an array of arrays of strings');
      }

      core.info(`Running tests: ${automationIds.flat().join(', ')}`);
    }

    const inputMap = input
      .trim()
      .split(/[\r\n,]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.split('='))
      .reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>
      );

    for (const automationArray of automationIds) {
      const result = await clickai.scheduleTests({
        authToken: apiKey,
        ...(automationArray.length > 0 && { automationIds: automationArray }),
        inputMap,
        proxyMap
      });
      core.info(`Tests completed with status: ${result.status}`);

      if (result.status === 'error') {
        throw new Error(`Error`);
      }

      core.info(`All tests: ${automationArray.join(', ')} passed`);
    }

    core.info(`All tests passed`);
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed((error as Error).message);
  }
}
