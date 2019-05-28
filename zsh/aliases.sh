# mount nas
nas-mount() {
    mkdir ~/NAS
    sshfs mbednarek360@mbstorage.us.to:/files/ ~/NAS
}

# unmount nas
nas-unmount() {
    fusermount -u ~/NAS
    rmdir ~/NAS
}

# code sync
code-sync() {
    clear
    if bsync -b /home/mbednarek360/Code root@mbstorage.us.to:/data/mbednarek360/files/Code
    then
        clear
        echo "Sync completed successfully."
    else
        clear
        echo "Error syncing to NAS! Ensure proper connections and try again."
    fi
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
    mkdir /home/mbednarek360/cache/antibody
    rm /home/mbednarek360/.cache/antibody/plugins.sh
    antibody bundle < /home/mbednarek360/.config/zsh/plugins.txt > /home/mbednarek360/.cache/antibody/plugins.sh
    source /home/mbednarek360/.zshrc
}

# neofetch
neofetch() {
    clear
    echo
    command neofetch
}
