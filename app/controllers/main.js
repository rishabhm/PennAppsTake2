var ytdl 	= require('ytdl'),
	ffmpeg 	= require('fluent-ffmpeg'),
	fs 		= require ('fs'),
	request = require('request'),
	songs   = {};


exports.index = function (req, res) {
	res.render('index');
}

exports.main = function (req, res) {

	var	searchTerm = req.params.url;
	console.log('Searching for : ', searchTerm);

	request.get('https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&q='+searchTerm+'&key=AIzaSyCZPM9JwbindGF5Oob5Y5GQIW2DZdk--kg&videoEmbeddable=true&maxResults=10', function (err, data, body) {
		
		var body_json = JSON.parse(body);
		var item_id = null;

		body_json.items.forEach(function(item) {
			if (item.snippet.channelTitle.indexOf('VEVO') < 0 ) {
				if (!item_id)
					item_id = item.id.videoId
			}
		})

		var url 	= 'www.youtube.com/watch?v='+item_id,
		stream 		= ytdl(url);
		proc 		= new ffmpeg({source:stream});
		proc.setFfmpegPath('/Applications/ffmpeg');
		proc.saveToFile('./assets/public/uploaded_songs/'+item_id+'.mp3', function(stdout, stderr) {
			if (typeof err !== "undefined" && err !== null) {
			  return console.log(stderr);
			}
			
			res.send('done');
			return console.log('done');
		});
	});
}

exports.playSong = function (req, res) {
	var myNum	= '+12172152362'
	var client 	= require('twilio')('ACa92a5944cdb9c01be9468dd49f5dde8d', 'fadbb0b4cedab6e5fcc6badcb7d64fde');

	//Place a phone call, and respond with TwiML instructions from the given URL
	client.makeCall({
	    to 		: '+12172155663', // Any number Twilio can call
	    from	: myNum, // A number you bought from Twilio and can use for outbound communication
	    url 	: 'http://twiml.co.uk/d/686eb8e94df3a4fcb28c7e5005c8d67e' // A URL that produces an XML document (TwiML) which contains instructions for the call

	}, function(err, responseData) {

	    //executed when the call has been initiated.
	    console.log(responseData.from); // outputs "+14506667788"
	    res.send('done');

	});
}

exports.checkMessages = function (req, res) {
	var client 	= require('twilio')('ACa92a5944cdb9c01be9468dd49f5dde8d', 'fadbb0b4cedab6e5fcc6badcb7d64fde');
	// client.sms.messages.get(function (err, data) {
	// 	// console.log('Err : ', err, ' Data : ', data);
	// 	// console.log(data.sms_messages.length)
	// 	data.sms_messages.forEach(function (sms) {
	// 		if (sms.direction === 'inbound') {
	// 			// console.log(sms.from, sms.body);
	// 		}
	// 	});
	// });
	var twilio = require('twilio');
	var resp = new twilio.TwimlResponse();

	var toParse = req.query.Body,
		searchProv = toParse.split(" ")[0],
		searchTerm = encodeURIComponent(toParse.split(" ").slice(1, toParse.split(" ").length).join(" "));

	console.log(searchProv, searchTerm);

	if (searchProv.toLowerCase() == "soundcloud" || searchProv.toLowerCase() == "sc") {
		request.get('http://api.soundcloud.com/tracks.json?client_id=5566e3811a3ee397fa80dc1e64a34d54&q='+searchTerm+'&downloadable=true', 
			function (err, data, body) {
				var tracks = [];
				JSON.parse(body).forEach(function(a) {
					if (a.downloadable)
						tracks.push(a);
				});
				// resp.sms(searchTerm);

				client.makeCall({
					to 	: req.query.From,
					from: '+12172152362',
					url : 'http://158.130.152.150:3000/twiml?url='+tracks[0].download_url
				}, function(err, responseData) {
						//executed when the call has been initiated.
						console.log('CALLING');
					});
				resp.sms("You will shortly receive a call with the song");
				res.writeHead(200, {'Content-Type': 'text/xml'});
				res.end(resp.toString());
		});
	}
	else if (searchProv.toLowerCase() == "playlist" || searchProv.toLowerCase() == "pl") {
		request.get('http://api.soundcloud.com/playlists.json?client_id=5566e3811a3ee397fa80dc1e64a34d54&q='+searchTerm, function (err, data, body) {
			var temp = [], downloadUrls = []
			// console.log(JSON.parse(body)[0].tracks[0]);
			for (var i=0; temp.length < 3; i++)
			JSON.parse(body)[i].tracks.forEach(function (t) {
				if (t.downloadable && t.original_format === 'mp3')
					temp.push(t)
			});
			songs[req.query.From] = temp;
			temp.forEach(function (d) {
				console.log(d)
				downloadUrls.push(d.download_url)
			});
			console.log(downloadUrls);
			client.makeCall({
				to 	: req.query.From,
				from: '+12172152362',
				url : 'http://158.130.152.150:3000/twiml?url='+downloadUrls
			}, function(err, responseData) {
					//executed when the call has been initiated.
					console.log('CALLING');
				});
			resp.sms("You will shortly receive a call with the song");
			res.writeHead(200, {'Content-Type': 'text/xml'});
			res.end(resp.toString());
		})
	} else { // playlist case
		request.get('https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&q='+searchTerm+'&key=AIzaSyCZPM9JwbindGF5Oob5Y5GQIW2DZdk--kg&videoEmbeddable=true&maxResults=10', function (err, data, body) {
			
			console.log("Searching for : ", searchTerm);

			var body_json = JSON.parse(body);
			var item_id = null;

			body_json.items.forEach(function(item) {
				if (item.snippet.channelTitle.indexOf('VEVO') < 0 ) {
					if (!item_id)
						item_id = item.id.videoId
				}
			})

			try {

				var url 	= 'www.youtube.com/watch?v='+item_id,
				stream 		= ytdl(url);
				proc 		= new ffmpeg({source:stream});
				proc.setFfmpegPath('/Applications/ffmpeg');

				console.log(url);

				proc.saveToFile('./assets/public/uploaded_songs/'+item_id+'.mp3', function(stdout, stderr) {
					if (typeof err !== "undefined" && err !== null) {
					  return console.log(stderr);
					}

					var download_url = 'http://158.130.152.150:3000/uploaded_songs/'+item_id+'.mp3';
					console.log(download_url);

					client.makeCall({
						to 	: req.query.From,
						from: '+12172152362',
						url : 'http://158.130.152.150:3000/twiml?url=' + download_url
					}, function(err, responseData) {
							//executed when the call has been initiated.
							console.log('CALLING');
						});
					resp.sms("You will shortly receive a call with the song");
					res.writeHead(200, {'Content-Type': 'text/xml'});
					res.end(resp.toString());
					return console.log('done');
				});

			} catch (err) {
				resp.sms("Our apologies! An error occurred while downloading the song. Please try again");
				res.writeHead(200, {'Content-Type': 'text/xml'});
				res.end(resp.toString());
			}
		});
	}
}	

exports.twiml = function (req, res) {
	var url 	= req.query.url;
	var twilio 	= require('twilio');
	var resp 	= new twilio.TwimlResponse();
	url = url.split(',')
	console.log(url)
	url.forEach(function (u) {
		resp.play(u+'?client_id=5566e3811a3ee397fa80dc1e64a34d54');
	})
	res.writeHead(200, {'Content-Type': 'text/xml'});
	res.end(resp.toString());
}

exports.cloud = function (req, res) {

	request.get('http://api.soundcloud.com/tracks.json?client_id=5566e3811a3ee397fa80dc1e64a34d54&q=rihanna&downloadable=true', 
		function (err, data, body) {
			console.log('soundcloud');
			JSON.parse(body).forEach(function(a) {
				if (a.downloadable)
					console.log(a.title);
			});
			res.send('Hi!');
	});
}