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
        console.log("install microk8s..");
        sh.exec("sudo snap install microk8s --classic --channel=" + channel);
        waitForReadyState();
        prepareUserEnv();
    });
}
function waitForReadyState() {
    return __awaiter(this, void 0, void 0, function* () {
        let ready = false;
        while (!ready) {
            try {
                yield delay(2000);
                sh.exec("sudo microk8s status --wait-ready");
                ready = true;
                break;
            }
            catch (err) {
                console.log("microk8s not yet ready.");
            }
        }
    });
}
function prepareUserEnv() {
    // Create microk8s group
    console.log("creating microk8s group.");
    sh.exec("sudo usermod -a -G microk8s runner");
    sh.exec("mkdir -p /home/runner/.kube");
    sh.exec("sudo microk8s kubectl config view --raw > /home/runner/.kube/config");
    sh.exec("sudo  chown -f -R runner home/runner/.kube");
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
run();
