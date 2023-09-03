import * as core from '@actions/core';
//import { exec } from '@actions/exec';
import * as sh from 'shelljs';
import * as util from './util';
import * as status from './status';
import * as mk8s from './microk8s';


async function run() {

  let addonConfig = core.getInput("addons");
  let devMode = core.getInput("devMode");
  let channel = core.getInput("channel");
  let launchConfigPath = core.getInput("launch-configuration");
  let sideloadImagePath = core.getInput("sideload-images-path");
  sh.config.fatal = true;
  sh.config.verbose = true


  try {
    let addons = JSON.parse(addonConfig);
    let microk8s = new mk8s.MicroK8s(channel,
      addons,
      devMode,
      launchConfigPath,
      sideloadImagePath);

    microk8s.install();
    microk8s.enableAddons();

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      console.log('Unexpected error', error);
    }

  }

}

run();