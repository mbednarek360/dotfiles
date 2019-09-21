#!/bin/bash

INCREMENT_VERSION_REGEX='\[ci-publish\]\[(\w+)\]'

[[ $TRAVIS_COMMIT_MESSAGE =~ $INCREMENT_VERSION_REGEX ]]

increment=${BASH_REMATCH[1]}

if [ $increment == 'patch' ] || [ $increment == 'minor' ] || [ $increment == 'major' ];
then
    vsce publish $increment -p $VSCE_PUBLISH_ACCESS_TOKEN
    echo 'Plugin was successfully published'  
else 
    echo "Increment version parameter ($increment) is not valid";
    exit 1;
fi
