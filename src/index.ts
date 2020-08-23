import * as core from '@actions/core';
import * as sh from 'shelljs';


async function run() {

  let channel = core.getInput("channel");
  let rbac = core.getInput("rbac");
  let dns = core.getInput("dns");

  console.log("install microk8s..")
  sh.exec("sudo snap install microk8s --classic --channel=" + channel );

  waitForReadyState();
  prepareUserEnv();
  enableOrDisableRbac(rbac);
  enableOrDisableDns(dns);

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
  console.log("creating microk8s group.");
  sh.exec("sudo usermod -a -G microk8s $USER");
  console.log("creating default kubeconfig location.");
  sh.exec("mkdir -p '/home/runner/.kube/'")
  console.log("Generating kubeconfig file to default location.");
  sh.exec("sudo microk8s kubectl config view --raw > $HOME/.kube/config")
  console.log("Change default location ownership.");
  sh.exec("sudo chown -f -R $USER $HOME/.kube/");
}

function enableOrDisableRbac(rbac: string) {
  // Enabling RBAC
  if (rbac.toLowerCase() === "true") {
    console.log("Start enabling RBAC.");
    waitForReadyState()
    sh.exec("sudo microk8s enable rbac");
    waitForReadyState()
  }

}

function enableOrDisableDns(dns: string) {
  if (dns.toLowerCase() === "true") {
    console.log("Start enabling dns.");
    waitForReadyState()
    sh.exec("sudo microk8s enable dns");
    waitForReadyState()
  }

}

function delay(ms: number)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

run();