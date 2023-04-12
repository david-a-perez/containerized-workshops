#!/bin/bash
set -e

if [[ -v HTTP_PROXY || -v http_proxy || -v HTTPS_PROXY || -v https_proxy ]]; then
    echo "" >> ~/.bashrc
fi

if [[ -v HTTP_PROXY ]]; then
    echo "export HTTP_PROXY=$HTTP_PROXY" >> ~/.bashrc
fi

if [[ -v http_proxy ]]; then
    echo "export http_proxy=$http_proxy" >> ~/.bashrc
fi

if [[ -v HTTPS_PROXY ]]; then
    echo "export HTTPS_PROXY=$HTTPS_PROXY" >> ~/.bashrc
fi

if [[ -v https_proxy ]]; then
    echo "export https_proxy=$https_proxy" >> ~/.bashrc
fi

if [[ -v SSH_PUBLIC_KEY ]]; then
    echo $SSH_PUBLIC_KEY >> ~/.ssh/authorized_keys
fi

exec /usr/sbin/sshd -D
