import * as core from '@actions/core';
import * as exec from '@actions/exec';


async function run() {
  try {
    let channel = core.getInput("channel");
    console.log("install microk8s..")
    await exec.exec("sudo", ["snap", "install", "microk8s", "--channel=" + channel, "--classic"]);
    await exec.exec("sudo", ["microk8s", "status", "--wait-ready"]);

    // Create microk8s group
    await exec.exec("sudo",["usermod", "-a","-G","microk8s", "$USER"]);
    await exec.exec("sudo ", ["chown","-f", "-R", "$USER", "~/.kube"]);
    

    await exec.exec("alias",["kubectl='microk8s kubectl`"]);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();