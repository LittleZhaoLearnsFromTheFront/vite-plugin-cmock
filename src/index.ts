import path from "node:path"
import fs from "node:fs"

export default async ({ rootPath = './', dirName = 'mock' }: { rootPath?: string, dirName?: string }) => {
    rootPath = path.resolve(process.cwd(), `${rootPath}`)
    let files: string[] = []
    const content: { [key: string]: string } = {}
    const rootPathDir = path.resolve(rootPath, `./${dirName}`)
    if (fs.existsSync(rootPathDir)) {
        files = fs.readdirSync(rootPathDir)
        for (let file of files) {
            const contentFile = await import(path.resolve(rootPathDir, `./${file}`))
            Object.keys(contentFile.default).forEach(key => {
                if (Reflect.has(content, key)) return
                content[key] = contentFile.default[key]
            })
        }
    }
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
                if (data) {
                    const headers = {
                        'Content-Type': 'application/json',
                    };
                    res.writeHead(200, headers);
                    res.end(JSON.stringify(data));
                    return;
                }
                next()
            })
        }
    }
}