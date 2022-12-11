import IUploader from "@/upload/IUploader";
import UploadException from "@/upload/exception/UploadException";
import axios from "axios";
import GithubCosUploader from "@/upload/GithubCosUploader";

export default class ExampleCosUploader extends GithubCosUploader{
    static apiurl(){
        return "https://gitee.com/api/v5";
    }

    static async _uploadRequest(url,data,config){
        return axios.post(url, data, config);
    }

    static name(){
        return "Gitee存储库";
    }

    static config(){
        return [
            {label: "*访问令牌", name: "token", type: "text",desc:"请在 https://gitee.com/profile/personal_access_tokens 获取"},
            {label: "*仓库地址", name: "url", type: "text",desc:"例子：https://gitee.com/xxxx/xxxx"},
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
