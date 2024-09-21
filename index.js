// By - WOODcraft @SudoR2spr
import 'dotenv/config';
import express from 'express'; 
import fetch from 'node-fetch'; 
import { stickerIds } from './stickers.js';

const app = express(); 
const port = process.env.PORT || 3000; 
const BOT_TOKEN = process.env.BOT_TOKEN; 

app.use(express.json()); 

app.get('/', (req, res) => { 
    res.send('Welcome to the reaction bot'); 
}); 

app.post(`/bot${BOT_TOKEN.split(':')[0]}`, async (req, res) => { 
    const update = req.body; 

    if (update.message) { 
        const chatId = update.message.chat.id; 
        const messageId = update.message.message_id; 
        const text = update.message.text;

        if (text === '/start') {
            // Send welcome message logic
        } else {
            await sendReaction(chatId, messageId); 
        }
    } 

    res.sendStatus(200); 
}); 

const sendReaction = async (chatId, messageId) => { 
    try { 
        const randomSticker = stickerIds[Math.floor(Math.random() * stickerIds.length)];
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendSticker`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                reply_to_message_id: messageId,
                sticker: randomSticker,
                disable_notification: true,
            }),
        }); 
        
        if (!response.ok) { 
            console.error('Failed to send sticker:', response.statusText); 
            return; 
        }

        const messageData = await response.json(); 
        const newMessageId = messageData.result.message_id; 

        setTimeout(async () => {
            await deleteReaction(chatId, newMessageId);
        }, 3000); 
    } catch (error) { 
        console.error('Error sending sticker:', error); 
    } 
};

const deleteReaction = async (chatId, messageId) => {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
            }),
        });

        if (!response.ok) {
            console.error('Failed to delete reaction:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting reaction:', error);
    }
};

const setWebhook = async () => { 
    const webhookUrl = `${process.env.WEBHOOK_URL}/bot${BOT_TOKEN.split(':')[0]}`; 
    try { 
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`); 
        const data = await response.json(); 
        if (data.ok) { 
            console.log('Webhook set successfully'); 
        } else { 
            console.error('Failed to set webhook:', data.description); 
        } 
    } catch (error) { 
        console.error('Error setting webhook:', error); 
    } 
}; 

app.listen(port, () => { 
    console.log(`Server is running on port ${port}`); 
    setWebhook(); 
});

// By - WOODcraft @SudoR2spr
