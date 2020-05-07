#!/bin/sh
# rofi power menu

chosen=$(echo -e " Lock\n鈴 Suspend\n漏 Reboot\n襤 Shutdown" | rofi -p power -dmenu -i -lines 4)
if [[ $chosen == *"Lock"* ]]; then
    betterlockscreen --lock dimblur
elif [[ $chosen == *"Suspend"* ]]; then
    systemctl suspend
elif [[ $chosen == *"Reboot"* ]]; then
    systemctl reboot
elif [[ $chosen == *"Shutdown"* ]]; then
    systemctl poweroff
fi
