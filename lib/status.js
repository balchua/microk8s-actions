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
exports.verbosewaitForRegistryPvClaim = exports.silentwaitForRegistryPvClaim = exports.verboseWaitForStorageToBeReady = exports.silentWaitForStorageToBeReady = exports.waitForReadyState = void 0;
const util = __importStar(require("./util"));
const sh = __importStar(require("shelljs"));
function waitForReadyState() {
    return __awaiter(this, void 0, void 0, function* () {
        let ready = false;
        while (!ready) {
            yield util.delay(2000);
            let code = util.executeCommand(true, "sudo microk8s status --wait-ready");
            if (code === 0) {
                ready = true;
                break;
            }
        }
    });
}
exports.waitForReadyState = waitForReadyState;
function silentWaitForStorageToBeReady(addon) {
    waitForStorageToBeReady(true, addon);
}
exports.silentWaitForStorageToBeReady = silentWaitForStorageToBeReady;
function verboseWaitForStorageToBeReady(addon) {
    waitForStorageToBeReady(false, addon);
}
exports.verboseWaitForStorageToBeReady = verboseWaitForStorageToBeReady;
function silentwaitForRegistryPvClaim(addon) {
    waitForRegistryPvClaim(true, addon);
}
exports.silentwaitForRegistryPvClaim = silentwaitForRegistryPvClaim;
function verbosewaitForRegistryPvClaim(addon) {
    waitForRegistryPvClaim(false, addon);
}
exports.verbosewaitForRegistryPvClaim = verbosewaitForRegistryPvClaim;
function waitForStorageToBeReady(isSilent, addon) {
    if (addon === "hostpath-storage") {
        sh.echo('Waiting for hostpath-storage to be ready ');
        util.executeCommand(isSilent, "sudo microk8s kubectl rollout status deployment/hostpath-provisioner -n kube-system --timeout=90s");
    }
}
function waitForRegistryPvClaim(isSilent, addon) {
    if (addon === "registry") {
        sh.echo('Waiting for registry volume to be bound');
        util.executeCommand(isSilent, "sudo microk8s  kubectl wait --for=jsonpath='{.status.phase}'=Bound pvc/registry-claim -n container-registry --timeout=90s");
    }
}
