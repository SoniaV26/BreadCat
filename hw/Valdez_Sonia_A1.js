
//request to the console
const requestHandler = function (req,res){
    console.log(req.url);
}

var filename = "";
if (req.url.length > 1)
{
    filename = "." + req.url;
}
else{
    filename = "./index.html"
}

filesys.readFile(filename, 
function(error, file)
{
    if (error)
    {
        if (error.code === 'ENOENT')
        {
            res.writeHead(404);
            res.end(error.message);
        }

        console.log("Error reading " + filename)
        response.writeHead(500, error.message)
        return;
    }
    res.end(file)

    const server = https.createServer(requestHandler) //tie func to server

    server.listen(port, function(err){
        if (err){
            return console.log('something bad happeneed', err)
        }
        console.log('Server is listening on {'+port+'}')
        
    }
//}





