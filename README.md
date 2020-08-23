# MicroK8s actions

This installs MicroK8s using Github Actions.  

** Only works on Linux machines. **

This Github Actions enables one to test their applications on multiple Kubernetes versions by following MicroK8s channels.

## Inputs

### `channel`

** Required **  This is the MicroK8s channel to choose.  Example: `latest/stable` or `1.18/stable` or `latest/edge/ha-preview`

### `rbac`

** Required **  Since MicroK8s does not enable `RBAC` by default, user can choose whether they want to enable rbac or not.

### `dns`

** Required **  Since MicroK8s does not enable `dns` by default, user can choose whether they want to enable CoreDNS or not.

## Example Usage:

Below shows how one can use the Action.

```yaml
name: Test Microk8s
on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    name: A job to install MicroK8s
    steps:
    - uses: balchua/microk8s-actions@release/v0.1
      with:
        channel: '1.18/stable'
        rbac: 'true'
        dns: 'true'
    - name: Test MicroK8s
      id: myactions
      run: |
        kubectl get no
        kubectl get pods -A -o wide
        
```
