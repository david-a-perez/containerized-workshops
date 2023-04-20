#!/bin/bash

CONFIG="$HOME/.ssh/config"

WORKSHOP_NAME="{{ host.name }}"
HOST_NAME="{{ host.ip }}"
KEY="$HOME/.ssh/$WORKSHOP_NAME-workshop.pem"
WORKSHOP_USER="root"
PORT="{{ exposedPort.22 }}"

if [ ! -f $HOME/.ssh/config ]; then
    touch $HOME/.ssh/config
    chmod 644 $HOME/.ssh/config
fi 

if ! grep -q "Host $WORKSHOP_NAME-workshop" $CONFIG; then
    echo -e "\n" >> $CONFIG
    echo "Host $WORKSHOP_NAME-workshop" >> $CONFIG
    echo "  StrictHostKeyChecking no" >> $CONFIG
    echo "  HostName $HOST_NAME" >> $CONFIG
    echo "  IdentityFile $KEY" >> $CONFIG
    echo "  User $WORKSHOP_USER" >> $CONFIG
    echo "  Port $PORT" >> $CONFIG
    echo -e "\n" >> $CONFIG
fi

cp "$WORKSHOP_NAME-workshop.pem" "$KEY"
chmod 600 "$KEY"

ssh "$WORKSHOP_NAME-workshop" -- echo "ssh is working"
