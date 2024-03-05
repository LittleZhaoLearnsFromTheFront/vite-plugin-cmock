# 使用
    npm install vite-plugin-cmock -D
    在vite.config.js中

    import vitePluginMock from "vite-plugin-cmock"

    plugins:[
        vitePluginMock({  //默认可不填
            rootPath:'./',
            dirName:'mock'
        })
    ]
