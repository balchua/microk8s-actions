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
  sh.exec("mkdir-p '$HOME/.kube/")
  sh.exec("sudo microk8s kubectl config view --raw > $HOME/.kube/config")
  sh.exec("sudo  chown -f -R runner $HOME/.kube");
}

function enableOrDisableRbac(rbac: string) {
  // Enabling RBAC
  console.log("enabling rbac.");
  if (rbac.toLowerCase() === "true") {
    waitForReadyState()
    sh.exec("sudo microk8s enable rbac");
  }

}

function enableOrDisableDns(dns: string) {
  // Enabling RBAC
  console.log("enabling dns.");
  if (dns.toLowerCase() === "true") {
    waitForReadyState()
    sh.exec("sudo microk8s enable dns");
  }

}

function delay(ms: number)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

run();