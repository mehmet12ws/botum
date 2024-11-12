import pkg from 'discord.js';
const { Client, GatewayIntentBits } = pkg;
import fs from 'fs';

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
];

const client = new Client({ intents });

const dataFile = 'game_data.json';

let golSayilari = {};
let asistSayilari = {};
let lineups = {};

function saveData() {
    const data = {
        gol_sayilari: golSayilari,
        asistSayilari: asistSayilari,
        lineups: lineups
    };
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function loadData() {
    if (fs.existsSync(dataFile)) {
        const rawData = fs.readFileSync(dataFile);
        try {
            const data = JSON.parse(rawData);
            golSayilari = data.gol_sayilari || {};
            asistSayilari = data.asistSayilari || {};
            lineups = data.lineups || {};
        } catch (e) {
            console.error('Veri dosyası bozulmuş, sıfırlanıyor...', e);
            resetData();
        }
    } else {
        resetData();
    }
}

function resetData() {
    golSayilari = {};
    asistSayilari = {};
    lineups = {};
    saveData();  
}

client.once('ready', () => {
    loadData();
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Sadece mesaj başında '!' varsa komutları cevapla
    if (!message.content.startsWith('!')) return;

    // Hakem rolüne sahip olup olmadığını kontrol et
    const hakemRolId = '1304944555111612506';
    if (!message.member.roles.cache.has(hakemRolId)) {
        return message.reply('Bu komutu kullanmak için @hakem rolüne sahip olmanız gerekiyor!');
    }

    try {
        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        let golMesaji = '';
        let asistMesaji = '';
        let golResmi = '';
        let asistResmi = '';
        let varResmi = 'https://cdn.wmaraci.com/nedir/VAR.jpg';

        // VAR komutu: !var
        if (command === 'var') {
            message.reply('VAR inceleniyor...');
            await message.reply(varResmi); // VAR resmini ekle
            return;
        }

        // Gol ekleme komutu: !goal @kullanıcı
        if (command === 'goal') {
            if (args.length === 0) return message.reply('Lütfen bir kullanıcı belirtin!');
            const user = message.mentions.members.first();
            if (!user) return message.reply('Geçerli bir kullanıcı belirtin!');

            if (golSayilari[user.id]) {
                golSayilari[user.id]++;
            } else {
                golSayilari[user.id] = 1;
            }

            saveData();

            golMesaji = `**${user.user.tag}** :soccer: Toplam gol sayısı: **${golSayilari[user.id]}**`;
            golResmi = 'https://cdn.discordapp.com/attachments/1304891541021528146/1305234896591261786/icardii.gif?ex=67339bb9&is=67324a39&hm=f7e769ba05246a2bc881832746e5da6fe90db25e6ac9ce8618891d849df933e2&';
        }

        // Asist ekleme komutu: !asist @kullanıcı
        if (command === 'asist') {
            if (args.length === 0) return message.reply('Lütfen bir kullanıcı belirtin!');
            const user = message.mentions.members.first();
            if (!user) return message.reply('Geçerli bir kullanıcı belirtin!');

            if (asistSayilari[user.id]) {
                asistSayilari[user.id]++;
            } else {
                asistSayilari[user.id] = 1;
            }

            saveData();

            asistMesaji = `**${user.user.tag}** :champagne_glass: Toplam asist sayısı: **${asistSayilari[user.id]}**`;
            asistResmi = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLv4pPULe36zUR2ZCljhKuZIAoSrgowGa4rA&s';
        }

        // Gol silme komutu: !golal @kullanıcı sayı
        if (command === 'golal') {
            if (args.length < 2) return message.reply('Lütfen bir kullanıcı ve silmek istediğiniz gol sayısını belirtin!');
            const user = message.mentions.members.first();
            const golSilinecekMiktar = parseInt(args[1]);

            if (!user) return message.reply('Geçerli bir kullanıcı belirtin!');
            if (isNaN(golSilinecekMiktar) || golSilinecekMiktar <= 0) return message.reply('Geçerli bir sayı girin!');

            // Kullanıcının gol sayısını azalt
            if (golSayilari[user.id]) {
                golSayilari[user.id] = Math.max(0, golSayilari[user.id] - golSilinecekMiktar); // 0'dan aşağı gitmesin
            } else {
                golSayilari[user.id] = 0;
            }

            saveData();

            golMesaji = `**${user.user.tag}** Golün Alındı Yeni Gol Sayın **${golSayilari[user.id]}**`;
        }

        // Asist silme komutu: !asistal @kullanıcı sayı
        if (command === 'asistal') {
            if (args.length < 2) return message.reply('Lütfen bir kullanıcı ve silmek istediğiniz asist sayısını belirtin!');
            const user = message.mentions.members.first();
            const asistSilinecekMiktar = parseInt(args[1]);

            if (!user) return message.reply('Geçerli bir kullanıcı belirtin!');
            if (isNaN(asistSilinecekMiktar) || asistSilinecekMiktar <= 0) return message.reply('Geçerli bir sayı girin!');

            // Kullanıcının asist sayısını azalt
            if (asistSayilari[user.id]) {
                asistSayilari[user.id] = Math.max(0, asistSayilari[user.id] - asistSilinecekMiktar); // 0'dan aşağı gitmesin
            } else {
                asistSayilari[user.id] = 0;
            }

            saveData();

            asistMesaji = `**${user.user.tag}** Asistin Silindi Yeni Asist Sayın: **${asistSayilari[user.id]}**`;
        }

        // Gol Kralı komutu: !golkralı
        if (command === 'golkralı') {
            if (Object.keys(golSayilari).length === 0) return message.reply('Henüz gol atan oyuncu yok!');
            
            const sortedGolSayilari = Object.entries(golSayilari)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5); // İlk 5

            let response = '**Gol Kralları:**\n';
            for (const [userId, stat] of sortedGolSayilari) {
                try {
                    const user = await message.guild.members.fetch(userId);
                    response += `${user.user.tag} :soccer: **${stat}** gol\n`;
                } catch (error) {
                    console.error('Kullanıcı fetch hatası:', error);
                }
            }
            message.reply(response);
        }

        // Asist Kralı komutu: !asistkralı
        if (command === 'asistkralı') {
            if (Object.keys(asistSayilari).length === 0) return message.reply('Henüz asist yapan oyuncu yok!');
            
            const sortedAsistSayilari = Object.entries(asistSayilari)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5); // İlk 5

            let response = '**Asist Kralları:**\n';
            for (const [userId, stat] of sortedAsistSayilari) {
                try {
                    const user = await message.guild.members.fetch(userId);
                    response += `${user.user.tag} :champagne_glass: **${stat}** asist\n`;
                } catch (error) {
                    console.error('Kullanıcı fetch hatası:', error);
                }
            }
            message.reply(response);
        }

        // Gol ve Asist mesajlarını gönder
        if (golMesaji || asistMesaji) {
            const response = `${golMesaji || ''}\n\n${asistMesaji || ''}`;
            const sentMessage = await message.channel.send(response);
            if (golResmi) await sentMessage.reply(golResmi);
            if (asistResmi) await sentMessage.reply(asistResmi);
        }

        // Komut sonrası mesajı silme
        if (command !== 'golkralı' && command !== 'asistkralı') {
            await message.delete();
        }
    } catch (error) {
        console.error('Hata:', error);
        message.reply('Bir hata oluştu! Lütfen tekrar deneyin.');
    }
});

client.login('MTMwNDg5NzY1ODYyMzc1NDMxMQ.G4900o.cj031R7WpmPkVNJErB8kB6Xf9xYQg3z0Q5Cy9Y');
