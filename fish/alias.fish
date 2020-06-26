set -x ZHOME /home/mbednarek360

# main sync function
function batch-sync
    sudo osync.sh $ZHOME/.config/osync/sync.conf --initiator="$ZHOME/$argv[1]" --target="$ZHOME/SSD/$argv[1]"
end

# generic sync
function sync
    if test $argv[2] = "-x"
        bspc node -t floating
    end
    clear
    ssd-mount
    if batch-sync $argv[1]
        ssd-unmount
        clear
        echo "Sync completed successfully."
    else
        ssd-unmount
        #clear
        echo "Error during sync!"
    end
    if test $argv[2] = "-x"
        sh -c "read -n 1 -s -r -p 'Press any key to continue...'"
        echo
    end
end

# sync implementations
function code-sync
    #code-clean
    sync Code $argv[1]
end
function doc-sync
    sync Documents $argv[1]
end
function conf-sync
    ssd-mount
    git -C ~/SSD/Config/dotfiles reset --hard ORIG_HEAD
    git -C ~/SSD/Config/dotfiles pull origin master
    ssd-unmount
end

# scrub code dir for replacable files
function code-clean
    find $ZHOME/Code -type d -name target -exec rm -vr {} \;
    find $ZHOME/Code -type d -name nimcache -exec rm -vr {} \;
    find $ZHOME/Code -type d -name node_modules -exec rm -vr {} \;
    find $ZHOME/Code -type d -name __pycache__ -exec rm -vr {} \;
    find $ZHOME/Code -type d -name bin -exec rm -vr {} \;
    find $ZHOME/Code -type d -name packages -exec rm -vr {} \;
    find $ZHOME/Code -type d -name obj -exec rm -vr {} \;
    find $ZHOME/Code -type d -name libraries -exec rm -vr {} \;
    find $ZHOME/Code -name '*tmp*' -exec rm -vr {} \;
    find $ZHOME/Code -name '*temp*' -exec rm -vr {} \;
    find $ZHOME/Code -name '*.vscode*' -exec rm -vr {} \;
    find $ZHOME/Code -name '*.out' -exec rm -v {} \;
    find $ZHOME/Code -name '*.class' -exec rm -v {} \;
    find $ZHOME/Code -name Cargo.lock -exec rm -v {} \;
    find $ZHOME/Code -type l -exec rm -v {} \;
end

# mblock
function mblock
    if test $argv[1] = "-t"
        echo "toggle" | nc 192.168.1.9 1500
    	mblock -s
	else if test $argv[1] = "-s"
        set stat (echo "status" | nc 192.168.1.9 1500)
        notify-send "MBLock: $stat"
	end	
end

# plugin update
function plug-update
    fish ~/.config/fish/plugins.fish
    fisher
end

# finshir
function raze
    set ip $argv[1]
    set port $argv[2]
    $TERM -e watch -n 1 nc -zv -w5 $ip $port && clear; killall -s INT finshir &
    finshir --wait 1s --write-periodicity 10s --receiver $ip:$port
end

# encryption
function encrypt
    openssl enc -aria-256-cbc -pbkdf2 -in $argv[1] -out $argv[1].256 $argv[2] $argv[3]
    rm $argv[1]
end

# decryption
function decrypt
    openssl enc -aria-256-cbc -pbkdf2 -d -in $argv[1] > "${1%.*}"
    rm $argv[1]
end

# update encrypted vault
function bw-update
    ssd-mount
    echo -n "Master Password: "
    echo 
    read -s pass
    bw sync $pass
    bw export $pass --format json --output vault.json
    encrypt vault.json -pass pass:$pass
    rm ~/SSD/Config/vault.json.256
    mv vault.json.256 ~/SSD/Config/
    ssd-unmount
end

# update package list
function pkg-update
    yay -Qeq > $ZHOME/.config/pkglist.txt
end

# updates
function update
    
    # packages
    yay -Syu --noconfirm
    yay -c --noconfirm
    pkg-update
        
    # plugins
    plug-update

    # rust
    rustup update

    # betterdiscord
    betterdiscordctl update

    # done
    clear
    echo "Finished updating."
end

# mount ssd
function ssd-mount
    mkdir $ZHOME/SSD
    sudo mount (blkid -L MB-SSD) $ZHOME/SSD
end

# unmount ssd
function ssd-unmount
    sudo umount $ZHOME/SSD
    rmdir $ZHOME/SSD
end

# save screenshot
function scr-save
    mv /tmp/scr.png ./screenshot.png
    echo "Saved locally."
end

# delete screenshot
function scr-rm    
    rm /tmp/scr.png
end

# save recording
function rec-save    
    mv /tmp/rec.mp4 ./recording.mp4
    echo "Saved locally."
end

# delete recording
function rec-rm
    rm /tmp/rec.mp4
end

# weather
function wttr
    clear
    echo
    curl wttr.in/$argv[1]
    echo
end

function dt
    abduco -n $argv[1] $argv[1]
end

function at
    abduco -a $argv[1]
end