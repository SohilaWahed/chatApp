class AppError extends Error{
    // constructor for child execute each time that create new object out of this class
    constructor(message,statusCode){
        super(message) // constructor for parent
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4')? 'fail':'error'
        this.isOperational = true 

        Error.captureStackTrace(this,this.constructor)
    }
}

module.exports = AppError