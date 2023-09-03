import { Addon } from "./addon";
import * as sh from 'shelljs';
import * as util from './util';
import * as core from '@actions/core';
import * as status from './status';

export class MicroK8s {
    channel: string;
    addons: Array<Addon>;
    isStrictMode: boolean;
    isDevMode: boolean;
    command: string;
    launchConfigPath: string;
    sideloadImagePath: string;


    constructor(channel: string, addons: string[], devMode: string, launchConfigPath: string, sideloadImagePath: string) {
        this.channel = channel;
        this.addons = new Array(addons.length);
        addons.forEach((addonString) => {
            let addon = new Addon(addonString);
            this.addons.push(addon);
        });
        this.isDevMode = devMode === "true";
        this.isStrictMode = this.channel.includes("-strict");
        this.command = "sudo snap install microk8s --channel=" + this.channel;
        this.launchConfigPath = launchConfigPath;
        this.sideloadImagePath = sideloadImagePath;
    }

    private generateMicrok8sInstallCommand() {
        if (this.isStrictMode) {
            this.command = this.command + " --devmode "
        } else {
            this.command = this.command + " --classic "
        }
    }

    private prepareUserEnvironment() {
        // Create microk8s group
        sh.echo("creating microk8s group.");
        if (!this.isStrictMode) {
            util.executeCommand(false, "sudo usermod -a -G microk8s $USER");
        } else {
            util.executeCommand(false, "sudo usermod -a -G snap_microk8s $USER");
        }
        sh.echo("creating default kubeconfig location.");
        util.executeCommand(false, "mkdir -p '$HOME/.kube/'");
        sh.echo("Generating kubeconfig file to default location.");
        util.executeCommand(false, "sudo microk8s kubectl config view --raw > $HOME/.kube/config")
        sh.echo("Change default location ownership.");
        util.executeCommand(false, "sudo chown -f -R $USER $HOME/.kube/")
        util.executeCommand(false, "sudo chmod go-rx $HOME/.kube/config")


    }

    private setupLaunchConfiguration() {
        if (this.launchConfigPath !== "") {
            util.executeCommand(false, "sudo mkdir -p /var/snap/microk8s/common/");
            util.executeCommand(false, "sudo cp " + this.launchConfigPath + " " + "/var/snap/microk8s/common/.microk8s.yaml");
        }
    }

    private sideloadImages() {
        if (this.sideloadImagePath !== "") {
            util.executeCommand(false, "sudo mkdir -p /var/snap/microk8s/common/sideload");
            util.executeCommand(false, "sudo cp " + this.sideloadImagePath + "/*.tar" + " " + "/var/snap/microk8s/common/sideload/");
        }
    }

    private failToInstall(error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            console.log('Unexpected error', error);
        }
    }

    private async waitTillApiServerIsReady() {
        let startTimeInMillis = Date.now();
        let endTimeInMillis = startTimeInMillis + 80000;
        let elapsed = Date.now();

        if (endTimeInMillis > elapsed) {
            await util.delay(endTimeInMillis - elapsed)
            status.waitForReadyState()
        }

    }

    public install() {
        console.log(`'install microk8s [channel: ${this.channel}] [strict mode: ${this.isStrictMode}]'`)
        sh.echo("install microk8s [channel: " + this.channel + "] [strict mode: " + this.isStrictMode + "]")
        try {
            this.setupLaunchConfiguration();
            this.sideloadImages();
            this.generateMicrok8sInstallCommand();
            util.executeCommand(false, this.command);
            this.prepareUserEnvironment();
            this.waitTillApiServerIsReady();
        } catch (error) {
            this.failToInstall(error);
        }
    }

    public enableAddons() {
        this.addons.forEach((addon) => {
            addon.enable();
        });
    }

}