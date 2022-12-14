const http = require("http");
const path = require("path");
const express = require("express");   /* Accessing express module */
const app = express();  /* app is a request handler function */
const bodyParser = require("body-parser"); /* To handle post parameters */
require('dotenv').config() 

app.use(bodyParser.urlencoded({extended:false}));

process.stdin.setEncoding("utf8");
let statusCode = 200; /* OK */

// Info message to print if not enough arguments are provided

const portNumber = 2000;
app.listen(portNumber);

// Easy access to web server.
console.log(`Web server started and running at http://localhost:${portNumber}`);

app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(__dirname + '/templates'));

/* view/templating engine */
app.set("view engine", "ejs");  

// Setting up Mongo stuff:
const USERNAME = process.env.MONGO_DB_USERNAME;
const PASSWORD = process.env.MONGO_DB_PASSWORD;
const DB = process.env.MONGO_DB_NAME;
const COLLECTION = process.env.MONGO_COLLECTION;

const databaseAndCollection = {db: DB, collection: COLLECTION};
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${USERNAME}:${PASSWORD}@cluster0.oqbxrxw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.get("/", (request, response) => {
    response.render("index");
 });
 
 app.get("/home", (request, response) => {
    response.redirect(`http://localhost:${portNumber}`);
 });

app.get("/getRhymes", async (request, response) => {

    let {word} =  request.query;

    json = await fetch(`https://api.datamuse.com/words?rel_rhy=${word}`).then((result) => result.json());
    variables = {
        baseWord: word,
        data: json
    };
    
    try {
        await client.connect();
        let element = {rhyme: word};
        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(element);

    } catch (e) {
        console.error(e);
    }

    response.render("getRhymes", variables);
    
 });

 app.get("/wordsSearched", async (request, response) => {

    
    let filter = {};
    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);

    const result = await cursor.toArray();

    variables = {
        data: result
    }

    response.render("wordsSearched", variables);
    
 });

 app.get("/clearWords", async (request, response) => {
    try {
        await client.connect();
        const result = await client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .deleteMany({});
        
    } catch (e) {
        console.error(e);
    } 
    response.redirect("/wordsSearched");   
});

//  app.get("/reviewApplication", (request, response) => {
//     response.render("reviewApplication"); 
//  });

//  app.post("/processReviewApplication", async (request, response) => {
//     let {email} =  request.body;
//     await client.connect();
//     let filter = {email: email};
//     const result = await client.db(databaseAndCollection.db)
//                         .collection(databaseAndCollection.collection)
//                         .findOne(filter);

//     let nameResult = "NOT FOUND";
//     let emailResult = "NOT FOUND";
//     let GPAResult = "NOT FOUND";
//     let backgroundResult = "NOT FOUND";

//     if (result) {
//         nameResult = result.name;
//         emailResult = result.email;
//         GPAResult = result.gpa;
//         backgroundResult = result.info;
//     } 
//     const variables = {
//         name: nameResult,
//         email: emailResult,
//         gpa: GPAResult,
//         info: backgroundResult
//     }
//     response.render("processReviewApplication", variables); 
//  });

//  app.get("/adminGPA", (request, response) => {
//     response.render("adminGPA"); 
//  });
 
//  app.post("/processAdminGPA", async (request, response) => {
//     let {gpa} =  request.body;
//     await client.connect();
//     let filter = {gpa : { $gte: gpa}};
//     const cursor = client.db(databaseAndCollection.db)
//     .collection(databaseAndCollection.collection)
//     .find(filter);

//     const result = await cursor.toArray();

//     tbl = "<h1>Display GPAs Greater than or Equal to </h1>";

//     tbl += "<table border=\"1\"><tr><th>Name</th><th>GPA</th></tr>";
//     result.forEach((element) => tbl += `<tr><td>${element.name}</td><td>${element.gpa}</td></tr>`);
//     tbl += "</table>";

//     tbl += "<br><a href=\"/home\">HOME</a>"
    

//     response.writeHead(statusCode, {"Content-type": "text/html"});
//     response.end(tbl);
//     ; 
//  });

//  app.get("/adminRemove", (request, response) => {
//     response.render("adminRemove");   
//  });

//  app.post("/processAdminRemove", async (request, response) => {
//     try {
//         await client.connect();
//         const result = await client.db(databaseAndCollection.db)
//         .collection(databaseAndCollection.collection)
//         .deleteMany({});
//         variables = {
//             number: result.deletedCount
//         }
//         response.render("processAdminRemove", variables);   
//     } catch (e) {
//         console.error(e);
//     } 
//  });
 
//  /* Middleware function invoked if above ones don't match */
//  app.use((request, response) => {
//     const httpNotFoundStatusCode = 404;
//     response.status(httpNotFoundStatusCode).send("Resource not found");
//  });

let stop = "Type stop to shutdown the server: ";
process.stdout.write(stop);
process.stdin.on("readable", function () {
    let dataInput = process.stdin.read();
    let command = dataInput.trim();
    if (dataInput !== null) {
      if (command === "stop") {
        process.stdout.write("Shutting down the server");
        process.exit(0);
      } 
      process.stdout.write(stop);
      process.stdin.resume();
    }
});
