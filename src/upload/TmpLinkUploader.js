import IUploader from './IUploader'
import UploadException from './exception/UploadException'

class TmpLinkUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        console.log("upload",file);
        if (!config.token){
            throw new UploadException("命令行Token不能为空");
        }
        let formData = new FormData();
        // formData.append("qquuid","qscbox");
        // formData.append("qqfilename",file.name);
        formData.append("file",file);
        formData.append("token",config.token);
        if (config.mrid){
            formData.append("mrid",config.mrid);
        }
        formData.append("model",config.expire || 0);

        let res = await this._uploadFormData("https://tmp-cli.vx-cdn.com/app/upload_cli",formData,progressCallback);
        console.log(res.data);
        // 判断是否上传成功
        if (res.status !== 200){
            throw new UploadException(res.data);
        }
        // Welcome to use tmp.link upload service.
        //     Upload Complete.
        //     Download Page: https://ttttt.link/f/65db209fdd32c
        //     Thank you for using our services.
        // 正则匹配 下载地址  (https:\/\/.*)\n
        let content = res.data;
        let matches = content.match(/(https:\/\/.*)\n/);
        console.log("matches",content,matches);
        if (!matches){
            throw new UploadException("上传失败" + content);
        }
        return {
            url: matches[1],
            expire: this.expire(config.expire)
        };
    }

    static expire(expire_type){
        console.log(expire_type);
        if (expire_type == 0){
            return 1 * 24 * 60 * 60;
        }else if (expire_type == 1){
            return 3 * 24 * 60 * 60;
        }else if (expire_type == 2){
            return 7 * 24 * 60 * 60;
        }else if (expire_type == 99){
            return null;
        }else{
            return 1 * 24 * 60 * 60;
        }
    }

    static name(){
        return "钛盘(tmplink)";
    }

    static order(){ return 10;}

    static config(){
        return [
            {label: "*命令行Token", name: "token", type: "text",desc:"请在 https://www.tmp.link/?tmpui_page=/app&listview=workspace 点击上传 => 使用 tmpUP 上传文件 (新) => 获取Token"},
            {label: "文件夹ID", name: "mrid", type: "text",desc:"请进入对应 https://www.tmp.link/?tmpui_page=/app&listview=room&mrid=0 获取 mrid"},
            {label: "有效期", name: "expire", type: "select" ,value: 0, options: [
                    {label: "24小时",value: 0},
                    {label: "3 天",value: 1},
                    {label: "7 天",value: 2},
                    {label: "私有空间，无限",value: 99},
                ]}
        ];
    }
}

export default TmpLinkUploader;
