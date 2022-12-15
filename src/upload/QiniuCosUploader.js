import IUploader from "@/upload/IUploader";
import UploadException from "@/upload/exception/UploadException";
import utility, {encodeURIComponent} from "utility";

export default class ExampleCosUploader extends IUploader{
    static async upload(file,config=false,progressCallback=false) {
        const App = {
            Bucket: config.bucket.trim(),
            AK: config.accessKey.trim(),
            SK: config.secretKey.trim()
        }

        const uploadToken = this.uploadToken({
            scope: App.Bucket,
        },App.AK,App.SK);

        const formData = new FormData();
        formData.append('token',uploadToken);
        formData.append('fname',file.name);
        formData.append('key',file.name);
        formData.append('file',file);

        let _uploadURL = config.host || 'http://up.qiniu.com/';
        if (!(_uploadURL.startsWith('http://') || _uploadURL.startsWith('https://'))) {
            _uploadURL = "https://" + _uploadURL;
        }
        let result;
        try {
            result = await this._upload(_uploadURL,'post',formData,{},progressCallback);
        } catch (error) {
            throw new UploadException("上传失败：" + error.response.data.error);
        }

        let _baseURL  = config.downloadHost;

        return {
            url: _baseURL + '/' + utility.encodeURIComponent(result.data.key),
            expire: null
        };
    }

    /**
     * Create uploadToken
     * @see http://docs.qiniu.com/api/v6/put.html#uploadToken
     *
     * @param {Object} options
     *  - {String} scope 一般指文件要上传到的目标存储空间（Bucket）。
     *                   若为”Bucket”，表示限定只能传到该Bucket（仅限于新增文件）；若为”Bucket:Key”，表示限定特定的文件，可修改该文件。
     *  - {Number} [deadline] 定义 uploadToken 的失效时间，Unix时间戳，精确到秒，缺省为 3600 秒
     *  - {String} [endUser] 给上传的文件添加唯一属主标识，特殊场景下非常有用，比如根据终端用户标识给图片或视频打水印
     *  - {String} [returnUrl] 设置用于浏览器端文件上传成功后，浏览器执行301跳转的URL，一般为 HTML Form 上传时使用。
     *                         文件上传成功后会跳转到 returnUrl?query_string, query_string 会包含 returnBody 内容。
     *                         returnUrl 不可与 callbackUrl 同时使用。
     *  - {String} [returnBody] 文件上传成功后，自定义从 Qiniu-Cloud-Server 最终返回給终端 App-Client 的数据。
     *                          支持 魔法变量，不可与 callbackBody 同时使用。
     *  - {String} [callbackBody] 文件上传成功后，Qiniu-Cloud-Server 向 App-Server 发送POST请求的数据。
     *                            支持 魔法变量 和 自定义变量，不可与 returnBody 同时使用。
     *  - {String} [callbackUrl] 文件上传成功后，Qiniu-Cloud-Server 向 App-Server 发送POST请求的URL，
     *                           必须是公网上可以正常进行POST请求并能响应 HTTP Status 200 OK 的有效 URL
     *  - {String} [asyncOps] 指定文件（图片/音频/视频）上传成功后异步地执行指定的预转操作。
     *                        每个预转指令是一个API规格字符串，多个预转指令可以使用分号“;”隔开
     * @return {String} upload token string
     */
   static uploadToken(options,accessKey,secretKey) {
        options = options || {};
        options.scope = options.scope || this.options.bucket;
        options.deadline = options.deadline || (parseInt(Date.now() / 100) + 3600);
        var flags = options;

        var utility = require('utility');
        // 步骤2：将 Flags 进行安全编码
        var encodedFlags = utility.base64encode(JSON.stringify(flags), true);

        // 步骤3：将编码后的元数据混入私钥进行签名
        // 步骤4：将签名摘要值进行安全编码
        var encodedSign = this.signData(encodedFlags,secretKey);

        // 步骤5：连接各字符串，生成上传授权凭证
        return accessKey + ':' + encodedSign + ':' + encodedFlags;
    };

    static signData(data,secretKey) {
        var utility = require('utility');
        var signature = utility.hmac('sha1', secretKey, data, 'base64');
        return this.urlsafe(signature);
    };

    static urlsafe(s) {
        return s.replace(/\//g, '_').replace(/\+/g, '-');
    };

    static order(){ return 1;}

    static name(){
        return "七牛对象存储";
    }

    static config(){
        return [
            {label: "上传域名", name: "host", type: "text", value: "http://up.qiniu.com/"},
            {label: "下载域名", name: "downloadHost", type: "text", value: ""},
            {label: "AccessKey", name: "accessKey", type: "text"},
            {label: "SecretKey", name: "secretKey", type: "text"},
            {label: "Bucket", name: "bucket", type: "text"},
        ];
    }
}
