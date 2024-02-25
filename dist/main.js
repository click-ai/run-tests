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
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const clickai = __importStar(require("clickai"));
const tunnel_1 = require("./tunnel");
function checkIsUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch (e) {
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
        const cloudflaredPath = await (0, tunnel_1.downloadCloudflared)();
        console.log('Starting proxy to urls:', proxyUrls.join(', '));
        let proxyMap = undefined;
        if (proxyUrls.length > 0) {
            const res = await clickai.runTunnelMultiple({
                urls: proxyUrls,
                cloudflaredPath
            });
            proxyMap = res.reduce((acc, t) => {
                acc[t.url] = t.publicUrl;
                return acc;
            }, {});
        }
        console.log('Proxy started, scheduling tests');
        let automationIds = [[]];
        if (tests) {
            automationIds = JSON.parse(tests.trim());
            // Verify automationIds is string[][]
            if (!Array.isArray(automationIds) ||
                !automationIds.every(Array.isArray) ||
                !automationIds.flat().every(id => typeof id === 'string')) {
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
            .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
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
    }
    catch (error) {
        // Fail the workflow run if an error occurs
        core.setFailed(error.message);
    }
}
exports.run = run;
//# sourceMappingURL=main.js.map