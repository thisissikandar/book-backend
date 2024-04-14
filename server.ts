import app from "./src/app";
import { config } from "./src/config/config";
import connectDb from "./src/config/connectionDb";


const startServer = async()=>{
     await connectDb()
    const port = config.port || 3000;

    app.listen(port, ()=>{
        console.log(`Listening on ${port}`)
    })
}
startServer()