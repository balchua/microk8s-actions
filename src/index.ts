import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as sh from 'shelljs';


async function run() {

  let channel = core.getInput("channel");
  let addons = core.getInput("addons");
  sh.config.fatal = true;
  sh.config.verbose = true
  let isStrict = isStrictMode(channel)

  try {
    console.log(`'install microk8s [channel: ${channel}] [strict mode: ${isStrict}]'`)
    sh.echo("install microk8s [channel: " + channel + "] [strict mode: " + isStrict + "]")
    if (isStrict) {
      executeCommand(false, "sudo snap install microk8s --channel=" + channel)
    } else {
      executeCommand(false, "sudo snap install microk8s --classic --channel=" + channel)
    }

    let startTimeInMillis = Date.now();

    waitForReadyState(isStrict);
    prepareUserEnv(isStrict);

    if (addons) {
      enableAddons(JSON.parse(addons), isStrict);
    }

    waitTillApiServerIsReady(startTimeInMillis, isStrict)
  } catch (error) {
    core.setFailed(error.message);
  }

}

async function waitForReadyState(isStrict: boolean) {
  let ready = false;
  while (!ready) {
    await delay(2000);
    let code = executeCommand(true, "sudo microk8s status --wait-ready");
    if (code === 0) {
      ready = true;
      break;
    }
  }
}

function prepareUserEnv(isStrict: boolean) {
  // Create microk8s group
  sh.echo("creating microk8s group.");
  if (!isStrict) {
    executeCommand(false, "sudo usermod -a -G snap_microk8s $USER")
  } else {
    executeCommand(false, "sudo usermod -a -G snap_microk8s $USER")
  }
  sh.echo("creating default kubeconfig location.");
  executeCommand(false, "mkdir -p '/home/runner/.kube/'")
  sh.echo("Generating kubeconfig file to default location.");
  executeCommand(false, "sudo microk8s kubectl config view --raw > $HOME/.kube/config")
  sh.echo("Change default location ownership.");
  executeCommand(false, "sudo chown -f -R $USER $HOME/.kube/")
  executeCommand(false, "sudo chmod go-rx $HOME/.kube/config")

}

function enableAddon(addon: string, isStrict: boolean) {
  if (addon) {
    sh.echo('Start enabling ' + addon);
    waitForReadyState(isStrict)
    if (addon === "kubeflow") {
      sh.echo('kubeflow is no longer supported as a addon');
    } else {
      executeCommand(false, 'sudo microk8s enable ' + addon)
    }
    waitForReadyState(isStrict)
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function enableAddons(addons: string[], isStrict: boolean) {
  addons.forEach((addon) => {
    enableAddon(addon, isStrict);
  });

}

async function waitTillApiServerIsReady(startTimeInMillis: number, isStrict: boolean) {
  let endTimeInMillis = startTimeInMillis + 80000;
  let elapsed = Date.now();

  if (endTimeInMillis > elapsed) {
    await delay(endTimeInMillis - elapsed)
    waitForReadyState(isStrict)
  }

}

function isStrictMode(channel: string): boolean {
  return channel.includes("-strict")
}

function executeCommand(isSilent: boolean, command: string) {
  return sh.exec(command, { silent: isSilent }).code;
}
run();