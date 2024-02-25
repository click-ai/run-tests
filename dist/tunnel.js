"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadCloudflared = void 0;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const tc = __importStar(require("@actions/tool-cache"));
const io = __importStar(require("@actions/io"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const CF_MAC = 'https://github.com/cloudflare/cloudflared/releases/download/2022.10.3/cloudflared-darwin-amd64.tgz';
const CF_Linux = 'https://github.com/cloudflare/cloudflared/releases/download/2022.10.3/cloudflared-linux-amd64';
const CF_Win = 'https://github.com/cloudflare/cloudflared/releases/download/2022.10.3/cloudflared-windows-amd64.exe';
function downloadCloudflared() {
    return __awaiter(this, void 0, void 0, function* () {
        let link = CF_Win;
        let ext = '';
        if (os.platform() === 'darwin') {
            link = CF_MAC;
            ext = 'tgz';
        }
        else if (os.platform() === 'linux') {
            link = CF_Linux;
        }
        const workingDir = __dirname;
        core.info(`Downloading: ${link}`);
        const img = yield tc.downloadTool(link);
        core.info(`Downloaded file: ${img}`);
        if (os.platform() === 'darwin') {
            yield io.mv(img, path.join(workingDir, `./cf.${ext}`));
            yield exec.exec(`tar -xzf ${path.join(workingDir, `./cf.${ext}`)}`);
            yield io.mv('cloudflared', path.join(workingDir, 'cloudflared'));
            return `${workingDir}/cloudflared`;
        }
        if (os.platform() === 'linux') {
            yield io.mv(img, path.join(workingDir, 'cloudflared'));
            yield exec.exec(`chmod +x ${path.join(workingDir, 'cloudflared')}`);
            return path.join(workingDir, 'cloudflared');
        }
        yield io.mv(img, path.join(workingDir, 'cloudflared.exe'));
        return `${workingDir}/cloudflared.exe`;
    });
}
exports.downloadCloudflared = downloadCloudflared;
