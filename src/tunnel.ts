import core from '@actions/core';
import exec from '@actions/exec';
import tc from '@actions/tool-cache';
import io from '@actions/io';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const CF_MAC =
  'https://github.com/cloudflare/cloudflared/releases/download/2022.10.3/cloudflared-darwin-amd64.tgz';
const CF_Linux =
  'https://github.com/cloudflare/cloudflared/releases/download/2022.10.3/cloudflared-linux-amd64';
const CF_Win =
  'https://github.com/cloudflare/cloudflared/releases/download/2022.10.3/cloudflared-windows-amd64.exe';

export async function downloadCloudflared() {
  let link = CF_Win;
  let ext = '';
  if (os.platform() === 'darwin') {
    link = CF_MAC;
    ext = 'tgz';
  } else if (os.platform() === 'linux') {
    link = CF_Linux;
  }

  const workingDir = __dirname;

  core.info(`Downloading: ${link}`);
  const img = await tc.downloadTool(link);
  core.info(`Downloaded file: ${img}`);

  if (os.platform() === 'darwin') {
    await io.mv(img, path.join(workingDir, `./cf.${ext}`));
    await exec.exec(`tar -xzf ${path.join(workingDir, `./cf.${ext}`)}`);
    await io.mv('cloudflared', path.join(workingDir, 'cloudflared'));
    return `${workingDir}/cloudflared`;
  }
  if (os.platform() === 'linux') {
    await io.mv(img, path.join(workingDir, 'cloudflared'));
    await exec.exec(`chmod +x ${path.join(workingDir, 'cloudflared')}`);
    return path.join(workingDir, 'cloudflared');
  }
  await io.mv(img, path.join(workingDir, 'cloudflared.exe'));

  return `${workingDir}/cloudflared.exe`;
}
