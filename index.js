const express = require("express");
const app = express();
const fileupload = require("express-fileupload");
const fs = require("fs");
// const path = require("path");
const cors = require("cors");

// Create upload directory
const uploadDirectory = "./Uploads/";
console.log('======================================================================');
console.log('Upload Directory:', uploadDirectory);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

// Cors middleware
app.use(cors({
    origin: '*'
}));

// File upload middleware
app.use(fileupload());

// Base route
app.get("/", (req, res) => {
    res.status(200).send("Welcome to Nukode's Temporary File Holding Server. In order to upload a file use localhost:8000/upload where you assign your file to the file POST parameter.");
});

// Upload route
app.post("/upload", (req, res) => {

    console.log("Upload request received...");
    const file = req.files.file;

    const timeStamp = Date.now();
    const path = uploadDirectory + timeStamp + "_" + file.name;

    file.mv(path, async (err, result) => {

        // console.log("MV Result (Raw) = " + result);
        // console.log("MV Result (JSON) = " + JSON.stringify(result));

        if (err)
            throw err;

        res.status(200).send({
            success: true,
            message: "FILE_UPLOADED",
            file: timeStamp + "_" + file.name
        });
    });

});

// Download route
app.get("/download", (req, res) => {

    console.log("Download request received : " + req.query.file);

    const path = uploadDirectory + req.query.file;

    fs.readFile(path, (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.end('ERROR');
        } else {
            res.statusCode = 200;
            // res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', 'attachment; filename="' + req.query.file + '"');
            res.end(data);
        }
    });

});

// List all file in upload directory
app.get("/list", (req, res) => {

    console.log("Listing uploaded files...");

    fs.readdir(uploadDirectory, (err, files) => {

        if (err) {
            console.log("ERROR : " + err);
            res.status(500).send({ message: "ERROR" });
        }

        files.forEach(file => {
            console.log(file);
        });

        res.status(200).send({ files: files });
    });

});

app.listen(8000, () => {
    console.log("Temporary file server started on port 8000");
    console.log('======================================================================');
});