const axios = require("axios")
const dotenv = require("dotenv")
dotenv.config()

async function sendSlots(phone) {
    const token = process.env.WHATSAPP_TOKEN;
    try{
        const r = await axios.post(`https://graph.facebook.com/v14.0/109549668467205/messages`,{
            "messaging_product": "whatsapp",
        "to": phone,
        "type": "template",
        "template": { "name": "slot_message", "language": { "code": "en_US" } ,
    
    }
},{
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
})
console.log(r.data)
return r.data;
    }

    catch(e){
console.log(e);
    }
}

module.exports = sendSlots;