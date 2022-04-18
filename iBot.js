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
const axios = require('axios');



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
const List = require('whatsapp-web.js/src/structures/List');
const group = require('whatsapp-web.js/src/structures/GroupChat');
const Location = require('whatsapp-web.js/src/structures/Location');
const { json } = require('express/lib/response');

const {LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
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
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
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
        let text= "";
        let words = msg.body.substring(6).split(" ");
            let urlConfig = '';
            words.forEach(word => {
                urlConfig += word + '_';
            });
            urlConfig.substring(0 , urlConfig.length - 1);
            request('https://he.wikipedia.org/wiki/' + encodeURI(urlConfig) , (error , 
            response , html) => {
               if(!error && response.statusCode == 200){
                   const $ = cheerio.load(html);
                    text = $('.mw-parser-output').text(); 
                    msg.reply(text);
               } 
            });

    }
    else if(msg.body.startsWith('!הגדרה')){
        const url = 'https://www.morfix.co.il/';
        let def = '';
        let uriConfig = encodeURI(msg.body.substring(7));
        console.log(url + uriConfig);
        request(url + uriConfig , (error , response , html) => {
            if(!error && response.statusCode == 200){
                const $ = cheerio.load(html);
                 def = $('.Translation_hemin_heToen span').text();
                 msg.reply(def);
            }
        });
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
    else if(msg.body.startsWith('!קישור')){
        if((await msg.getChat()).isGroup == true){
            let group =await msg.getChat();
            msg.reply(group.getInviteCode());
        }
    }
    else if (msg.body === '!רשימה') {
        let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
        let list = new List('List body','btnText',sections,'Title','footer');
        client.sendMessage(msg.from, list);
    }
    else if(msg.body.startsWith('!סטיקר')){
    
        let chat = msg.getChat();
        let media = await msg.downloadMedia();
        await (await chat).sendMessage(media , {sendMediaAsSticker:true});

    }
    else if(msg.body.startsWith('!מיקום')){
        var lat = 0;
        var lon = 0;

        function getLocation() {
        const options = {
          method: 'GET',
          url: 'https://forward-reverse-geocoding.p.rapidapi.com/v1/search',
          qs: {q: msg.body.substring(7), 'accept-language': 'en', polygon_threshold: '0.0'},
          headers: {
            'X-RapidAPI-Host': 'forward-reverse-geocoding.p.rapidapi.com',
            'X-RapidAPI-Key': process.env.geocodingRapid,
            useQueryString: true
          }
        };
        
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
        
            console.log(body);
             lon = body.substring(body.indexOf("lon") + 6 , body.indexOf("lon") + 16);
             lat = body.substring(body.indexOf("lat") + 6 , body.indexOf("lat") + 16);

             
        });
    }
        getLocation();
        msg.reply(new Location(lat, lon, msg.body.substring(7)));
}



});


client.initialize();


