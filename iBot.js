//project by Idan Zehavi
const { nextElementSibling } = require('domutils');
const qrcode = require('qrcode-terminal');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const express = require('express');
const puppeteer = require('puppeteer');
const spawner = require('child_process').spawn;
const figlet = require('figlet');
const Image = require('ascii-art-image');
const dotenv = require("dotenv").config();



const { Client, MessageAck,LegacySessionAuth } = require('whatsapp-web.js');
const { sheets } = require('googleapis/build/src/apis/sheets');
const { tasks } = require('googleapis/build/src/apis/tasks');
const { html } = require('cheerio/lib/static');
const { response } = require('express');
const { error } = require('console');
const { data } = require('cheerio/lib/api/attributes');
const { not } = require('cheerio/lib/api/traversing');
const { path } = require('express/lib/application');
const res = require('express/lib/response');
const req = require('express/lib/request');
const helpCommandHandler = require('./commandHandlers/helpHandler/helpCommandHandler');
const chatCommandHandler = require('./commandHandlers/textCommandHandler/chatCommandHandler');
const task = require('./commandHandlers/googleSheetsCommands/tasksCommandHandler');
const diary = require('./commandHandlers/googleSheetsCommands/diaryCommandHandler');


const SESSION_FILE_PATH = './session.json';
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

const client = new Client({
    authStrategy: new LegacySessionAuth({
        session: sessionData
    })
});

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});



client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', () => {


    var image = new Image({
        filepath: 'iBotImage.jpeg',
        alphabet:'variant4'
    });
    
    image.write(function(err, rendered){
        console.log(rendered);

        figlet.text("iBot Project", function (err, data){
            console.log(data)
           });
    
        figlet.text("Author: Idan Zehavi" , function(err , data) {
            console.log(data);
        })
    

    })
    
    console.log('AUTHENTICATED');

});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {

    if(msg.body.startsWith('!שלום')){
        
        let contact = await msg.getContact();
        console.log(contact);
        msg.reply('שלום ' + contact.pushname);
    }
    else if(msg.body.startsWith('!עזרה')){
        let message = helpCommandHandler.message;
        msg.reply(message);
    }
    else if(msg.body.startsWith('!ויקי')){
        let text = chatCommandHandler.wiki(msg.body.substring(6));
        msg.reply(text);
    }
    else if(msg.body.startsWith('!הגדרה')){
        let def = chatCommandHandler.getDef(msg.body.substring(7));
        msg.reply(def);
    }
    else if(msg.body.startsWith('!תרגם')){
        let translation="";
       const url = 'https://www.morfix.co.il/';
       const uriConfig = encodeURI(msg.body.substring(6));
       console.log(url + uriConfig);
       function isEnglishLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
      }

        request(url + uriConfig , (error , response , html) => {
            if(!error && response.statusCode == 200){
                const $ = cheerio.load(html);
                if(isEnglishLetter(msg.body.substring(6))){
                 translation = $('.MachineTranslation_content_enTohe').text();
                }
                else{
                    translation = $('.normal_translation_div').text();
                }
                msg.reply(translation);
            }
        })
    }
    else if(msg.body.startsWith('!מטלה')){
          task.saveTask(msg.body.substring(6) , msg.from);
          msg.reply('מטלה נוספה בהצלחה!')
    }
    else if(msg.body.startsWith('!מטלות')){
        let tasksOutput = await task.getTasks(msg.from);
          msg.reply(tasksOutput);
    }
    else if(msg.body.startsWith('!מחק')){
        task.delTask(msg.from , msg.body.substring(5));
          msg.reply('מטלה נמחקה בהצלחה')
    }
    else if(msg.body.startsWith('!תעד')){
        let content = msg.body.substring(5);
        diary.addLog(content , msg.from);
        msg.reply('תיעוד נוסף בהצלחה!')
    }
    else if(msg.body.startsWith('!תיעוד')){
        let dateRecived = msg.body.substring(7);
        let messageLogs = await diary.getLogsForDate(dateRecived , msg.from);
        
        msg.reply(messageLogs);

    }
    else if(msg.body.startsWith('!קורונה')){
         await covid(msg);
    }
    else if(msg.body.startsWith('!צאט')){

        let url = chatCommandHandler.chatWith(msg.body.substring(5));

        msg.reply(url);
    }
    else if(msg.body.startsWith('!הורד')){
       let returnURL = chatCommandHandler.download(msg.body);
        msg.reply(returnURL);
    }
    else if(msg.body.startsWith('!אינסט')){

    }
    

	
});

client.initialize();


