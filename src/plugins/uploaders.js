
const files = [];
files.push(require.context('@/upload',false,/\.js$/));
const path = require("path");

const modules = [];
for(let file of files){
    file.keys().forEach(key => {
        const name = path.basename(key, ".js");
        if (name === "IUploader") return;
        const cls = file(key).default || file(key);
        modules.push({
            instance: cls,
            name: name,
            label: cls.name(),
            configParameters: cls.config()
        })
    });
}
export default modules;
