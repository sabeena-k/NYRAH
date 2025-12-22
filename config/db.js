import mongoose from'mongoose'
import env from'dotenv'
env.config();


const connect=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
         console.log('Database connected')
    }catch(error){
        console.log('Database connection error')
          process.exit(1)
    }
}



export default connect;