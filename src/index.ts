import * as core from '@actions/core';
import * as sh from 'shelljs';


async function run() {

  let channel = core.getInput("channel");
  let rbac = core.getInput("rbac");
  let dns = core.getInput("dns");
  let storage = core.getInput("storage");
  let addons = core.getInput("addons");
  sh.config.fatal = true;
  sh.config.verbose = true

  try {
    sh.echo("install microk8s..")
    sh.exec("sudo snap install microk8s --classic --channel=" + channel );
  
    let startTimeInMillis=Date.now();
    
    waitForReadyState();
    prepareUserEnv();
    enableOrDisableRbac(rbac);
    enableOrDisableDns(dns);
    enableOrDisableStorage(storage);
  
    if (addons) {
      enableAddons(JSON.parse(addons));
    }
  
    waitTillApiServerIsReady(startTimeInMillis)
  } catch (error) {
    core.setFailed(error.message);
  }

}

async function waitForReadyState() {
  let ready = false;
  while (!ready) {
    await delay(2000);
    let code = sh.exec("sudo microk8s status --wait-ready", { silent: true }).code;
    if (code === 0) {
      ready = true;
      break;
    }
  }  
}
  
function prepareUserEnv() {
  // Create microk8s group
  sh.echo("creating microk8s group.");
  sh.exec("sudo usermod -a -G microk8s $USER");
  sh.echo("creating default kubeconfig location.");
  sh.exec("mkdir -p '/home/runner/.kube/'")
  sh.echo("Generating kubeconfig file to default location.");
  sh.exec("sudo microk8s kubectl config view --raw > $HOME/.kube/config")
  sh.echo("Change default location ownership.");
  sh.exec("sudo chown -f -R $USER $HOME/.kube/");
  sh.chmod("go-rx", "$HOME/.kube/");
}

function enableOrDisableRbac(rbac: string) {
  // Enabling RBAC
  if (rbac.toLowerCase() === "true") {
    enableAddon('rbac');
  }

}

function enableOrDisableDns(dns: string) {
  if (dns.toLowerCase() === "true") {
    enableAddon('dns');
  }
}

function enableOrDisableStorage(storage: string) {
  if (storage.toLowerCase() === "true") {
    enableAddon('storage');
  }
}

function enableAddon(addon: string) {
  if (addon) {
    sh.echo('Start enabling %s', addon);
    waitForReadyState()
    if (addon === "kubeflow") {
      sh.exec("sg microk8s -c 'microk8s enable kubeflow'")
    } else {
      sh.exec('sudo microk8s enable ' + addon);
    }
    waitForReadyState()
  }
}

function enableKubeflow(addon: string) {

}

function delay(ms: number)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

function enableAddons(addons: string[]){
  
  addons.forEach( (addon) => {
      enableAddon(addon);
  });
    
}

async function waitTillApiServerIsReady(startTimeInMillis: number) {
  let endTimeInMillis = startTimeInMillis + 80000;
  let elapsed=Date.now();
  
  if (endTimeInMillis > elapsed){
    await delay(endTimeInMillis - elapsed)
    waitForReadyState()
  }
  
}

run();