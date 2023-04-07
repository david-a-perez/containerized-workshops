#!/bin/bash
set -e

if [[ -v SSH_PUBLIC_KEY ]]; then
    echo $SSH_PUBLIC_KEY >> ~/.ssh/authorized_keys
fi

/usr/sbin/sshd

jupyter notebook --allow-root