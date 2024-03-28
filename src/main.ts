import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { execSync } from 'child_process';


function checkIsUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export async function run() {
  let stopTunnelArray: (() => void)[] = [];

  try {
    const suiteId = core.getInput('suiteId', {
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

    const proxyUrlsString = core.getInput('proxyUrls', {
      required: false,
      trimWhitespace: true
    });

    const proxyUrls = proxyUrlsString
      .split(/[\r\n,]+/)
      .map(row => row.trim())
      .filter(checkIsUrl);

    const inputMap = input
      .trim()
      .split(/[\r\n,]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0);


    // Get the commit SHA from the GITHUB_SHA environment variable
    const commitSHA = process.env.GITHUB_SHA;

    // Construct and execute the Git command to get the commit message
    try {
      const commitMessage = execSync(`git log --format=%B -n 1 ${commitSHA}`, {
        encoding: 'utf8'
      });
      console.log(`Commit message: ${commitMessage}`);
    } catch (error) {
      console.error(`Error getting commit message: ${error}`);
    }

    exec.exec('npx', [
      'clickai',
      'test',
      '--suite',
      suiteId,
      ...proxyUrls.flatMap(url => ['--url', url]),
      ...inputMap.flatMap(input => ['--input', input]),
      '--auth-token',
      apiKey,
      '--install-deps'
    ]);
  } catch (error) {
    core.setFailed((error as Error).message);
  } finally {
    stopTunnelArray.forEach(stopTunnel => stopTunnel());
    stopTunnelArray.length = 0;
  }
}
