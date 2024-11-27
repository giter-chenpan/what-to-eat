const fs = require("node:fs");
const path = require("node:path");
const { generateApi } = require("swagger-typescript-api");

/* NOTE: all fields are optional expect one of `input`, `url`, `spec` */
generateApi({
    name: "server.ts",
    // set to `false` to prevent the tool from writing to disk
    output: path.resolve(process.cwd(), "./"),
    url: "http://127.0.0.1:8088/openapi.json",
    templates: path.resolve(process.cwd(), "./templates"),
    generateClient: true,
    generateResponses: true,
    generateRouteTypes: true,
    httpClientType: "axios",
})
    .then(({ files }) => {
        files.forEach(({ content }) => {
            fs?.writeFile(path.resolve(process.cwd(), "./server.ts"), content, (err) => {
                if (err) {
                    console.error(err, 'err');
                }
            });
        });
    })
    .catch(() => { });
