var httpProxy = require('http-proxy')
var proxy = httpProxy.createProxy();
var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');

var port = 8000;

var { spawn } = require('child_process');

app.use(bodyParser.raw({limit: '50mb'}));

var localIp = `http://${require('ip').address()}:${port}`;
var funny = require('ip').address();
var fs = require('fs');

var options = {
    'flipnote.hatena.com': localIp,
    funny: localIp
    }
    require('http').createServer(function(req, res) {
    proxy.web(req, res, {
        target: options[req.headers.host]
    });
}).listen(8080);

function regenMoviePage() {
    console.log("Regenerating movie page");
    var python = spawn('python', ['tools/makemoviespage.py']);
    python.stdout.on('data', function(data) {
        console.log(data.toString());
    });
}

function generateIndexes() {
    console.log("Regenerating indexes");
    var python = spawn('python', ['tools/Hatenatools/UGO.py', 'tools/Hatenatools/index.ugoxml', 'hatena/index.ugo']);
    python.stdout.on('data', function(data) {
        console.log(data.toString());
    });
}

app.use(morgan('dev'));

function generateDetailsPage(filename) {
    return DetailsPageTemplate.replace("%%Filename%%", filename);
}

DetailsPageTemplate = `<html>
	<head>
		<title>Flipnote</title>
        <meta name="upperlink" content="http://flipnote.hatena.com/ds/v2-xx/movie/meow/%%Filename%%.ppm">
		<meta name="savebutton" content="http://flipnote.hatena.com/ds/v2-xx/movie/meow/%%Filename%%.ppm">
		<meta name="playcontrolbutton" content="">
		<link rel="stylesheet" href="http://flipnote.hatena.com/css/ds/camp100618.css">
	</head>
	<body>
		<table width="240" border="0" cellspacing="0" cellpadding="0" class="tab">
			<tr>
				<td class="border" width="5" align="center">
					<div class="border"></div>
				</td>
				<td class="border" width="70" align="center">
					<div class="border"></div>
				</td>
				<td class="border" width="95" align="center">
					<div class="border"></div>
				</td>
			</tr>
			<tr>
				<td class="space"> </td>
				<td class="tabon" align="center">
					<div class="on" align="center">Description</div>
				</td>
			</tr>
		</table>
        <p>This is a flipnote.</p>
	</body>
</html>`;

app.get("/ds/v2-eu/en/eula.txt", function(req, res) {
    res.sendFile(__dirname + "/hatena/eula.txt");
})

app.get("/ds/v2-eu/en/confirm/*", function(req, res) {
    res.sendFile(__dirname + "/hatena/confirm.txt");
})

app.get("/ds/v2-eu/eula_list.tsv", function(req, res) {
    res.sendFile(__dirname + "/hatena/eula_list.tsv");
})

app.get("/ds/v2-eu/index.ugo", function(req, res) {
    generateIndexes();
    res.sendFile(__dirname + "/hatena/index.ugo");
})

app.get("/ds/*/frontpage/hotmovies.ugo", function(req, res) {
    regenMoviePage();
    var page = req.query.page || 1;
    res.sendFile(__dirname + "/hatena/pages/page" + page + ".ugo");
})

app.get("/css/ds/:fileName", function(req, res) {
    res.sendFile(__dirname + "/hatena/css/" + req.params.fileName);
})

app.post("/ds/*/movie/meow/:fileName", function(req, res) {
    var fileName = req.params.fileName;
    res.send("downloaded");
})

app.get("/ds/*/movie/meow/:fileName", function(req, res) {
    if (req.params.fileName.endsWith(".info")) {
        res.send("0\n0\n");
        return;
    }
    if (req.params.fileName.endsWith(".htm")) {
        res.send(generateDetailsPage(req.params.fileName));
        return;
    }
    res.sendFile(__dirname + "/flipnotes/" + req.params.fileName);
})

app.get("/ds/*/help/post_howto.htm", function(req, res) {
    res.sendFile(__dirname + "/hatena/help/post_howto.htm");
})

app.post("/ds/*/post/flipnote.post", function(req, res) {
    var data = req.body;
    var date = new Date();
    var fileName = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ".ppm";
    fs.writeFile(__dirname + "/flipnotes/" + fileName, data, function(err) {
        if (err) {
            console.log(err);
            res.status(500);
        } else {
            regenMoviePage();
            console.log("The file was saved!");
            res.status(200).end();
        }
    })
})

app.get("/ds/v2-eu/help/news.htm", function(req, res) {
    res.sendFile(__dirname + "/hatena/help/news.htm");
})

regenMoviePage();

generateIndexes();

app.listen(port, function() {
    console.log("Listening on port " + port);
    console.log("DSi Proxy Server Details:");
    console.log("Local IP: " + funny);
    console.log("Port: 8080");
    if (!fs.existsSync(__dirname + "/flipnotes")) {
        fs.mkdirSync(__dirname + "/flipnotes");
    }
});