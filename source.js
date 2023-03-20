'use strict';
var nodemailer = require('nodemailer');
const crypto = require('crypto');
const base32 = require('hi-base32');
const functions = require('firebase-functions');

const {
  google
} = require('googleapis');
const {
  WebhookClient
} = require('dialogflow-fulfillment');
const {
  Conversation
} = require('actions-on-google');

// Enter your calendar ID below and service account JSON below
const calendarId = "faff23c42994e10d57f0e0a0db66da6c244e1e97fdcc0319581c468ac65af949@group.calendar.google.com";
const serviceAccount = {
  "type": "service_account",
  "project_id": "scheduler-xmgb",
  "private_key_id": "70223fe2f176456f73516aac90298af31d89ac46",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDKdSXwJ9JtNPWb\nSHHPrzqjfrPyM/s7S/nvLvSD5SXiOhO/7KrrJoOLMlTaoB75/TGVx0VzTXZI3CwX\njBBm7q4PeZQevcsInchu53TjLwmTLuDoP2FjTrIR7fLmoU4Mzl18v5QIv6BPweLe\nWHoWVtwsfKWfGQauAPdQQdBI61pdbZ4MLeb5UdCv4/+68DNTrwB9XkzR5dNlNjVK\nxft11Xj4iTVT8C/46P419DPJhzx++iu3LYyUcyk2dOuGqzsgjFEFDB9Xs3Oc6FLK\nosMKYbN2ZF+W5DCZUJ1Xn8WiXJVN14xvkZWXomdNwrprBBvF/yx7X5fhjynNncc0\nyybtPyu1AgMBAAECggEAGpGaG3SWZFd9XdX5fZhQ2TDg+4l/0E3NrGpck0yIlrIp\nclfkLDzfKW6+/PvjZMop7i56+kExoyklridm5aMv+37ohcpBcU2HhqpgSAodtw+B\nW2kp5ibnLnwsEsEbZYnVcfAQRL+lEaJvm98/klvuw/XNpF3b5wzgZ8tjQpaEQttK\nWNEe32WVl1AwyHq3v5tIQUx9KaWh+8gH0iAuvHRMNcPNkOuj2/WG4YkDVrhFLanW\nZ82hR7cvfV0/L7xy6Ki0TMVUJYI359Mxz4fYRGwK0n4GNIGkbsV87GOKM0iexwpk\n/V51uKAf/tQmNffwvWat+B84TqrwolSHhDd40RGTsQKBgQD33CXZpbGpA9LoTkK1\nQxx8VUYyiVpioDI0gQ3FYiIstA1PThWxM/MXUX9cW+V7BH0RKkV/Vj3FmCLS4i5Q\nXBLqFfYICdAijr7I0BfRFHNamo9WiAprkO0vYSpfv477s6L7jC2EjrVNGQ7H96/+\na0Po6S+dz8wffBJV2Ryg3m1syQKBgQDRG0kk3u4vpwNaDM1k/grRh7lf20+Eq6ej\nFLMFb4qeQVuycnZigP5zDqrXG9jqJ8EhlfgT/VIAtJuwwr2jZqY7AB+S6UTchXID\nsugtaORS3CJnzSW7ywdbv/Gbjww5qaYL/ctpEH3Cl4VRYn3XCaMguKdp8niDSxDX\np9Kg4/W5jQKBgQCiyrEBdlZtj9liQqSFsQJwlwF4B8aZqGXRHkIRNhcEDW4AfGS6\n8kfjNN/VpXXfil8qev0SWW5Q7U9R+sQ4e4DgxnPFa8yMJf0gn6xE4o2xIHqsdsWB\nSLq/t63BHWun3aBaXwM2YRSrAp42sHOjQohj3WQs3mJO+4p/YA3xiqWMIQKBgD8x\nvdM0xEsGcE7gm5ov5FkaaX18q/VuYwU4FjpIUV4uZmXxjbGLRlrDTgIgWle5l/Zs\nekKgRg4MhxjOYb1mIkqmaORfNv5mHeTcRqqijo40FPnF1+d/HkQuJ/hZLNqoWJQ7\nKSQhZcBPRm0oFNvN/8y9wWqVarJTF031XARfoD1pAoGAbmpYdE/odaN6vVrezTS0\njm8MfZwUlWsy1OmbO4AjL5VseWfd27LFVOIYySFboLnYcnaDrSP77lgdA0OS8ba6\nPmfgMcr61AvJfJILVbXPDMLXmD0eRHu+oMC3ZOegEbZ99bSahylKdHFbiqO5IN1D\nDJ1z5Va5lgfM5gG8ugGntV8=\n-----END PRIVATE KEY-----\n",
  "client_email": "appointment-scheduler@scheduler-xmgb.iam.gserviceaccount.com",
  "client_id": "106184117084664178347",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/appointment-scheduler%40scheduler-xmgb.iam.gserviceaccount.com"
};

// Set up Google Calendar Service account credentials
const serviceAccountAuth = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: 'https://www.googleapis.com/auth/calendar'
});

const calendar = google.calendar('v3');
process.env.DEBUG = 'dialogflow:*'; // enables lib debugging statements


const timeZone = 'America/Los_Angeles';
const timeZoneOffset = '-07:00';


//method to show available time slots on the same day

//method to  ensure appointments are made within working hours

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({
    request,
    response
  });
  console.log("Parameters", agent.parameters);
  //-----------------MAKE APPOINTMENT---------------------------------------------------//
  function makeAppointment(agent) {
    const appointment_type = agent.parameters.name.concat("_", agent.parameters.email);
    // Calculate appointment start and end datetimes (end = +1hr from start)
    //console.log("Parameters", agent.parameters.date);
    const dateTimeStart = new Date(Date.parse(agent.parameters.date.split('T')[0] + 'T' + agent.parameters.time.split('T')[1].split('-')[0] + timeZoneOffset));
    const dateTimeEnd = new Date(new Date(dateTimeStart).setHours(dateTimeStart.getHours() + 1));
    const confirmation = agent.parameters.confirmation;
    const appointmentTimeString = dateTimeStart.toLocaleString(
      'en-US', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        timeZone: timeZone
      }
    );
    if (confirmation == "no") {
      return true.then(() => {
        agent.add(`ok, let's try this again. Enter the date and time for which you would like to make an appointment`);
      });
    }

    // Check the availibility of the time, and make an appointment if there is time on the calendar
    return createCalendarEvent(dateTimeStart, dateTimeEnd, appointment_type).then(() => {
      agent.add(`You are all set for ${appointmentTimeString}.`);
      sendConfirmationEmail(agent.parameters.name, agent.parameters.email, appointmentTimeString);
    }).catch(() => {
      agent.add(`I'm sorry, there are no slots available for ${appointmentTimeString}.`);
    });
  }
 
//----------------------------------------------------------------
//Remove appointment
//----------------------------------------------------------------------------------//
  function removeAppointment(agent){
    const dateTimeStart = new Date(Date.parse(agent.parameters.date.split('T')[0] + 'T' + agent.parameters.time.split('T')[1].split('-')[0] + timeZoneOffset));
    return deleteAppointment(agent.parameters.email,dateTimeStart).then(() =>{
      agent.add("Your apppointment has been cancelled");
    }).catch(() => {
      agent.add("I'm sorry, I have encountered an error while trying to cancel your appointment.Please constact the Service provider for more assistance.");
    });
  }
   //----------------------------------------------------------------------------------//

  //---------------------------INTENT MAP FOR MAKE APPOINTMENT----------------------//
  let intentMap = new Map();
  intentMap.set('Schedule appointment', makeAppointment);
  intentMap.set('Cancel Appointment', removeAppointment);
  agent.handleRequest(intentMap);
});

//----------------------------------------------------------------------------------//

//------------------------------------CREATE CALENDER EVENT---------------------------//
function createCalendarEvent(dateTimeStart, dateTimeEnd, appointment_type) {
  return new Promise((resolve, reject) => {
    const eventId= generateUniqueID(appointment_type.split('_')[1],dateTimeStart.toISOString());
    calendar.events.list({
      auth: serviceAccountAuth, // List events for time period
      calendarId: calendarId,
      timeMin: dateTimeStart.toISOString(),
      timeMax: dateTimeEnd.toISOString(),
    }, (err, calendarResponse) => {
      // Check if there is a event already on the Calendar
      if (err || calendarResponse.data.items.length > 0) {
        reject(err || new Error('Requested time conflicts with another appointment'));
      } else {
        // Create event for the requested time period
        calendar.events.insert({
          auth: serviceAccountAuth,
          calendarId: calendarId,
          resource: {
            summary: appointment_type.split('_')[0] + ' Appointment',
            description: appointment_type.split('_')[1],
            start: {
              dateTime: dateTimeStart
            },
            end: {
              dateTime: dateTimeEnd
            },
            id:eventId,            
          }
        }, (err, event) => {
          err ? reject(err) : resolve(event);
        });
      }
    });
  });
}
//------------------------------------SEND CONFIRMATION EMAIL------------------------------------//
function sendConfirmationEmail(name, email, dateTime) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'spotwyll@gmail.com',
      pass: 'extbgbmoxtkjskhz'
    }
  });

  var mailOptions = {
    from: 'spotwyll@gmail.com',
    to: email,
    subject: 'Appointment Confirmation',
    text: `Hello ${name} \n\n Your appointment for ${dateTime} has been confirmed. We look foward to seeing you.\n\nThanks.\nService Provider`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
//----------------------------------------------------------------//
//Delete appointment
//----------------------------------------------------------------

function deleteAppointment(email, time) {
  return new Promise((resolve, reject) => {
    let appointmentid=generateUniqueID(email, time.toISOString());
    calendar.events.delete(
      {
        auth: serviceAccountAuth,
        calendarId: calendarId,
        eventId: appointmentid,
      },
      (err, event) => {
        err ? reject(err) : resolve(event);
      });
    });
  }


  function generateUniqueID(email, dateISO) {
    const hash = crypto.createHash('sha256')
      .update(email + dateISO)
      .digest('hex');
    const truncatedHash = hash.substr(0, 12);
    const decimalHash = parseInt(truncatedHash, 16);
    const base32Hash = decimalHash.toString(32);
    const paddedBase32Hash = base32Hash.padStart(10, '0');
    return paddedBase32Hash.replace(/[w-z]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 22));
  }
