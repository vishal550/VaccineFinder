const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios').default;
// replace the value below with the Telegram token you receive from @BotFather
const token = '1802666494:AAG8zrp0KgP3QrG3mFIjE0uKwYdlMoanIaU';
function chunk(array, size) {
    const chunked_arr = [];
    for (let i = 0; i < array.length; i++) {
      const last = chunked_arr[chunked_arr.length - 1];
      if (!last || last.length === size) {
        chunked_arr.push([array[i]]);
      } else {
        last.push(array[i]);
      }
    }
    return chunked_arr;
}
const stateId = 21;
const district = [{
    "district_id": 391,
    "district_name": "Ahmednagar"
}, {
    "district_id": 364,
    "district_name": "Akola"
}, {
    "district_id": 366,
    "district_name": "Amravati"
}, {
    "district_id": 397,
    "district_name": "Aurangabad "
}, {
    "district_id": 384,
    "district_name": "Beed"
}, {
    "district_id": 370,
    "district_name": "Bhandara"
}, {
    "district_id": 367,
    "district_name": "Buldhana"
}, {
    "district_id": 380,
    "district_name": "Chandrapur"
}, {
    "district_id": 388,
    "district_name": "Dhule"
}, {
    "district_id": 379,
    "district_name": "Gadchiroli"
}, {
    "district_id": 378,
    "district_name": "Gondia"
}, {
    "district_id": 386,
    "district_name": "Hingoli"
}, {
    "district_id": 390,
    "district_name": "Jalgaon"
}, {
    "district_id": 396,
    "district_name": "Jalna"
}, {
    "district_id": 371,
    "district_name": "Kolhapur"
}, {
    "district_id": 383,
    "district_name": "Latur"
}, {
    "district_id": 395,
    "district_name": "Mumbai"
}, {
    "district_id": 365,
    "district_name": "Nagpur"
}, {
    "district_id": 382,
    "district_name": "Nanded"
}, {
    "district_id": 387,
    "district_name": "Nandurbar"
}, {
    "district_id": 389,
    "district_name": "Nashik"
}, {
    "district_id": 381,
    "district_name": "Osmanabad"
}, {
    "district_id": 394,
    "district_name": "Palghar"
}, {
    "district_id": 385,
    "district_name": "Parbhani"
}, {
    "district_id": 363,
    "district_name": "Pune"
}, {
    "district_id": 393,
    "district_name": "Raigad"
}, {
    "district_id": 372,
    "district_name": "Ratnagiri"
}, {
    "district_id": 373,
    "district_name": "Sangli"
}, {
    "district_id": 376,
    "district_name": "Satara"
}, {
    "district_id": 374,
    "district_name": "Sindhudurg"
}, {
    "district_id": 375,
    "district_name": "Solapur"
}, {
    "district_id": 392,
    "district_name": "Thane"
}, {
    "district_id": 377,
    "district_name": "Wardha"
}, {
    "district_id": 369,
    "district_name": "Washim"
}, {
    "district_id": 368,
    "district_name": "Yavatmal"
}]
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

console.log('hello')

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    console.log(msg);
    // send a message to the chat acknowledging receipt of their message
    const text = msg.text;
    console.log('hello', text)
    const selected = district.find(obj => obj.district_name === text);
    if (!selected && !Number.isInteger(Number(text))) {
        bot.sendMessage(chatId, 'Reply With District Name From This Only Or Pin: \n' + district.map(obj => obj.district_name).join('\n'));
    } else {
        const birthday = new Date();
        const day = birthday.getDate();
        const month = birthday.getMonth() + 1;
        let res;
        if (selected) {
            res = await getByDistrict(`${selected.district_id}`, `${day}/${month}/2021`);
            res = JSON.parse(res);
        } else {
            res = await getByPin(`${Number(text)}`, `${day}/${month}/2021`);
            res = JSON.parse(res);
        }

        if (!res.centers.length) {
            bot.sendMessage(chatId, 'No centers');
        } else {
            const chunckArr = chunk(res.centers, 5);
            if (selected) {
                chunckArr.forEach((objects) => {
                    const result = objects.reduce((acc, current) => {
                        let count = 0;
                        current.sessions.forEach((obj) => {
                            count += obj.available_capacity
                        })
                        acc += `\n name: ${current.name} \n address: ${current.address} \n doses: ${count} \n\n`;
                        return acc;
                    }, ``)
                    bot.sendMessage(chatId, 'Available: \n ' + result);
                })
                
            } else {
                chunckArr.forEach((objects) => {
                    const result = objects.reduce((acc, current) => {
                        let doses = ``;
                        let count = 0;
                        current.sessions.forEach((obj) => {
                            doses += `\n date:${obj.date} \n doses :${obj.available_capacity} \n ageLimit : ${obj.min_age_limit} \n vaccine: ${obj.vaccine} \n`
                        })
                        acc += `\n name: ${current.name} \n address: ${current.address} \n ${doses} \n\n`;
                        return acc;
                    }, ``)
                    bot.sendMessage(chatId, 'Available: \n ' + result);
                })
                
            }

        }
    }
});

function getByPin(pincode = '431715', date) {
    return new Promise((resolve, reject) => {
        var request = require("request");

        var options = {
            method: 'GET',
            url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin',
            qs: { pincode, date },
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36' }
        };

        request(options, function (error, response, body) {
            if (error) throw reject(error);
            resolve(body);
        });
    })
}

function getByDistrict(district_id = 21, date) {
    return new Promise((resolve, reject) => {
        var request = require("request");

        var options = {
            method: 'GET',
            url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict',
            qs: { district_id, date },
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36' }
        };

        request(options, function (error, response, body) {
            if (error) reject(error);
            resolve(body);
        });
    })
}

