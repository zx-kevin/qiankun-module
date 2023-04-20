#!/bin/bash

WORKDIR=/data/compose/decision-engine-ui
if [ -d "$WORKDIR" ]; then
    echo "运行目录"$WORKDIR"已存在，请检查"
    exit 1
fi

cp -r decision-engine-ui /data/compose
cd $WORKDIR && docker-compose up -d
