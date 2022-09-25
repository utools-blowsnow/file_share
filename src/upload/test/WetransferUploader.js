import IUploader from './IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from './exception/UploadException'

export default class WetransferUploader extends IUploader{

    static async upload(file,config=false) {

        let res = await axios.post("https://wetransfer.com/api/v4/transfers/link",{
            files: [
                {
                    item_type: "file",
                    name: file.name,
                    size: file.size,
                }
            ],
            message: "",
            ui_language: "en"
        },{
            headers: {
                'X-CSRF-Token': 'A6UZjGsJC3d2dTl88ii0jWdWaO8leXqqPAHLZCXL2n6PYM8w6qowL3b5nfab5yFDYKSPbkO/lIUx4Ohc1xirMA=='
            }
        })
        let data = res.data;

        let res2 = await axios.post("https://wetransfer.com/api/v4/transfers/"+data.id+"/files/"+data.files[0].id+"/part-put-url",{
            chunk_crc: 0,
            chunk_number: 1,
            chunk_size: file.size
        })

        let res3 = await this.uploadStream(res2.data.url,file,'put',{
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
        // https://wetransfer.com/api/v4/transfers/id/files/605f14fd3d1cdf416e9ea9798945cad220201103064700/part-put-url

        let res4 = await axios.put("https://wetransfer.com/api/v4/transfers/"+data.id+"/finalize")

    }

    static name(){
        return "例子";
    }

    static config(){
        return false;
    }
}
