#!/bin/bash

UI_DOMAIN=
WSS_DOMAIN=

PROXY_PASS_FILE_BLUE=/data/compose/nginx-loader/config/conf.d/decision_engine_ui_blue.conf
PROXY_PASS_FILE_GREEN=/data/compose/nginx-loader/config/conf.d/decision_engine_ui_green.conf.bak
if [ -f "$PROXY_PASS_FILE_BLUE" ]; then
    echo "反向代理配置文件"$PROXY_PASS_FILE_BLUE"已存在，请检查"
    exit 1
elif [ -f "$PROXY_PASS_FILE_GREEN" ]; then
    echo "反向代理配置文件"$PROXY_PASS_FILE_GREEN"已存在，请检查"
    exit 1
fi

cp decision_engine_ui_blue.conf /data/compose/nginx-loader/config/conf.d
cp decision_engine_ui_green.conf.bak /data/compose/nginx-loader/config/conf.d

sed -i "s#UI_DOMAIN#${DOMAIN}#g" $PROXY_PASS_FILE_BLUE 
sed -i "s#WSS_DOMAIN#${WSS_DOMAIN}#g" $PROXY_PASS_FILE_BLUE 
sed -i "s#UI_DOMAIN#${DOMAIN}#g" $PROXY_PASS_FILE_GREEN 
sed -i "s#WSS_DOMAIN#${WSS_DOMAIN}#g" $PROXY_PASS_FILE_GREEN
