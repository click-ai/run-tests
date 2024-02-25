const core = require('@actions/core');
const clickai = require('clickai');
const { downloadCloudflared } = require('./tunnel');

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */

function checkIsUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

async function run() {
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

    await clickai.runTunnelMultiple({ urls: proxyUrls, cloudflaredPath });

    console.log('Proxy started, scheduling tests');

    const automationIds = JSON.parse(tests.trim());
    core.info(`Tests: ${automationIds}`);
    // Verify automationIds is string[][]
    if (
      !Array.isArray(automationIds) ||
      !automationIds.every(Array.isArray) ||
      !automationIds.flat().every(id => typeof id === 'string')
    ) {
      throw new Error('tests must be an array of arrays of strings');
    }
    core.info(`Running tests: ${automationIds.flat().join(', ')}`);

    const inputMap = input
      .trim()
      .split(/[\r\n,]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.split('='))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    for (const automationArray of automationIds) {
      const result = clickai.scheduleTests({
        authToken: apiKey,
        automationIds: automationArray,
        inputMap,
        proxyMap: proxyUrls
      });
      core.info(`Tests completed with status: ${result.status}`);
      core.info(result.result);

      if (result.result.status === 'error' || result.statusCode !== 200) {
        throw new Error(result?.result?.error || `Error: ${result.statusCode}`);
      }

      core.setOutput(`All tests: ${automationArray.join(', ')} passed`);
    }

    core.setOutput(`All tests passed`);
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message);
  }
}

module.exports = {
  run
};
