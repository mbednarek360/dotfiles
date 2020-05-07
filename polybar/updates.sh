#!/bin/sh

updates=$(yay -Qua | wc -l)

if [ "$updates" -gt 0 ]; then
    echo "$updates"
else
    echo ""
fi