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
function getDef(stringDef){
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
    return def;
}

module.exports = {
    chatWith,
    download,
    getDef,
}