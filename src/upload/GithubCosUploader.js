import IUploader from "@/upload/IUploader";
import UploadException from "@/upload/exception/UploadException";
import axios from "axios";

export default class ExampleCosUploader extends IUploader{
    static apiurl(){
        return "https://api.github.com";
    }

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
        let matches = config.url.match(/[^\/]+\/([^\/]+)\/([^\/]+)/);
        if (!matches){
            throw new UploadException("仓库地址格式错误");
        }
        let owner = matches[1];
        let repo = matches[2];

        const url = this.apiurl() + `/repos/${owner}/${repo}/contents/${path}`;

        let data = {
            message: config.commit || 'utools 上传',
            content: fileBase64,
        }
        if (config.branch){
            data.branch = config.branch;
        }
        const response = await this._uploadRequest(url, data, {
            headers: {
                // accept: 'application/vnd.github+json',
                Authorization: `token ${config.token}`,
            },
        }).catch(error=>{
            console.log(error,error.response);
            if (error.response.status === 422) {
                throw new UploadException("文件已存在");
            }
            if (error.response.data?.messages){
                throw new UploadException("上传失败：" + error.response.data?.messages.join(','));
            }
            throw new UploadException("上传失败：" + error.response?.data?.message);
        });

        const proxy = config.proxy || '';
        return {
            url: proxy + response.data.content.download_url,
            expire: null
        };
    }

    static async _uploadRequest(url,data,config){
        return axios.put(url, data, config);
    }

    static name(){
        return "Github存储库";
    }

    static config(){
        return [
            {label: "*访问令牌", name: "token", type: "text",desc:"请在 https://github.com/settings/tokens 获取"},
            {label: "*仓库地址", name: "url", type: "text",desc:"例子：https://github.com/xxxx/xxxx"},
            {label: "存储路径", name: "path", type: "text"},
            {label: "分支路径", name: "branch", type: "text"},
            {label: "提交备注", name: "commit", type: "text"},
            {label: "下载代理地址", name: "proxy", type: "select", options: [
                    {label: "不使用代理", value: ""},
                    {label: "ghproxy", value: "https://ghproxy.com/"},
                    {label: "jsdelivr", value: "https://cdn.jsdelivr.net/gh/"},
                ],value: ""},
            {label: "文件名称规则", name: "rule", type: "select", options: [
                    {label: "原文件名", value: 0},
                    {label: "随机文件名", value: 1},
                ],value: 0},
        ];
    }
}
