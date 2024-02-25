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
exports.run = void 0;
const core_1 = __importDefault(require("@actions/core"));
const clickai_1 = __importDefault(require("clickai"));
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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tests = core_1.default.getInput('tests', {
                required: false,
                trimWhitespace: true
            });
            const apiKey = core_1.default.getInput('apiKey', {
                required: true,
                trimWhitespace: true
            });
            const input = core_1.default.getInput('input', {
                required: false,
                trimWhitespace: true
            });
            const proxyUrlsString = core_1.default.getInput('proxyUrls', {
                required: false,
                trimWhitespace: true
            });
            const proxyUrls = proxyUrlsString
                .split(/[\r\n,]+/)
                .map(row => row.trim())
                .filter(checkIsUrl);
            const cloudflaredPath = yield (0, tunnel_1.downloadCloudflared)();
            console.log('Starting proxy to urls:', proxyUrls.join(', '));
            let proxyMap = undefined;
            if (proxyUrls.length > 0) {
                const res = yield clickai_1.default.runTunnelMultiple({
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
                core_1.default.info(`Running tests: ${automationIds.flat().join(', ')}`);
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
                const result = yield clickai_1.default.scheduleTests(Object.assign(Object.assign({ authToken: apiKey }, (automationArray.length > 0 && { automationIds: automationArray })), { inputMap,
                    proxyMap }));
                core_1.default.info(`Tests completed with status: ${result.status}`);
                if (result.status === 'error') {
                    throw new Error(`Error`);
                }
                core_1.default.info(`All tests: ${automationArray.join(', ')} passed`);
            }
            core_1.default.info(`All tests passed`);
        }
        catch (error) {
            // Fail the workflow run if an error occurs
            core_1.default.setFailed(error.message);
        }
    });
}
exports.run = run;
