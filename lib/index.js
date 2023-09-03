"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const core = __importStar(require("@actions/core"));
//import { exec } from '@actions/exec';
const sh = __importStar(require("shelljs"));
const mk8s = __importStar(require("./microk8s"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let addonConfig = core.getInput("addons");
        let devMode = core.getInput("devMode");
        let channel = core.getInput("channel");
        let launchConfigPath = core.getInput("launch-configuration");
        let sideloadImagePath = core.getInput("sideload-images-path");
        sh.config.fatal = true;
        sh.config.verbose = true;
        try {
            let addons = JSON.parse(addonConfig);
            let microk8s = new mk8s.MicroK8s(channel, addons, devMode, launchConfigPath, sideloadImagePath);
            microk8s.install();
            microk8s.enableAddons();
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
            }
            else {
                console.log('Unexpected error', error);
            }
        }
    });
}
run();
