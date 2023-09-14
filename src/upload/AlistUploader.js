import IUploader from './IUploader'
import UploadException from './exception/UploadException'
import axios from 'axios'
import utility, {encodeURIComponent} from "utility";

class AlistUploader extends IUploader {

    static async upload(file, config = false, progressCallback = false) {
        let formData = new FormData();
        let token = await this.getToken(config);

        formData.append("file", file);

        let domain = config.domain;
        if (domain.endsWith('/')) domain = domain.substring(0, domain.length - 1);
        let base_path = config.base_path || '';
        if (base_path.startsWith('/')) {
            base_path = path.substring(1);
        }
        if (base_path.endsWith('/')) base_path = base_path.substring(0, domain.length - 1);
        let path = config.path || '';
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        if (path.endsWith('/')) {
            path = path.substring(0, path.length - 1);
        }
        if (path !== '') path += '/';
        let fileName;
        if (config.rule === 1) {
            fileName = Date.now() + parseInt(Math.random() * 100000)
            let ext = file.name.split('.').pop();
            if (ext) fileName += '.' + ext;
        } else {
            fileName = file.name;
        }
        path += fileName;

        path = "/" + path;

        let res = await this._uploadFormData2(domain + "/api/fs/form", formData, {
            method: 'PUT',
            headers: {
                Authorization: token,
                "File-Path": encodeURIComponent(path)
            }
        }, progressCallback);

        if (res.data.code !== 200) {
            throw new UploadException(res.data.message);
        }

        if (path.startsWith('/')) {
            path = path.substring(1);
        }

        let link = base_path ? (domain + "/" + base_path + "/" + path) : (domain + "/" + path);

        return {
            url: link,
            expire: null
        };
    }

    static async getToken(config) {
        let domain = config.domain;
        let username = config.username;
        let password = config.password;
        if (domain.endsWith('/')) domain = domain.substring(0, domain.length - 1);
        return axios.post(domain + "/api/auth/login", {
            username: username,
            password: password,
            otp_code: ""
        }).then(res => {
            console.log(res);

            return res.data.data.token;
        })
    }

    static name() {
        return "alist";
    }

    static order() {
        return 10;
    }

    static config() {
        return [
            {label: "alist域名", name: "domain", type: "text", value: "", desc: "带http完整的域名"},
            {
                label: "基本路径",
                name: "base_path",
                type: "text",
                value: "",
                desc: "用户那里设置的基本路径"
            },
            {
                label: "上传路径",
                name: "path",
                type: "text",
                value: "",
                desc: "上传基本路径下的文件的路径"
            },
            {label: "账号", name: "username", type: "text", value: ""},
            {label: "密码", name: "password", type: "text", value: ""},
            {
                label: "文件名称规则", name: "rule", type: "select", options: [
                    {label: "原文件名", value: 0},
                    {label: "随机文件名", value: 1},
                ], value: 0
            },
        ];
    }
}

export default AlistUploader;
