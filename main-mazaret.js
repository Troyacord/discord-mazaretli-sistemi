
client.on("message", async (message) => {
  const db = require("quick.db")
  const reply = require("discord-reply-tr")
  
  const mods = ["805524128442351636", "805524129960296490", "805524127447646260", "805566975874826330"] //MAZARETİ ONAYLAYACAK YETKİLİ ROL ID'LERİ
  const sunucu = client.guilds.cache.get("489137623110123530") // SUNUCU ID
  
  if(message.channel.type == "dm"){
    if(message.author.bot) return;    
    if(message.content.startsWith("!mazaret")){
      if(!sunucu.members.cache.get(message.author.id).roles.cache.has("805524164333142026")) return; //BU SİSTEMİ SADECE YETKİLİLERİNİZİN KULLANABİLMESİ İCİN TEMEL YETKİLİ ROLÜNÜN ID'SİNİ GİRİNİZ
      var args = message.content.split(" ").slice(1)
      if(!args[0]) return reply.true(message, "⛔ Mazaret isteğini belirtmeden sistemi kullanamazsın.")
      
      var mazaret = args.slice(0).join(" ")
      if(mazaret.length < 8) return reply.true(message, "Mazaret içeriği 8 karakterden az olamaz. Lütfen daha detaylı bir sebep gir.")
      if(await db.fetch(`bekleyen.${message.author.id}.mazaret`)) return reply.true(message, "⛔ Hala bekleyen bir mazaret isteğiniz var! Eğer hala mazaret talebinizin cevabı gelmediyse üst yetkililere ulaşın.")
      
      await db.add(`mazaretno`, 1)
      let no = await db.fetch(`mazaretno`)
      db.set(`bekleyen.${message.author.id}.mazaret`, mazaret)
    
      sunucu.channels.cache.get("817723187265142815")//MAZARET TALEPLERİNİN GÖNDERİLECEĞİ KANAL
        .send(new MessageEmbed()
             .setTitle(`<a:yukleniyor:832387254248669234> Onay Bekliyor..`)
             .setColor("WHITE")
             .setDescription(`${message.author} (\`${message.author.id}\`) tarafından mazaret isteği talep edildi.
             
**Mazaret İçeriği:**
» ${mazaret}`)).then(async (msg) => {
        reply.true(message, `\`#${no}\` numaralı mazaret talebiniz bekleme listesine alındı. Kabul edildiğinde bildirileceksiniz!`)
        await msg.react("783287793014669313")//ONAY EMOJİSİ
        await msg.react("833105736296038420")//RET EMOJİSİ
        
        let filter = (reaction, user) => {
          return ["onayy", "redd"].includes(reaction.emoji.name) && sunucu.members.cache.find(x => x.id == user.id && mods.some(u => x.roles.cache.has(u)))
          }
        
        const collector = msg.createReactionCollector(filter, { time: 86400000 });
        
        collector.on("collect", async (reaction, user) => {
          const troya = reaction.emoji.name;
          
          if(troya === "onayy"){
            message.author.send(`\`#${no}\` numaralı mazaret talebiniz yetkililer tarafından onaylı görüldü. Tekrar görüşmek dileğiyle.. 👋`)
            msg.reactions.removeAll().catch();
            db.delete(`bekleyen.${message.author.id}.mazaret`)
            msg.edit(new MessageEmbed()
                     .setTitle(`<:onayy:783287793014669313> Mazaret İsteği Kabul Edildi`)
                     .setColor("GREEN")
                     .setDescription(`\`Talep Sahibi:\` <@${message.author.id}> (\`${message.author.id}\`) \n\`Mazaret İçeriği:\` ${mazaret}`)
                     )
            }
          
          if(troya === "redd"){
            message.author.send(`\`#${no}\` numaralı mazaret talebiniz yetkililer tarafından reddedildi.`)
            msg.reactions.removeAll().catch();
            db.delete(`bekleyen.${message.author.id}.mazaret`)
            msg.edit(new MessageEmbed()
                     .setTitle(`<:redd:833105736296038420> Mazaret İsteği Reddedildi`)
                     .setColor("RED")
                     .setDescription(`\`Talep Sahibi:\` <@${message.author.id}> (\`${message.author.id}\`) \n\`Mazaret İçeriği:\` ${mazaret}`)
                     )
            }
          })
        
        collector.on("end", () => {
          msg.reactions.removeAll().catch();
          db.delete(`bekleyen.${message.author.id}.mazaret`)
          msg.edit(new MessageEmbed()
                   .setDescription(`Bu mazaret isteği süre aşımına uğradığı için iptal edilmiştir.`)
                   )
          })
        })
     }
   }
 })
