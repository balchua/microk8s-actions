import * as core from '@actions/core';
import * as exec from '@actions/exec';


async function run() {
  try {
    let channel = core.getInput("channel");
    exec.exec("sudo", ["snap", "install", "microk8s", "--channel=" + channel, "--classic"]);
    // Create microk8s group
    exec.exec("sudo",["usermod", "-a","-G","microk8s", "$USER"]);
    exec.exec("sudo ", ["chown","-f", "-R", "$USER", "~/.kube"]);
    
    exec.exec("microk8s", ["status", "--wait-ready"]);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();