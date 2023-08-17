const {Novu} = require('@novu/node'); 
const { config } = require('../secret/config')

const novu = new Novu(config.novu_api_key);

// novu.trigger('event-reminder', {
//     to: {
//       subscriberId: '<REPLACE_WITH_DATA>',
//       email: '<REPLACE_WITH_DATA>'
//     },
//     payload: {
//       title: '<REPLACE_WITH_DATA>',
//       eventName: '<REPLACE_WITH_DATA>',
//       eventDate: '<REPLACE_WITH_DATA>',
//       rsvpLink: '<REPLACE_WITH_DATA>',
//       reminderDate: '<REPLACE_WITH_DATA>'
//     }
//   });

  module.exports = novu;