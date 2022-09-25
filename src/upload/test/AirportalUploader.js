import IUploader from './IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from './exception/UploadException'

export default class AirportalUploader extends IUploader{

    static async upload(file,config=false) {
        // https://airportal.cn/backend/code?appname=AirPortal
        let res = axios.get("https://airportal.cn/backend/code?appname=AirPortal");

        // https://retiehe.com/backend/airportal/getcode
        // chunksize: 104857600
        // downloads: 2
        // host: airportal-cn-east.oss-cn-hangzhou.aliyuncs.com
        // hours: 24
        // info: [{"id":"o_1em6cs2cn15o6vunp3u1ef559d8","name":"中奖楼层 .rar","type":"","relativePath":"","size":434,"origSize":434,"loaded":0,"percent":0,"status":1,"lastModifiedDate":"2020-11-03T00:55:35.357Z","completeTimestamp":0}]
        // token: OAFQE4ERstahlPDoDd54ad9U8pFRlTAKSMHUyZBGHZet8VTtOmXwqoeaeDs55iLYfEcxKl3AgneidEWZPLmeVZyRurMzshFWB18vW6V2YRkDAn4olN9N6Cxc5rIa8NELnWlaoS3M1CVTi6QrQB+/DlVCxNzwSifcijt34p+7jDc=


    }

    static name(){
        return "airportal|空投";
    }

    static config(){
        return false;
    }
}
