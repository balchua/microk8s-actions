import * as core from '@actions/core';
import * as exec from '@actions/exec';


async function run() {
  try {
    let channel = core.getInput("channel");
    console.log("creating microk8s group.");
    await exec.exec("sudo", ["groupadd microk8s"]);
    console.log("install microk8s..")
    await exec.exec("sudo", ["snap", "install", "microk8s", "--channel=" + channel, "--classic"]);

    waitForReadyState();
    // Create microk8s group
    await exec.exec("sudo",["usermod", "-a","-G","microk8s", "$USER"]);
    await exec.exec("sudo ", ["chown","-f", "-R", "$USER", "~/.kube"]);
    

    await exec.exec("alias",["kubectl='microk8s kubectl`"]);

  } catch (error) {
    core.setFailed(error.message);
  }
}

async function waitForReadyState() {
  let ready = false;
  while (!ready) {
    try{
      await exec.exec("sudo", ["microk8s", "status", "--wait-ready"]);
      ready = true;
    } catch (err) {
      console.log("microk8s not yet ready.");
    }
  }  
  
  
}

run();