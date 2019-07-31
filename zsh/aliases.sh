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

# code sync
code-sync() {
    clear
    #if bsync -b $ZHOME/Code root@mbpw3.us.to:/data/mbednarek360/files/Code -p 24
    ssd-mount
    if sudo bsync -b $ZHOME/Code ~/SSD/Code  
    then
        clear
        echo "Sync completed successfully."
    else
        clear
        echo "Error syncing! Ensure proper connections and try again."
    fi
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
    sudo mount /dev/sdc1 ~/SSD
}

# unmount phone
ssd-unmount() {
    sudo umount ~/SSD
    rmdir ~/SSD
}
