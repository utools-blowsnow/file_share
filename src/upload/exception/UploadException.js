class UploadException extends Error{

    constructor(message, code=0) {
        super();
        this.message = message;
        this.code = code;

    }
}

export default UploadException;
