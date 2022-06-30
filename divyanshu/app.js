const http = require('http');
const https = require("https")

const PORT = process.env.PORT || 3000;
const getDataPromise = new Promise(async (resolve, reject) => {
    try {
        await https.get('https://time.com/', (res) => {
            const data = [];
            res.on('data', (d) => {
                data.push(d);
            });
            res.on('end', () => {
                const links_data = data.join("").match(/<li class="latest-stories__item">([\s\S]*?)<\/li>/g)
                const title = links_data.join("").match(/(?<=h3 class="latest-stories__item-headline">)(.*?)(?=<\/h3>)/g)
                const links = links_data.join("").match(/<a[^>]+href=\"(.*?)\"[^>]*>/g)
                let scrapeData = [];
                for(let i = 0; i< title.length; i++){
                    let obj = {
                        title: title[i],
                        link: 'https://time.com'+links[i].substring(9, links[i].length-2)
                    }
                    scrapeData.push(obj)
                }
                resolve(scrapeData)
            });
        })
    }
    catch (err) {
        reject('Some Error Occured !!!')
    }
})
const server = http.createServer(async (req, response) => {
    if (req.url === "/getTimeStories" && req.method === "GET") {
        response.writeHead(200, { "Content-Type": "application/json" });
        await getDataPromise
            .then(data => {
                response.write(JSON.stringify(data));
                response.end();
            })
            .catch(err => {
                response.write(err);
                response.end();
            })
    }
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
});
server.listen(PORT, () => {
    console.log(`server started on port: ${PORT}`);
});