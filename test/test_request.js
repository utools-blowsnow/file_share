const fs = require('fs')

let buffer = fs.readFileSync("G:\\Downloads\\CloudflareST_windows_386 (1).zip");

const fetch = require('node-fetch');
// const { FormData, File, fileFrom } = require('node-fetch');
const http = require("http");

// const file = new File([new Uint8Array(buffer)], 'CloudflareST_windows_386 (1).zip', { type: 'application/zip' })
const FormData = require('form-data');
let formData = new FormData();
formData.append("task","1");
formData.append("ve","2");
formData.append("id","WU_FILE_0");
formData.append("name","CloudflareST_windows_386 (1).zip");
formData.append("type", "application/zip");
formData.append("size", 2287585);
formData.append("upload_file", buffer, "CloudflareST_windows_386 (1).zip");

let boundaryKey = formData.getBoundary();
const HttpProxyAgent = require('http-proxy-agent');
const request = require("request");

request('http://pc.woozooo.com/fileup.php',{
    url: 'http://pc.woozooo.com/fileup.php',
    method: "post",
    body: formData.getBuffer(),
    proxy: 'http://127.0.0.1:8888',
    agent: new HttpProxyAgent('http://127.0.0.1:8888'),

    headers: {
        'Cookie': 'PHPSESSID=dc2j86vjtb389dvil9hhgb553lqjbd48; ylogin=133250; folder_id_c=-1; uag=e39673e878adac846bf270e568e342a6; phpdisk_info=ADVQYVc2UW8POAdnDF9WPVA5UlkOFV1mBmpVcgZzC2dWPV8qUAsDag44Dm8OMVtnV2EAOgxiXDsFYgltBGNWZABlUGFXYVFoDzsHMgxhVjhQYlI2DjNdMgZnVWMGNwtrVmtfb1AyAwYOPQ5tDmZbNFc1ADYMY1w5BTUJbgQw',
        'Content-Type': 'multipart/form-data; boundary=' + boundaryKey,
    }
},result => {
    console.log("fileup",result);
});


