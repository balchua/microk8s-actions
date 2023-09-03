import * as sh from 'shelljs';

export function executeCommand(isSilent: boolean, command: string) {
    return sh.exec(command, { silent: isSilent }).code;
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}