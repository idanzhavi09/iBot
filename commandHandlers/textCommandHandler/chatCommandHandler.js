const request = require('request');
const axios = require('axios');
const dotenv = require('dotenv');
const cheerio = require('cheerio');

function chatWith(PHONE_NUMBER){
    var url = 'wa.me//';
    if(PHONE_NUMBER.charAt(0) == '0'){
        url += '972' + PHONE_NUMBER.substring(1);
    }
    else{
        url += PHONE_NUMBER;
    }

    return url
}

function download(msg){
    let msgContents = msg.split(" ")
    let type = msgContents[1];
    let url = msgContents[2];
    let returnURL = 'https://yt-download.org/api/button/' + type + '?url=' + url;

    return returnURL;
}
async function getDef(stringDef){
    const url = 'https://www.morfix.co.il/'
    let def = '';
    let uriConfig = encodeURI(stringDef);
    console.log(url + uriConfig);
    request(url + uriConfig , (error , response , html) => {
        if(!error && response.statusCode == 200){
            const $ = cheerio.load(html);
             def = $('.Translation_hemin_heToen span').text();
        }
    });
    return Promise.resolve(def);
}

function wiki(value){
    let text= "";
    let words = value.split(" ");
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
           } 
        });
        return text;
}

async function getCovidDataByCountry(countryName){

    var message = '';

    const options = {
        method: 'GET',
        url: 'https://corona-virus-world-and-india-data.p.rapidapi.com/api',
        headers: {
          'X-RapidAPI-Host': 'corona-virus-world-and-india-data.p.rapidapi.com',
          'X-RapidAPI-Key': process.env.X-RapidAPI-Key,
          useQueryString: true
        }
      };
      
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        var data = JSON.parse(body);
        let length = Object.keys( data.countries_stat ).length;
        for(let i = 0;i < length; i++){
            if(data.countries_stat[i].country_name == countryName){
                message += data.countries_stat[i].toString();
            }
        }
      });

      return Promise.resolve(message);
}



module.exports = {
    chatWith,
    download,
    getDef,
    wiki,
    getCovidDataByCountry,
}