import path from "node:path"
import fs from "node:fs"

const readMock = async (rootPathDir: string) => {
    let content: { [key: string]: string } = {}
    let timestamp = new Date().getTime();

    let files: string[] = []
    if (fs.existsSync(rootPathDir)) {
        files = fs.readdirSync(rootPathDir)
        for (let file of files) {
            let curContent
            const filePath = path.resolve(rootPathDir, `./${file}`)
            const contentFile = await import(filePath + `?t=${timestamp}`)
            curContent = contentFile.default
            Object.keys(curContent).forEach(key => {
                if (Reflect.has(content, key)) return
                content[key] = curContent[key]
            })
        }
    }
    return content
}

export default async (option?: { rootPath?: string, dirName?: string }) => {
    let { rootPath = './', dirName = 'mock' } = option ?? {}
    rootPath = path.resolve(process.cwd(), `${rootPath}`)
    const rootPathDir = path.resolve(rootPath, `./${dirName}`)
    let content: { [key: string]: string } = await readMock(rootPathDir)
    return {
        name: 'vite-plugin-cmock',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                let data
                Object.keys(content).forEach(key => {
                    const keyArr = key.split(' ')
                    const method = keyArr.length > 1 ? keyArr[0].toUpperCase() : "GET"
                    const url = keyArr.length > 1 ? keyArr[1] : key
                    if (req.url === url && method === (req.method?.toUpperCase() || 'GET')) {
                        data = content[key]
                    }
                })
                if (!data) return next()
                if (typeof data === 'function') {
                    data(req, res)
                    return
                }
                const headers = {
                    'Content-Type': 'application/json',
                };
                res.writeHead(200, headers);
                res.end(JSON.stringify(data));
            })
        },
        async handleHotUpdate(ctx) {
            if ((ctx.file as string).startsWith(rootPathDir)) {
                let timestamp = new Date().getTime();
                /**
                 * 这里通过time，不使用缓存每次都读取最新的js
                 */
                const contentFile = await import(ctx.file + `?t=${timestamp}`)
                const curContent = contentFile.default

                Object.keys(curContent).forEach(key => {
                    content[key] = curContent[key]
                })
                console.log("MOCK......");
            }
        }
    }
}