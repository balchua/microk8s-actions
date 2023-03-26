# Troubleshooting Guide

## Pushing to local registry

If you are using `docker/setup-buildx-action@v2` and would like to use the internal registry, 
you need to make sure that the docker network is bound to the host, otherwise you will not be able to push to the local registry.

Example:

``` yaml
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
      with:
        driver-opts: |
          network=host
```

Alternatively, you can use `sudo microk8s ctr image import myimage.tar`.
