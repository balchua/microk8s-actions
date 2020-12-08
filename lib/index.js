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
        try {
            sh.echo("install microk8s..");
            sh.exec("sudo snap install microk8s --classic --channel=" + channel);
            let startTimeInMillis = Date.now();
            waitForReadyState();
            prepareUserEnv();
            enableOrDisableRbac(rbac);
            enableOrDisableDns(dns);
            enableOrDisableStorage(storage);
            if (addons) {
                enableAddons(JSON.parse(addons));
            }
            waitTillApiServerIsReady(startTimeInMillis);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function waitForReadyState() {
    return __awaiter(this, void 0, void 0, function* () {
        let ready = false;
        while (!ready) {
            yield delay(2000);
            let code = sh.exec("sudo microk8s status --wait-ready", { silent: true }).code;
            if (code === 0) {
                ready = true;
                break;
            }
        }
    });
}
function prepareUserEnv() {
    // Create microk8s group
    sh.echo("creating microk8s group.");
    sh.exec("sudo usermod -a -G microk8s $USER");
    sh.echo("creating default kubeconfig location.");
    sh.exec("mkdir -p '/home/runner/.kube/'");
    sh.echo("Generating kubeconfig file to default location.");
    sh.exec("sudo microk8s kubectl config view --raw > $HOME/.kube/config");
    sh.echo("Change default location ownership.");
    sh.exec("sudo chown -f -R $USER $HOME/.kube/");
    sh.exec("chmod go-rx $HOME/.kube/config");
}
function enableOrDisableRbac(rbac) {
    // Enabling RBAC
    if (rbac.toLowerCase() === "true") {
        enableAddon('rbac');
    }
}
function enableOrDisableDns(dns) {
    if (dns.toLowerCase() === "true") {
        enableAddon('dns');
    }
}
function enableOrDisableStorage(storage) {
    if (storage.toLowerCase() === "true") {
        enableAddon('storage');
    }
}
function enableAddon(addon) {
    if (addon) {
        sh.echo('Start enabling %s', addon);
        waitForReadyState();
        if (addon === "kubeflow") {
            sh.exec("sg microk8s -c 'microk8s enable kubeflow'");
        }
        else {
            sh.exec('sudo microk8s enable ' + addon);
        }
        waitForReadyState();
    }
}
function enableKubeflow(addon) {
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function enableAddons(addons) {
    addons.forEach((addon) => {
        enableAddon(addon);
    });
}
function waitTillApiServerIsReady(startTimeInMillis) {
    return __awaiter(this, void 0, void 0, function* () {
        let endTimeInMillis = startTimeInMillis + 80000;
        let elapsed = Date.now();
        if (endTimeInMillis > elapsed) {
            yield delay(endTimeInMillis - elapsed);
            waitForReadyState();
        }
    });
}
run();
