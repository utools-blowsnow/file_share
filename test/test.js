const fs = require('fs')

let buffer = fs.readFileSync("G:\\Downloads\\CloudflareST_windows_386 (1).zip");

const request = require("request");
const formData = {
    task: '1',
    ve: '2',
    id: 'WU_FILE_0',
    name: 'CloudflareST_windows_386 (1).zip',
    type: 'application/zip',
    size: 2287585,
    upload_file: {
        value: buffer,
        options: {
            filename: 'CloudflareST_windows_386 (1).zip',
            contentType: 'application/zip'
        }
    }
}
request('http://pc.woozooo.com/fileup.php',{
    url: 'http://pc.woozooo.com/fileup.php',
    method: "post",
    formData: formData,
    proxy: 'http://127.0.0.1:8888',
    headers: {
        'Cookie': '_uab_collina=166549455984774885922327; phpdisk_info=ADVQYQJjVmgCNVIyDF9TOAJrBQ5aQVZtB2sEIwF0BmpYM1InA1hQOQYwUjMOMQE9U2UEPl0zVTJSNVQwAWZTYQBlUGECNFZvAjZSZwxhUz0CMAVhWmdWOQdmBDIBMAZmWGVSYgNhUFUGNVIxDmYBblMxBDJdMlUwUmJUMwE1; uag=1093f57d0ed8f720242be5755b822b39; ylogin=133250; folder_id_c=-1',
        // 'Content-Type': 'multipart/form-data; boundary=' + boundaryKey,
    }
},result => {
    console.log("fileup",result);
});


