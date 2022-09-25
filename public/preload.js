const { ipcRenderer, remote, clipboard, shell,dialog } = require('electron')
const fs = require('fs')
const path = require('path')
const process = require('process');
const axios = require("axios");

window.inUtools = true;
window.utils = {
    clipboard: {
    writeText: (text) => {
      clipboard.writeText(text)
    }
    },
    showDialog: (type,title,message,buttons,callback) => {
    dialog.showMessageBox({
    type: type,
    title: title,
    message: message,
    buttons: buttons
    },callback);
    },
    showOpenDialog: (name='文件',extensions=[]) => {
    return dialog.showOpenDialog(remote.getCurrentWindow(), { filters: [{ 'name': name, extensions: extensions }], properties: ['openFile'] })
    },
    showMssage:(text,title='utools')=>{
    notifier.notify(
     {
       title: title,
       subtitle: 'utools',
       message: text,
       sound: true,
       wait: true
     },
     function (err, response) {
       if (err) {
         console.log(err)
       }
     }
    )
    },
    openExternal: shell.openExternal,
    readFile:(pathObj)=>{
      var buffer = fs.readFileSync(pathObj.path);
      class MyFile extends File{
          setPath(path){
              this.temp_path = path;
          }
      }
      var file = new MyFile([buffer],pathObj.name);
      file.setPath(pathObj.path);
      return file;
    },
    readFileA:(pathObj)=>{
        class MyFile extends File{
            setPath(path){
                this.temp_path = path;
            }
        }
        console.log('load ',pathObj);
        return new Promise((resolve,reject)=>{
            console.log(pathObj.path);
            fs.readFile(pathObj.path,(err,bitmap)=>{
                if (err) reject(err);
                var file = new MyFile(bitmap,pathObj.name);
                file.setPath(pathObj.path);
                resolve(file);
            });
        })
    },
    createReadStream(path){
        return fs.createReadStream(path)
    },
    createWriteStream(path){
        return fs.createWriteStream(path)
    },
    openDefaultBrowser: function (url) {
    var exec = require('child_process').exec;
    switch (process.platform) {
      case "darwin":
        exec('open ' + url);
        break;
      case "win32":
        exec('start ' + url);
        break;
      default:
        exec('xdg-open', [url]);
    }
    },
    db: function(name,value=undefined){
        let obj = utools.db.get(name);
        if (value !== undefined){
            let putdata = {
                _id: name,
                data: value,
            }
            if (obj && obj._rev){
                putdata._rev = obj._rev;
            }
            utools.db.put(putdata)
            return;
        }
        if (obj == null) return null;
        return obj.data;
    },
    request(params={}){
        var request = require('request');
        return new Promise((resolve,reject) => {
            request(params, function(error, response, body) {
                if (error !== null) reject(error);
                resolve(response);
            });
        })
    },
    formdata(){
        const FormData = require('form-data');
        return new FormData();
    }
}
window.request = (params) => {
    const request = require("request-promise");

    return request(params);
};
