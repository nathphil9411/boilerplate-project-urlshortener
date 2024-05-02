require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

let url = process.env.DATABASE;
mongoose
	.connect(url)
	.then(() => console.log("connected to db"))
	.catch((err) => {
		console.log(err);
	});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});

//mongoose schema
const urlschema = new mongoose.Schema({
	original_url: { type: String, required: true },
	short_url: Number,
});

const Url = mongoose.model("Url", urlschema);

//Url Matcher function
const matchUrl = async (req, res) => {
	try {
		const shortUrl = parseInt(req.params.shorturl);
		const urlObject = await Url.findOne({ short_url: shortUrl });
		const originalUrl = urlObject.original_url;
		res.redirect(originalUrl);
	} catch (err) {
		res.json({ error: "url not found" });
	}
};

//Url shortner function
const shortenUrl = async (req, res) => {
	try {
		const originalUrl = req.body.url;
		let shortUrl = 0;
		const lastUrl = await Url.findOne({}).sort({ short_url: "desc" });
		if (!lastUrl) shortUrl++;
		if (lastUrl) shortUrl = lastUrl.short_url + 1;
		const newUrl = await Url.create({
			original_url: originalUrl,
			short_url: shortUrl,
		});
		console.log(newUrl);
		res.json(newUrl);
	} catch (err) {
		res.json({ error: "invalid url" });
	}
};

app.get("/api/shorturl/:shorturl", matchUrl);
app.post(
	"/api/shorturl/",
	bodyParser.urlencoded({ extended: false }),
	shortenUrl
);
