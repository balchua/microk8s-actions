import * as util from './util';
import * as status from './status';
import * as sh from 'shelljs';

export class Addon {
    addon: string;

    constructor(addon: string) {
        this.addon = addon;
    }

    public enable() {
        sh.echo('Start enabling ' + this.addon);
        status.waitForReadyState()
        if (this.addon === "kubeflow") {
            sh.echo('kubeflow is no longer supported as a addon');
        } else {
            util.executeCommand(false, 'sudo microk8s enable ' + this.addon)
            status.silentWaitForStorageToBeReady(this.addon)
            status.silentwaitForRegistryPvClaim(this.addon)
        }
        status.waitForReadyState()
    }
}