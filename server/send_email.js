var nodemailer = require('nodemailer');

//I tested it on my own emails. It works. 
var transporter = nodemailer.createTransport({
	host: 'smtp.ukr.net',
	port: '2525',
	secure: true,
	auth: {
		user: 'julia_ned@ukr.net',
		pass: 'password'
	}
});

var mailOptions = {
	from: 'julia_ned@ukr.net',
	to: 'y.nedzelskaya@gmail.com',
	subject: 'test_modemailer',
	text: 'Everything fine!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});