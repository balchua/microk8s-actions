import * as core from '@actions/core';
import * as exec from '@actions/exec';


const ChannelInput: string = "channel"; 
async function run() {
  try {
    exec.exec("sudo", ["snap", "install", "microk8s", "--channel="+ChannelInput, "--classic"]);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();