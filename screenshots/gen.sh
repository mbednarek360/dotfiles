#!/bin/sh

# wipe all nodes from desktop
clear_desktop() {
    while [ "$(bspc query -d focused -N | wc -l)" != "0" ]
    do
        if [ "$1" == "-k" ]
        then
            bspc node -c
        else
            bspc node -d 9
        fi
    done
}

# dev
bspc desktop -f 1
clear_desktop
bspc wm -r
killall code-oss
code-oss --folder-uri ~/.config --goto ~/.config/bspwm/bspwmrc:2:1
sleep 1
bspc node -o 0.5
(kitty --detach -e zsh -i -c 'neofetch; zsh')
sleep 0.5
bspc node -p south
bspc node -o 0.4
kitty --detach -e gotop -p
sleep 0.5
bspc node -f north
bspc node -z left 160 0
sleep 6
maim -u ~/.config/screenshots/main.png
clear_desktop -k

# spotify
bspc desktop -f 2
clear_desktop
killall spotify
spotify --uri=spotify:album:46xdC4Qcvscfs3Ai2RIHcv &
killall Discord
discord &
sleep 15
maim -u ~/.config/screenshots/spotify.png
clear_desktop -k

# firefox
bspc -f 3
firefox-developer-edition &
sleep 3
notify-send "Notification" "This is an example notification!"
sleep 2
maim -u ~/.config/screenshots/firefox.png
sleep 3
clear_desktop -k

# power menu
bspc desktop -f 4
clear_desktop
sleep 0.5
sh ~/.config/sxhkd/power &
sleep 0.5
maim -u ~/.config/screenshots/power.png
killall rofi

# lock screen
betterlockscreen --lock dimblur &
sleep 0.5
maim -u ~/.config/screenshots/lock.png
killall i3lock