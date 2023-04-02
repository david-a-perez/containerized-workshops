#!/bin/bash

CONFIG="$HOME/.ssh/config"

WORKSHOP_NAME="data-science"
HOST_NAME="129.114.27.188"
KEY="$HOME/.ssh/$WORKSHOP_NAME-workshop.pem"
WORKSHOP_USER="root"
PORT="32772"

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