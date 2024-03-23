import * as core from '@actions/core';
import * as clickai from 'clickai';
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

    const cloudflaredPath = await downloadCloudflared();

    console.log('Starting proxy to urls:', proxyUrls.join(', '));

    let proxyMap: Record<string, string> | undefined = undefined;

    if (proxyUrls.length > 0) {
      const res = await clickai.runTunnelMultiple({
        urls: proxyUrls,
        cloudflaredPath
      });

      res.forEach(tunnel => {
        if (!proxyMap) proxyMap = {};
        proxyMap[tunnel.url] = tunnel.publicUrl;
        stopTunnelArray.push(tunnel.stop);
      });
    }

    console.log('Proxy started, scheduling tests');

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

    await clickai.scheduleSuite({
      authToken: apiKey,
      suiteId,
      inputMap,
      proxyMap
    });
    core.info(`All tests passed`);
  } catch (error) {
    core.setFailed((error as Error).message);
  } finally {
    stopTunnelArray.forEach(stopTunnel => stopTunnel());
    stopTunnelArray.length = 0;
  }
}
