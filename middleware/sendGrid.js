const sgMail = require('@sendgrid/mail')
const {config} = require('../secret/config')
sgMail.setApiKey(config.sg_api_key)

exports.testSend = () =>{
    const msg = {
        to: config.sg_sender, // Change to your recipient
        from: config.sg_sender, // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    
    sgMail.send(msg).then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
    }).catch((error) => {
        console.error(error)
    })
}

exports.testSendTemplated = (email) =>{
    const msg = {
        to: config.sg_sender,
        from: config.sg_sender,
        templateId: 'd-daed453466674ebd8326832b61e3f845',
        dynamicTemplateData: {
          title: 'meet and eat',
          name: 'shay',
          email: 'example@example.org',
        },
      };
    
    sgMail.send(msg).then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
    }).catch((error) => {
        console.error(error)
    })

}

	
