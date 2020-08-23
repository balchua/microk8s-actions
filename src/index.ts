import * as core from '@actions/core';
import * as sh from 'shelljs';


async function run() {
  try {
    let channel = core.getInput("channel");
    console.log("creating microk8s group.");
    console.log("install microk8s..")
    sh.exec("sudo snap install microk8s --classic --channel=" + channel );

    waitForReadyState();
    prepareUserEnv();

    sh.exec("sudo snap instal kubectl --classic");

  } catch (error) {
    core.setFailed(error.message);
  }
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
  sh.exec("sudo usermod -a -G microk8s runner");
  sh.exec("mkdir -p /home/runner/.kube")
  sh.exec("sudo microk8s kubectl config view --raw > /home/runner/.kube/config")
  sh.exec("sudo  chown -f -R runner home/runner/.kube");
}

function delay(ms: number)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

run();