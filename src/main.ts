import * as core from '@actions/core';
import * as exec from '@actions/exec';

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
