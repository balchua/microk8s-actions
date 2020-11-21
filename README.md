# MicroK8s actions

<img src="assets/microk8s-image.png" width="200" />

MicroK8s is Lightweight and pure upstream K8s.  The smallest, simplest, pure production K8s.  For clusters, laptops, IoT and Edge, on Intel and ARM.

This installs MicroK8s using Github Actions.  

More information about [MicroK8s](https://microk8s.io/)

This Github Action **only works on Linux machines.**

This Github Actions enables one to test their applications on multiple Kubernetes versions by following MicroK8s channels.

## Inputs

### `channel`

**Required**  This is the MicroK8s channel to choose.  Example: `latest/stable` or `1.18/stable` or `latest/edge/ha-preview`

### `rbac`

**Deprecated in favor of the new argument `addons`**

**Optional**  Since MicroK8s does not enable `RBAC` by default, user can choose whether they want to enable rbac or not.

### `dns`

**Deprecated in favor of the new argument `addons`**

**Optional**  Since MicroK8s does not enable `dns` by default, user can choose whether they want to enable CoreDNS or not.

### `storage`

**Deprecated in favor of the new argument `addons`**

**Optional** Since MicroK8s does not enable `storage` by default, user can choose whether they want to enable local hostPath storage or not.

### `addons`

New from `v0.2.0`

**Optional** a JSON array containing the MicroK8s addon to enable.  Example `addons: "['prometheus','metrics-server','linkerd']"`

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
    - uses: balchua/microk8s-actions@v0.2.1
      with:
        channel: '1.19/stable'
        addons: '["dns", "rbac", "storage", "registry", "metrics-server"]'
    - name: Test MicroK8s
      id: myactions
      run: |
        kubectl get no
        kubectl get pods -A -o wide
        
```

### Building

The main program is a Typescript, located in [src/index.ts](src/index.ts).  Before pushing the code to Github, you should compile the source to ES6.

```shell
$ npm run build
```

