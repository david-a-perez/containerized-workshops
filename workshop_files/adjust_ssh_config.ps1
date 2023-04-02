$HostName = "data-science-1234"
$HostIp = "129.114.25.151"
$Key = "~/.ssh/$HostName-workshop.pem"
$WorkshopUser = "root"
$Port = "32778"


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
