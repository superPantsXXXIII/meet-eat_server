const sgMail = require('@sendgrid/mail')
const { config } = require('../secret/config')
sgMail.setApiKey(config.sg_api_key)

exports.UserSend = (email,subject,text) => {
    const msg = {
        to: email, // Change to your recipient
        from: config.sg_sender, // Change to your verified sender
        subject,
        text
        // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }

    sgMail.send(msg).then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
    }).catch((error) => {
        console.error(error)
    })
}

exports.sendRequestToHost = (emailTo, title, name, userEmail) => {
    const msg = {
        to: emailTo,//emailTo
        from: config.sg_sender,
        templateId: 'd-daed453466674ebd8326832b61e3f845',
        dynamicTemplateData: {
            title,
            name,
            email: userEmail,
        },
    };
    
    sgMail.send(msg).then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
    }).catch((error) => {
        console.error(error)
    })
}


exports.sendApproval = (email, title) => {
    const msg = {
        to: email,
        from: config.sg_sender,
        templateId: 'd-34cf78aca3d74580b6750caa9504601b',
        dynamicTemplateData: {
            title,
        },
    };

    sgMail.send(msg).then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
    }).catch((error) => {
        console.error(error)
    })
}


