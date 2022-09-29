import IUploader from './IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from './exception/UploadException'

export default class ExampleUploader extends IUploader{

    static async upload(file,config=false,progressCallback=false) {
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
