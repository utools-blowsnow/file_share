import IUploader from '../IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from '../exception/UploadException'

export default class ExampleUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
        // https://netcut.cn/api/note/create/
        // note_name=sfasffqrqwrqw&note_content=&note_pwd=0&expire_time=94608000

        // https://v0.api.upyun.com/netcut-cn
        let formdata = new FormData();
        formdata.append('file',file);
        formdata.append('authorization','UPYUN netcut:+n7US6H37TPG9Vn5wyXRK9KWF4I=');
        formdata.append('policy','eyJzYXZlLWtleSI6InVwbG9hZHMve3llYXJ9e21vbn17ZGF5fS97cmFuZG9tMzJ9IiwiZXhwaXJhdGlvbiI6MTcyMTMwMzMwNywiY29udGVudC1sZW5ndGgtcmFuZ2VcdCI6IjAsNTI0Mjg4MDAiLCJidWNrZXQiOiJuZXRjdXQtY24ifQ==');
        return {
            url: null,
            expire: null
        };
    }

    static name(){
        return "例子";
    }

    static config(){
        return false;
    }
}
