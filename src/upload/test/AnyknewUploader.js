import IUploader from './IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from './exception/UploadException'

export default class AnyknewUploader extends IUploader{

    static async upload(file,config=false) {
        let res = await axios.get("https://cp.anyknew.com/updl/utok");
        let token = res.data.data.token;
        console.log(res);
        let uploadUrl = token.Endpoint.replace("://","://" + token.Bucket + ".") + "/" + token.Dir + "/QBNkjBFba.rar"

        // 上传文件
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);//安字节读取文件并存储至二进制缓存区
        return new Promise((resolve, reject) => {
            reader.onload = async function (e) {
                console.log(e,reader.result);
                let result = new Uint8Array(e.target.result);
                let res2 = await axios.put(uploadUrl,result,{
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Content-Range': 'bytes 0-' + file.size + '/' + file.size,
                        'authorization': "OSS " + token.AccessKeyId + ":" + token.AccessKeySecret,
                        'x-oss-security-token': token.SecurityToken
                    }
                });
                if (res2.data.error){
                    throw new UploadException(res2.data.error.message);
                }
                // console.log(res2);
                resolve()
            }
        })
    }

    static name(){
        return "例子";
    }

    static config(){
        return false;
    }
}
