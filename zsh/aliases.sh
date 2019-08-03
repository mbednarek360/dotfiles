# mount nas
nas-mount() {
    mkdir ~/NAS
    sshfs mbednarek360@mbpw3.us.to:/files/ ~/NAS -p 24
}

# unmount nas
nas-unmount() {
    fusermount -u ~/NAS
    rmdir ~/NAS
}

# sshs
nas-ssh() {
    ssh root@mbpw3.us.to -p 24
}
prime-ssh() {
    ssh mbednarek360@mbpw3.us.to
}

batch-sync() {
    if [[ $2 == "-m" ]]
    then
        sudo bsync $ZHOME/$1 ~/SSD/$1
    else
        sudo bsync -b $ZHOME/$1 ~/SSD/$1
    fi
}

# generic sync
sync() {
    clear
    ssd-mount
    if batch-sync $1 $2
    then
        clear
        echo "Sync completed successfully."
    fi
    ssd-unmount
}

# sync implementations
code-sync() {
    sync Code $1
}
doc-sync() {
    sync Documents $1
}
conf-sync() {
    ssd-mount
    git -C ~/SSD/Config/Desktop reset --hard ORIG_HEAD
    git -C ~/SSD/Config/Desktop pull origin master 
    ssd-unmount
}

# mblock
mblock() {
    if [[ $@ == "-t" ]]
    then
        echo "toggle" | nc 192.168.1.9 1500
    	mblock -s
	elif [[ $@ == "-s" ]]
	then
        notify-send "MBLock: $(echo "status" | nc 192.168.1.9 1500)"
	fi	
}

# plugin update
plug-update() {
    rm $ZHOME/.cache/zsh/plugins.sh
    antibody bundle < $ZHOME/.config/zsh/plugins.txt > $ZHOME/.cache/zsh/plugins.sh
    source $ZHOME/.config/zsh/zshrc
}

# neofetch
neofetch() {
    clear
    echo
    command neofetch
}

# finshir
raze() {
    ip=$1
    port=$2
    ((($TERM -e watch -n 1 nc -zv -w5 $ip $port) && clear; killall -s INT finshir) &)
    finshir --wait 1s --write-periodicity 10s --receiver $ip:$port
}

# updates
update() {
    
    # packages
    sudo xbps-install -Syu
    sudo vpm ar
    sudo vpm cl
    sudo vkpurge rm all

    # plugins
    plug-update
    nvim -c "PlugUpdate | qa"
    sudo nvim -c "PlugUpdate | qa"

    # done
    clear
    echo "Finished updating."
}

# mount phone over mtpfs
ssd-mount() {
    mkdir ~/SSD
    sudo mount -U 18d5b4c1-86f3-4e38-b75b-a8e0dccada25 ~/SSD
    sudo chmod 0777 -R ~/SSD
}

# unmount phone
ssd-unmount() {
    sudo umount ~/SSD
    rmdir ~/SSD
}

# save screenshot
scr-save() {
    mv /tmp/scr.png ./screenshot.png
    echo "Saved locally."
}

# delete screenshot
scr-rm() {
    rm /tmp/scr.png
}
