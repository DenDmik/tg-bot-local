import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api';
import experess from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
// use `prisma` in your application to read and write data in your DB
const prisma = new PrismaClient()
const token = process.env.TOKEN;
const webAppUrl = process.env.WEB_APP;
//для оплаты звездочками пустая строка
const payToken = ''
// const url = process.env.API_URL;

// const port = process.env.PORT

// replace the value below with the Telegram token you receive from @BotFather

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {
    polling: true,
    drop_pending_updates:true
});
const app = experess()
app.use(experess.json())
app.use(cors())
const start = async () => {
    try {
        // Устанавливаем команды
        await bot.setMyCommands([
            {command: '/start', description: 'Начальное приветствие'},
            {command: '/info', description: 'Получить информацию о пользователе'},
            {command: '/music', description: 'Музыка'},
            {command: '/donat', description:'На чай'}
        ]);
        
        console.log('Bot successfully initialized');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}
const handleStart =  (chatId,text) =>{
   bot.sendSticker(chatId,'https://tlgrm.eu/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/1.webp');
//////////////////////////////////////////////////////////////   
    bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Перейти в Next-deploy project', web_app: {url:webAppUrl }}]
            ]
        }
    })
    //////////////////////////////////////////////////////////
    bot.sendMessage(chatId,'Open Web App',{
        reply_markup:{
            keyboard:[
                [{text: 'Open Web App', web_app: {url: webAppUrl}}]
            ] ,
            resize_keyboard: true
        }
    })
    ///////////////////////////////////////////////////////////
}
 start()
 
 bot.on('message',async (msg) => {
    console.log(msg.from.username)
    const text = msg.text
  const chatId = msg.chat.id;

 if(text ==='/start'){ 
    handleStart(chatId,text)
 } else if(text === '/info') {
await bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`);
} else
 
if(text === '/music'){
await bot.sendAudio(chatId,'https://muz8.z3.fm/1/50/dskarlatti_-_sonata_b-moll__k27_l449_(zf.fm).mp3?download=force')
} else 
if(text === '/donat'){
    await bot.sendInvoice(
        chatId, 
        'Задонатить', 
        'Покупка ', 
        'донат', 
        payToken,
        'XTR', 
        [{label:'RRRR', amount: 1}]
    )
} else
if(msg?.web_app_data?.data) {
    try {
        const data = JSON.parse(msg?.web_app_data?.data)
        console.log(data)
        await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
        await bot.sendMessage(chatId, 'Ваш donat: ' + data?.donat);
        // await bot.sendMessage(chatId, 'Ваш chat: ' + data?.chatId);
        await bot.sendInvoice(
            chatId, 
            'Задонатить', 
            'Покупка ', 
            'донат', 
            payToken,
            'XTR', 
            [{label:'RRRR', amount:data.donat}]
        )

    } catch (e) {
        console.log(e);
    }
} 
   
})
bot.on('pre_checkout_query', async ctx => {

    try {
console.log(`МЕТОД pre_checkout_query ctx:${ctx.id}`)
        await bot.answerPreCheckoutQuery(ctx.id, true);

    }
    catch(error) {

        console.log(error);

    }

})
bot.on('successful_payment', async ctx => {

    try {
console.log(`МЕТОД successful_payment:${ctx.successful_payment.invoice_payload}`)
        // await bot.sendDocument(ctx.chat.id, `./${ctx.successful_payment.invoice_payload}.txt`, {

        //     caption: `Спасибо за оплату ${ctx.successful_payment.invoice_payload}!`

        // })
        await bot.sendSticker(ctx.chat.id, 'https://tlgrm.eu/_/stickers/4e9/f82/4e9f8261-7c25-3624-b040-323197eaf136/9.webp')

    }
    catch(error) {

        console.log(error);

    }
})
////////////////////////////////////////


//////////////////////////////////
app.post('/createInvoice', async (req, res) => {
    const {data} = req.body;
    const queryId = data?.queryId
    const donat = data.donatCurrent
    const chatId = data.chatId
    console.log(`DONAT:${donat} queryId:${queryId} chatId:${data.chatId}`)
const invoice = await bot.createInvoiceLink(
    'Задонатить', 
    'Покупка ', 
    'донат', 
    payToken,
    'XTR', 
    [{label:'RRRR', amount:donat}]
)

    try {
        ////////////////это ответ в чат телеграма
        // await bot.answerWebAppQuery(queryId, {
        //     type: 'article',
        //     id: queryId,
        //     title: 'Успешная покупка',
        //     input_message_content: {
        //         message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${donat} `
        //     }
        // })
        ////////////////////////////////////////
        return res.status(200).json({
            invoice
        });
    } catch (e) {
        return res.status(500).json({})
    } 
}
)
////////////////////////////
app.post(`/bd/:id`, async(req,res)=>{
    const { id } = req.params
    const numberId = +id
    const response = await prisma.phrase.findUnique({
        where:{id:numberId}
})
if(!response) return res.status(500).json({})
    console.log(response)
return res.status(200).json(response);
})

////////////////////////////

const PORT = 3002;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))
//////////////////////
