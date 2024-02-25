"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadCloudflared = void 0;
const core_1 = __importDefault(require("@actions/core"));
const exec_1 = __importDefault(require("@actions/exec"));
const tool_cache_1 = __importDefault(require("@actions/tool-cache"));
const io_1 = __importDefault(require("@actions/io"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const CF_MAC = 'https://github.com/cloudflare/cloudflared/releases/download/2022.10.3/cloudflared-darwin-amd64.tgz';
const CF_Linux = 'https://github.com/cloudflare/cloudflared/releases/download/2022.10.3/cloudflared-linux-amd64';
const CF_Win = 'https://github.com/cloudflare/cloudflared/releases/download/2022.10.3/cloudflared-windows-amd64.exe';
function downloadCloudflared() {
    return __awaiter(this, void 0, void 0, function* () {
        let link = CF_Win;
        let ext = '';
        if (os_1.default.platform() === 'darwin') {
            link = CF_MAC;
            ext = 'tgz';
        }
        else if (os_1.default.platform() === 'linux') {
            link = CF_Linux;
        }
        const workingDir = __dirname;
        core_1.default.info(`Downloading: ${link}`);
        const img = yield tool_cache_1.default.downloadTool(link);
        core_1.default.info(`Downloaded file: ${img}`);
        if (os_1.default.platform() === 'darwin') {
            yield io_1.default.mv(img, path_1.default.join(workingDir, `./cf.${ext}`));
            yield exec_1.default.exec(`tar -xzf ${path_1.default.join(workingDir, `./cf.${ext}`)}`);
            yield io_1.default.mv('cloudflared', path_1.default.join(workingDir, 'cloudflared'));
            return `${workingDir}/cloudflared`;
        }
        if (os_1.default.platform() === 'linux') {
            yield io_1.default.mv(img, path_1.default.join(workingDir, 'cloudflared'));
            yield exec_1.default.exec(`chmod +x ${path_1.default.join(workingDir, 'cloudflared')}`);
            return path_1.default.join(workingDir, 'cloudflared');
        }
        yield io_1.default.mv(img, path_1.default.join(workingDir, 'cloudflared.exe'));
        return `${workingDir}/cloudflared.exe`;
    });
}
exports.downloadCloudflared = downloadCloudflared;
