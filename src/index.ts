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
    try{
      await delay(2000);
      sh.exec("sudo microk8s status --wait-ready");
      ready = true;
      break;
    } catch (err) {
      console.log("microk8s not yet ready.");
    }
  }  
}
  
function prepareUserEnv() {
  // Create microk8s group
  console.log("creating microk8s group.");
  sh.exec("sudo usermod -a -G microk8s runner");
  sh.exec("mkdir -p /home/runner/.kube")
  sh.exec("sudo microk8s kubectl config view --raw > /home/runner/.kube/config")
  sh.exec("sudo  chown -f -R runner home/runner/.kube");
}

function enableOrDisableRbac(rbac: string) {
  // Enabling RBAC
  console.log("enabling rbac.");
  if (rbac.toLowerCase() === "true") {
    waitForReadyState()
    sh.exec("microk8s enable rbac");
  }

}

function enableOrDisableDns(dns: string) {
  // Enabling RBAC
  console.log("enabling dns.");
  if (dns.toLowerCase() === "true") {
    waitForReadyState()
    sh.exec("microk8s enable dns");
  }

}

function delay(ms: number)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

run();