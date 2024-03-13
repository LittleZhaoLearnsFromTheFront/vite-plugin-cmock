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

    在{{rootPath}}目录下创建{{dirName}}目录，默认指定目录为 根目录下 mock文件夹
## 使用方式
    在mock文件夹下 创建*.js文件
    *.js文件内容如下

```typescript
export default{
  '/api/default':[
    {
      userId:1
    }
  ],
  'POST /api/default':[
    {
        userName:'admin'
    }
  ]
}
```
其中 '/api/default' 与 'GET /api/default'等价


