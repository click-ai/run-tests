const core = require('@actions/core');
const httpm = require('@actions/http-client');
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const tests = core.getInput('tests', {
      required: true,
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

    const automationIds = JSON.parse(tests.trim());
    // Verify automationIds is string[][]
    if (
      !Array.isArray(automationIds) ||
      !automationIds.every(Array.isArray) ||
      !automationIds.flat().every(id => typeof id === 'string')
    ) {
      throw new Error('tests must be an array of arrays of strings');
    }

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

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.info(`Running tests: ${automationIds.join(', ')}`);

    // Log the current timestamp, wait, then log the new timestamp

    for (const automationArray of automationIds) {
      const client = new httpm.HttpClient('Github Actions: run-tests', [], {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await client.postJson(
        `https://api.useclickai.com/api/evals/scheduleSync`,
        { automationIds: automationArray, input: inputMap }
      );

      /* Result is:
        {
          status: "error" | "success";
          results: {
              status: "error" | "success" | "planned" | "running" | "processing-video";
              duration: number;
              startedAt?: string | undefined;
              finishedAt?: string | undefined;
              videoFilePath?: string | undefined;
              error?: string | undefined;
          }[];
          error?: string | undefined;
        }
        
      */

      console.log(`Tests completed with status: ${result.status}`);
      console.log(result.result);

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
