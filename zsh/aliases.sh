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

# mbpw3 paste
mbpw3() {
    if [[ $1 == "-p" ]]
    then
        id=$(curl -s --data-binary @$2 "mbpw3.us.to:81/paste/create?pass=$3")
        echo "http://mbpw3.us.to/paste/$id" | xclip -selection clipboard
    elif [[ $1 == "-r" ]]
    then
        [[ $(curl -s "http://mbpw3.us.to:81/paste/delete?id=$2&pass=$3") == "true" ]]
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

# doom emacs
alias doom="~/.emacs.d/bin/doom"

# updates
update() {
    
    # packages
    yay -Syu --noconfirm
    yay -c --noconfirm
        
    # plugins
    plug-update
    doom -y upgrade
    doom -y clean
    doom -y refresh

    # done
    clear
    echo "Finished updating."
}

# mount phone over mtpfs
ssd-mount() {
    mkdir ~/SSD
    sudo mount -U b9925f5a-47c0-4ba0-a8ff-87cb43532f97 ~/SSD
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

# save recording
rec-save() {
    mv /tmp/rec.mp4 ./recording.mp4
    echo "Saved locally."
}

# delete recording
rec-rm() {
    rm /tmp/rec.mp4
}

# weather
wttr() {
    clear
    echo
    curl wttr.in/$1
    echo
}
