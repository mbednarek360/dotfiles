#!/bin/bash

    while true
    do
        export DISPLAY=:0.0
        battery1_level=`acpi -b | grep -P -o -m 1 '[0-9]+(?=%)'`
        battery2_level=`acpi -b | grep -P -o  '[0-9]+(?=%)' | sed -n 2p`
        battery_level_added=$(( battery1_level + battery2_level ))
        battery_level=$(( battery_level_added / 2 ))
        ac_power=`acpi -a | grep -P -o  '(on|off)'`
       
        if [ "$ac_power" = "on" ]; then
            if [ $battery_level -ge 90 ]; then
                notify-send "Disconnect Charger" "Battery at ${battery_level}%"
            fi
        else  #if discharging battery
            if [ $battery_level -le 10 ]; then
                notify-send "Connect Charger" "Battery at ${battery_level}%"
            fi
        fi

        sleep 60 # run once every minute
    done
