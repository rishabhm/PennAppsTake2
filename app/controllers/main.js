var ytdl 	= require('ytdl'),
	ffmpeg 	= require('fluent-ffmpeg'),
	fs 		= require ('fs');
	// messages = {
	// 	read
	// };


exports.index = function (req, res) {
	res.render('index');
}

exports.main = function (req, res) {

	var url 	= 'www.youtube.com/watch?v='+req.params.url,
		stream 	= ytdl(url);
		proc 	= new ffmpeg({source:stream});

	proc.setFfmpegPath('/Applications/ffmpeg');
	proc.saveToFile('./uploaded_songs/'+req.params.url+'.mp3', function(stdout, stderr) {
		if (typeof err !== "undefined" && err !== null) {
		  return console.log(stderr);
		}
		return console.log('done');
	});

	res.render('main');
}

exports.playSong = function (req, res) {
	var myNum	= '+12172152362'
	var client 	= require('twilio')('ACa92a5944cdb9c01be9468dd49f5dde8d', 'fadbb0b4cedab6e5fcc6badcb7d64fde');

	// //Send an SMS text message
	// client.sendSms({
	//     to:'+12179798200', // Any number Twilio can deliver to
	//     from: myNum, // A number you bought from Twilio and can use for outbound communication
	//     body: 'word to your mother.' // body of the SMS message

	// }, function(err, responseData) { //this function is executed when a response is received from Twilio
	// 	console.log()
	//     if (!err) { // "err" is an error received during the request, if any

	//         // "responseData" is a JavaScript object containing data received from Twilio.
	//         // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
	//         // http://www.twilio.com/docs/api/rest/sending-sms#example-1
	//         console.log(responseData.from); // outputs "+14506667788"
	//         console.log(responseData.body); // outputs "word to your mother."
	//         res.send('sent');

	//     }
	// });

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
	client.sms.messages.get(function (err, data) {
		// console.log('Err : ', err, ' Data : ', data);
		// console.log(data.sms_messages.length)
		data.sms_messages.forEach(function (sms) {
			if (sms.direction === 'inbound') {
				console.log(sms.from, sms.body);
			}
		});
	});

	var twilio = require('twilio');
	var resp = new twilio.TwimlResponse();

	console.log(req.query);
	resp.sms(req.query.Body);

	res.writeHead(200, {'Content-Type': 'text/xml'});
	res.end(resp.toString());

	// console.log(resp.toString());
}	