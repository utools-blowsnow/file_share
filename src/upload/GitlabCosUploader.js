import IUploader from "@/upload/IUploader";
import UploadException from "@/upload/exception/UploadException";
import axios from "axios";
import urlencode from "urlencode";

export default class ExampleCosUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        // 检查配置文件必填
        if(!config.token || !config.url){
            throw new UploadException("请填写必填配置");
        }

        const buffer = await file.arrayBuffer();
        const fileBase64 = await utils.fileToBase64(buffer);

        let path = config.path || '';
        if( path.startsWith('/') ){
            path = path.substring(1);
        }
        if (path.endsWith('/')) {
            path = path.substring(0, path.length - 1);
        }
        if (path !== '')  path += '/';
        let fileName;
        if (config.rule === 1){
            fileName = Date.now() + parseInt(Math.random() * 100000)
            let ext = file.name.split('.').pop();
            if (ext)  fileName += '.' + ext;
        }else{
            fileName = file.name;
        }
        path += fileName;


        // 从仓库地址中获取仓库名和用户名 正则匹配，支持多级目录
        let matches = config.url.match(/(.*?:\/\/[^\/]+)\/([^\/]+)\/([^\/]+)/);
        if (!matches){
            throw new UploadException("仓库地址格式错误");
        }
        let host = matches[1];
        let owner = matches[2];
        let repo = matches[3];
        let repoId = urlencode(owner + "/" + repo);
        const url = host + `/api/v4/projects/${repoId}/repository/files/${urlencode(path)}`;
        let branch = config.branch || 'master';
        let data = {
            commit_message: config.commit || 'utools 上传',
            encoding: "base64",
            content: fileBase64,
            branch: branch,
        }
        const response = await this._uploadRequest(url, data, {
            headers: {
                'PRIVATE-TOKEN': config.token,
                // accept: 'application/vnd.github+json',
                // Authorization: `token ${config.token}`,
            },
        }).catch(error=>{
            console.log(error,error.response);
            if (error.response.status === 422) {
                throw new UploadException("文件已存在");
            }
            if (error.response.data?.messages){
                throw new UploadException("上传失败：" + error.response.data?.messages.join(','));
            }
            if (error.response.data?.error_description){
                throw new UploadException("上传失败：" + error.response.data?.error_description);
            }

            throw new UploadException("上传失败：" + error.response?.data?.message);
        });

        console.log(response);

        return {
            url: host + "/" + owner + "/" + repo + "/-/raw/" + branch + "/" + path,
            expire: null
        };
    }

    static async _uploadRequest(url,data,config){
        return axios.post(url, data, config);
    }

    static name(){
        return "Gitlab存储库";
    }

    static config(){
        return [
            {label: "*访问令牌", name: "token", type: "text",desc:"请在 https://gitlab.com/-/profile/personal_access_tokens 获取<br>权限：api必选"},
            {label: "*仓库地址", name: "url", type: "text",desc:"例子：https://gitlab.com/xxxx/xxxx"},
            {label: "存储路径", name: "path", type: "text"},
            {label: "分支路径", name: "branch", type: "text"},
            {label: "提交备注", name: "commit", type: "text"},
            {label: "文件名称规则", name: "rule", type: "select", options: [
                    {label: "原文件名", value: 0},
                    {label: "随机文件名", value: 1},
                ],value: 0},
        ];
    }
}
