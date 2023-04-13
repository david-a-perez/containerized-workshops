$HostName = "{{ host.name }}"
$WorkshopDir = "{{ host.directory }}"

code --install-extension ms-vscode-remote.remote-ssh
code --remote "ssh-remote+$HostName-workshop" "$WorkshopDir"