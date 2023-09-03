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
exports.MicroK8s = void 0;
const addon_1 = require("./addon");
const sh = __importStar(require("shelljs"));
const util = __importStar(require("./util"));
const core = __importStar(require("@actions/core"));
const status = __importStar(require("./status"));
class MicroK8s {
    constructor(channel, addons, devMode, launchConfigPath, sideloadImagePath) {
        this.channel = channel;
        this.addons = new Array(addons.length);
        addons.forEach((addonString) => {
            let addon = new addon_1.Addon(addonString);
            this.addons.push(addon);
        });
        this.isDevMode = devMode === "true";
        this.isStrictMode = this.channel.includes("-strict");
        this.command = "sudo snap install microk8s --channel=" + this.channel;
        this.launchConfigPath = launchConfigPath;
        this.sideloadImagePath = sideloadImagePath;
    }
    generateMicrok8sInstallCommand() {
        if (this.isStrictMode) {
            this.command = this.command + " --devmode ";
        }
        else {
            this.command = this.command + " --classic ";
        }
    }
    prepareUserEnvironment() {
        // Create microk8s group
        sh.echo("creating microk8s group.");
        if (!this.isStrictMode) {
            util.executeCommand(false, "sudo usermod -a -G microk8s $USER");
        }
        else {
            util.executeCommand(false, "sudo usermod -a -G snap_microk8s $USER");
        }
        sh.echo("creating default kubeconfig location.");
        util.executeCommand(false, "mkdir -p '$HOME/.kube/'");
        sh.echo("Generating kubeconfig file to default location.");
        util.executeCommand(false, "sudo microk8s kubectl config view --raw > $HOME/.kube/config");
        sh.echo("Change default location ownership.");
        util.executeCommand(false, "sudo chown -f -R $USER $HOME/.kube/");
        util.executeCommand(false, "sudo chmod go-rx $HOME/.kube/config");
    }
    setupLaunchConfiguration() {
        if (this.launchConfigPath !== "") {
            util.executeCommand(false, "sudo mkdir -p /var/snap/microk8s/common/");
            util.executeCommand(false, "sudo cp " + this.launchConfigPath + " " + "/var/snap/microk8s/common/.microk8s.yaml");
        }
    }
    sideloadImages() {
        if (this.sideloadImagePath !== "") {
            util.executeCommand(false, "sudo mkdir -p /var/snap/microk8s/common/sideload");
            util.executeCommand(false, "sudo cp " + this.sideloadImagePath + "/*.tar" + " " + "/var/snap/microk8s/common/sideload/");
        }
    }
    failToInstall(error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            console.log('Unexpected error', error);
        }
    }
    waitTillApiServerIsReady() {
        return __awaiter(this, void 0, void 0, function* () {
            let startTimeInMillis = Date.now();
            let endTimeInMillis = startTimeInMillis + 80000;
            let elapsed = Date.now();
            if (endTimeInMillis > elapsed) {
                yield util.delay(endTimeInMillis - elapsed);
                status.waitForReadyState();
            }
        });
    }
    install() {
        console.log(`'install microk8s [channel: ${this.channel}] [strict mode: ${this.isStrictMode}]'`);
        sh.echo("install microk8s [channel: " + this.channel + "] [strict mode: " + this.isStrictMode + "]");
        try {
            this.prepareUserEnvironment();
            this.setupLaunchConfiguration();
            this.sideloadImages();
            this.generateMicrok8sInstallCommand();
            util.executeCommand(false, this.command);
            this.waitTillApiServerIsReady();
        }
        catch (error) {
            this.failToInstall(error);
        }
    }
    enableAddons() {
        this.addons.forEach((addon) => {
            addon.enable();
        });
    }
}
exports.MicroK8s = MicroK8s;
