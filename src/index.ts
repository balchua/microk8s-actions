import * as core from '@actions/core';
import { exec } from '@actions/exec';
import * as sh from 'shelljs';


async function run() {

  let channel = core.getInput("channel");
  let addons = core.getInput("addons");
  let devMode = core.getInput("devMode");
  sh.config.fatal = true;
  sh.config.verbose = true
  let isStrict = isStrictMode(channel)

  try {
    sh.echo("creating microk8s group.");
    executeCommand(false, "sudo groupadd --non-unique --gid \"$(getent group adm | cut -f3 -d:)\" microk8s")
    executeCommand(false, "sudo groupadd --non-unique --gid \"$(getent group adm | cut -f3 -d:)\" snap_microk8s")
    
    console.log(`'install microk8s [channel: ${channel}] [strict mode: ${isStrict}]'`)
    sh.echo("install microk8s [channel: " + channel + "] [strict mode: " + isStrict + "]")
    let microK8scommand = "sudo snap install microk8s --channel=" + channel;
    if (isStrict) {
      if (devMode === "true") {
        microK8scommand = microK8scommand + " --devmode "
      }
    } else {
      microK8scommand = microK8scommand + " --classic "
    }

    executeCommand(false, microK8scommand)
    let startTimeInMillis = Date.now();
    prepareUserEnv(isStrict);
    waitForReadyState(isStrict);

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
    executeCommand(false, 'sudo groupadd --non-unique --gid "$(getent group adm | cut -f3 -d:)" microk8s')
    executeCommand(false, "sudo usermod -a -G microk8s $USER")
  } else {
    executeCommand(false, 'sudo groupadd --non-unique --gid "$(getent group adm | cut -f3 -d:)" snap_microk8s')
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