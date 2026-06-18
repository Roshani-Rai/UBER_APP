import mongoose, { Connection } from "mongoose"

const mongodbUrl = process.env.MONGO_URL

if(!mongodbUrl) {
    throw new Error("Db url not found")
}

let cached = global.mongooseConn

if(!cached){
    cached = global.mongooseConn = { conn: null, promise: null }
}

const connectDb = async (): Promise<Connection> => {
    if(cached.conn) return cached.conn

    if(!cached.promise){
        // ✅ .then(c => c.connection) converts Mongoose → Connection to match your type
        cached.promise = mongoose.connect(mongodbUrl).then(c => c.connection)
    } 

    try {
        cached.conn = await cached.promise
        return cached.conn
    } catch (error) {
        cached.promise = null  // ✅ reset on failure so it retries
        throw error            // ✅ throw so the route catches it properly
    }
}

export default connectDb