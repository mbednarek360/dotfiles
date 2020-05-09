#!/bin/sh

yay -S
updates=$(yay -Qu | wc -l)

if [ "$updates" -gt 0 ]; then
    echo "$updates"
else
    echo ""
fi