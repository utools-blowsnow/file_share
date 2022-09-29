import IUploader from "@/upload/IUploader";
import UploadException from "@/upload/exception/UploadException";

export default class ExampleCosUploader extends IUploader{
    static async upload(file,config=false,progressCallback=false) {
        const OSS = require('ali-oss')

        const client = new OSS({
            // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
            region: config.region,
            // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
            accessKeyId: config.accessKeyId,
            accessKeySecret: config.accessKeySecret,
            // 填写Bucket名称。
            bucket: config.bucket,
        });

        const result = await client.multipartUpload(file.name, file,{
            progress: function (p, cpt, res) {
                console.log(p, cpt, res);
                progressCallback(p * 100)
            }
        });

        console.log(result);
        // 获取?左边的url
        let url = result.res.requestUrls[0];
        url = url.substring(0,url.indexOf("?"));

        return {
            url: url,
            expire: null
        };
    }

    static name(){
        return "阿里云对象存储";
    }

    static config(){
        return [
            {label: "AccessKeyId", name: "accessKeyId", type: "text"},
            {label: "AccessKeySecret", name: "accessKeySecret", type: "text"},
            {label: "Bucket", name: "bucket", type: "text"},
            {label: "Region", name: "region", type: "select", value: 'oss-cn-hangzhou', options: [
                    {label: "华东1（杭州）",value: 'oss-cn-hangzhou'},
                    {label: "华东2（上海）",value: 'oss-cn-shanghai'},
                    {label: "华东5（南京本地地域）",value: 'oss-cn-nanjing'},
                    {label: "华东6（福州本地地域）",value: 'oss-cn-fuzhou'},
                    {label: "华北1（青岛）",value: 'oss-cn-qingdao'},
                    {label: "华北2（北京）",value: 'oss-cn-beijing'},
                    {label: "华北",value: '3（张家口）'},
                    {label: "华北5（呼和浩特）",value: 'oss-cn-huhehaote'},
                    {label: "华北6（乌兰察布）",value: 'oss-cn-wulanchabu'},
                    {label: "华南1（深圳）",value: 'oss-cn-shenzhen'},
                    {label: "华南2（河源）",value: 'oss-cn-heyuan'},
                    {label: "华南3（广州）",value: 'oss-cn-guangzhou'},
                    {label: "西南1（成都）",value: 'oss-cn-chengdu'},
                    {label: "中国（香港）",value: 'oss-cn-hongkong'},
                    {label: "美国（硅谷）*",value: 'oss-us-west-1'},
                    {label: "美国（弗吉尼亚）*",value: 'oss-us-east-1'},
                    {label: "日本（东京）*",value: 'oss-ap-northeast-1'},
                    {label: "韩国（首尔）",value: 'oss-ap-northeast-2'},
                    {label: "新加坡*",value: 'oss-ap-southeast-1'},
                    {label: "澳大利亚（悉尼）*",value: 'oss-ap-southeast-2'},
                    {label: "马来西亚（吉隆坡）*",value: 'oss-ap-southeast-3'},
                    {label: "印度尼西亚（雅加达）*",value: 'oss-ap-southeast-5'},
                    {label: "菲律宾（马尼拉）",value: 'oss-ap-southeast-6'},
                    {label: "泰国（曼谷）",value: 'oss-ap-southeast-7'},
                    {label: "印度（孟买）*",value: 'oss-ap-south-1'},
                    {label: "德国（法兰克福）*",value: 'oss-eu-central-1'},
                    {label: "英国（伦敦）",value: 'oss-eu-west-1'},
                    {label: "阿联酋（迪拜）*",value: 'oss-me-east-1'}
               ]
            }
        ];
    }
}
