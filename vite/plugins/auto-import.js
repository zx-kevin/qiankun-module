/*
 * @Author: 杰 xuyongfeng@jeoho.com
 * @Date: 2023-02-01 15:01:35
 * @LastEditors: 杰 xuyongfeng@jeoho.com
 * @LastEditTime: 2023-02-13 16:04:06
 * @FilePath: \decision_engine_ui\vite\plugins\auto-import.js
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
import autoImport from 'unplugin-auto-import/vite'

export default function createAutoImport () {
    return autoImport({
        imports: [
            'vue',
            'vue-router',
            'pinia'
        ],
        dts: "src/auto-import.d.ts",
    })
}
