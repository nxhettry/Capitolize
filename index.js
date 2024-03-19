import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
    user: "postgres",
    password: "THISISPRIVATE",
    database: "world",
    host: "localhost",
    port: 5432,
});

//Some middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let dataFromDb = [];
let aQuestion = {};
let totalscore = 0;

//This fetches the data from the database
db.connect();
db.query("SELECT * FROM capitals", async (err, res) => {
    if (err) {
        console.log("Error", err.stack);
    } else {
        dataFromDb = await res.rows;
    }
    db.end();
});

//This is for rendering the homepage
app.get("/", (req, res) => {
    res.render("index.ejs");
});

//This is for starting the quiz
app.get("/start", (req, res) => {
    try {
        getQuestion();
        console.log(aQuestion);
        res.render("index.ejs", {
            content: aQuestion,
            totalPoints: totalscore,
        });
    } catch (error) {
        console.log(error.message);
        res.send("Error ! please refresh the page to try again");
    }
});

//Function for checking answers
app.post("/checkAns", (req, res) => {
    try {
        const input = req.body.answer.trim();
        if (!input) res.send("Error, please try again");
        if (input.toLowerCase() === aQuestion.capital.toLowerCase()) {
            totalscore++;
            res.redirect("/start");
        } else {
            totalscore = 0;
            res.render("index.ejs", {message: totalscore});
        }
    } catch (error) {
        console.log("Error", error.message);
    }
})

//For getting random questions
function getQuestion() {
    aQuestion = dataFromDb[Math.floor(Math.random() * dataFromDb.length)];
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
