#!/bin/sh

set -e

if [ -n "${HOST_UID}" -a "${HOST_UID}" != "$(id -u node)" ]; then
    usermod -u "${HOST_UID}" node
fi

yarn dev -- --host
