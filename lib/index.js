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
const sh = __importStar(require("shelljs"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let channel = core.getInput("channel");
        let rbac = core.getInput("rbac");
        let dns = core.getInput("dns");
        let storage = core.getInput("storage");
        let addons = core.getInput("addons");
        sh.config.fatal = true;
        sh.config.verbose = true;
        let isStrict = isStrictMode(channel);
        try {
            sh.echo("install microk8s [channel: " + channel + "] [strict mode: " + isStrict + "]");
            if (isStrict) {
                executeCommand(isStrict, false, "snap install microk8s --channel=" + channel);
            }
            else {
                executeCommand(false, false, "snap install microk8s --classic --channel=" + channel);
            }
            let startTimeInMillis = Date.now();
            waitForReadyState(isStrict);
            prepareUserEnv(isStrict);
            if (addons) {
                enableAddons(JSON.parse(addons), isStrict);
            }
            waitTillApiServerIsReady(startTimeInMillis, isStrict);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function waitForReadyState(isStrict) {
    return __awaiter(this, void 0, void 0, function* () {
        let ready = false;
        while (!ready) {
            yield delay(2000);
            let code = executeCommand(isStrict, true, "microk8s status --wait-ready");
            if (code === 0) {
                ready = true;
                break;
            }
        }
    });
}
function prepareUserEnv(isStrict) {
    // Create microk8s group
    sh.echo("creating microk8s group.");
    if (!isStrict) {
        executeCommand(false, false, "usermod -a -G microk8s $USER");
    }
    sh.echo("creating default kubeconfig location.");
    executeCommand(false, false, "mkdir -p '/home/runner/.kube/'");
    sh.echo("Generating kubeconfig file to default location.");
    executeCommand(isStrict, false, "microk8s kubectl config view --raw > $HOME/.kube/config");
    sh.echo("Change default location ownership.");
    if (!isStrict) {
        executeCommand(false, false, "chown -f -R $USER $HOME/.kube/");
        executeCommand(false, false, "chmod go-rx $HOME/.kube/config");
    }
}
function enableAddon(addon, isStrict) {
    if (addon) {
        sh.echo('Start enabling ' + addon);
        waitForReadyState(isStrict);
        if (addon === "kubeflow") {
            sh.echo('kubeflow is no longer supported as a addon');
        }
        else {
            executeCommand(isStrict, false, 'sudo microk8s enable ' + addon);
        }
        waitForReadyState(isStrict);
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function enableAddons(addons, isStrict) {
    addons.forEach((addon) => {
        enableAddon(addon, isStrict);
    });
}
function waitTillApiServerIsReady(startTimeInMillis, isStrict) {
    return __awaiter(this, void 0, void 0, function* () {
        let endTimeInMillis = startTimeInMillis + 80000;
        let elapsed = Date.now();
        if (endTimeInMillis > elapsed) {
            yield delay(endTimeInMillis - elapsed);
            waitForReadyState(isStrict);
        }
    });
}
function isStrictMode(channel) {
    return channel.includes("-strict");
}
function executeCommand(isStrictMode, isSilent, command) {
    let sudo = "";
    if (!isStrictMode) {
        sudo = " sudo ";
    }
    return sh.exec(sudo + command, { silent: isSilent }).code;
}
run();
