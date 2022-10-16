import IUploader from './IUploader'
import axios from 'axios'

import UploadException from './exception/UploadException'

export default class WenshushuUploader extends IUploader{

    static async upload(file,config=false) {
        let headers = {
            headers: {
                'X-TOKEN': 'wss:3x3oqlysupa',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
                'A-code': 'YBm2qPK6DyNOyMIpHbAljKoOUpYy6gUuGUiirGyAoqdRNoQbqEkik7tbnRDMd76l',
                'Req-Time': 1604648333,
                'Accept-Language': "zh-CN, en-US;q=0.9, en;q=0.8",
                'Prod': "com.wenshushu.web.pc",
            }
        }
        let res = await axios.post('https://www.wenshushu.cn/ap/task/addsend',{
            downPreCountLimit: 0,
            expire: 3,
            file_count: 1,
            file_size: file.size,
            isextension: false,
            notSaveTo: false,
            pwd: "",
            recvs: ["social", "public"],
            remark: "",
            sender: "",
            trafficStatus: 0
        },headers);


        let res2 = await axios.post('https://www.wenshushu.cn/ap/uploadv2/getupid',{
            boxid: "3x29f6ua088",
            count: 1,
            length: file.size,
            linkid: "3x29f749kp8",
            originUpid: "",
            preid: "3x29f6ubeso",
            utype: "sendcopy",
        });


        let res3 = await axios.post('https://www.wenshushu.cn/ap/uploadv2/psurl',{
            fname: "HuyaClientInstall.exe",
            fsize: 2097152,
            ispart: true,
            partnu: 1,
            upId: "3x27io86mpa"
        });


        this.uploadStream('',file,'put');

        let res4 = await axios.post('https://www.wenshushu.cn/ap/uploadv2/complete',{
            fname: "HuyaClientInstall.exe",
            ispart: true,
            location: {boxid: "3x29f6ua088", preid: "3x29f6ubeso"},
            upId: "3x27io86mpa",
        });

        let res5 = await axios.post('https://www.wenshushu.cn/ap/task/copysend',{
            bid: "3x29f6ua088",
            tid: "3x29f749kp8",
            ufileid: "3x29f6ubeso",
        });

    }

    static name(){
        return "文叔叔";
    }

    static config(){
        return false;
    }
}
