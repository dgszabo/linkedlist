class APIError extends Error {
    constructor(status = 500, title = 'Internal Server Error', message = 'Something went wrong.') {
        super(message);
        this.status = status;
        this.title = title;
        this.message = message;
    }

    // how to represent the error in JSON format
    //  response.json() it will call this function
    toJSON() {
        const { status, title, message } = this;
        return {
            status,
            title, 
            message
        }
    }
}

module.exports = APIError;