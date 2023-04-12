$HostName = "{{ host.name }}"
$HostIp = "{{ host.ip }}"
$Key = "~/.ssh/$HostName-workshop.pem"
$WorkshopUser = "root"
$Port = "{{ exposedPort.22 }}"


If(!(test-path -PathType container "~/.ssh"))
{
    New-Item -Path "~/.ssh" -ItemType "directory"
}

if (!((test-path -PathType leaf "~/.ssh/config") -and (Select-String -Path "~/.ssh/config" -Pattern "Host $HostName-workshop" -SimpleMatch -Quiet)))
{
    Add-Content -Path "~/.ssh/config" -Value ""
    Add-Content -Path "~/.ssh/config" -Value "Host $HostName-workshop"
    Add-Content -Path "~/.ssh/config" -Value "  StrictHostKeyChecking no"
    Add-Content -Path "~/.ssh/config" -Value "  HostName $HostIp"
    Add-Content -Path "~/.ssh/config" -Value "  IdentityFile $Key"
    Add-Content -Path "~/.ssh/config" -Value "  User $WorkshopUser"
    Add-Content -Path "~/.ssh/config" -Value "  Port $Port"
}
 
Copy-Item "$HostName-workshop.pem" -Destination "$HOME\.ssh\"

# ssh "$HostName-workshop" -- echo "ssh is working"

# Vscode snippet for windows

code --install-extension ms-vscode-remote.remote-ssh
code --remote "ssh-remote+$HostName-workshop" "/$WorkshopUser/workshop/"