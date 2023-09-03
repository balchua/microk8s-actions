import * as util from './util';
import * as sh from 'shelljs';
import * as status from './status'

export async function waitForReadyState() {
    let ready = false;
    while (!ready) {
        await util.delay(2000);
        let code = util.executeCommand(true, "sudo microk8s status --wait-ready");
        if (code === 0) {
            ready = true;
            break;
        }
    }
}

export function silentWaitForStorageToBeReady(addon: string) {
    waitForStorageToBeReady(true, addon);
}

export function verboseWaitForStorageToBeReady(addon: string) {
    waitForStorageToBeReady(false, addon);
}

export function silentwaitForRegistryPvClaim(addon: string) {
    waitForRegistryPvClaim(true, addon);
}

export function verbosewaitForRegistryPvClaim(addon: string) {
    waitForRegistryPvClaim(false, addon);
}
function waitForStorageToBeReady(isSilent: boolean, addon: string) {
    if (addon === "hostpath-storage") {
        sh.echo('Waiting for hostpath-storage to be ready ');
        util.executeCommand(isSilent, "sudo microk8s kubectl rollout status deployment/hostpath-provisioner -n kube-system --timeout=90s")
    }
}

function waitForRegistryPvClaim(isSilent: boolean, addon: string) {
    if (addon === "registry") {
        sh.echo('Waiting for registry volume to be bound');
        util.executeCommand(isSilent, "sudo microk8s  kubectl wait --for=jsonpath='{.status.phase}'=Bound pvc/registry-claim -n container-registry --timeout=90s")
    }
}