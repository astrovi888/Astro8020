const STORY=[
{t:"Mein Tag",l:"A1",s:`Ich heiße Lena.|My name is Lena.
Ich wohne in Berlin.|I live in Berlin.
Am Morgen trinke ich einen Kaffee.|In the morning I drink a coffee.
Dann fahre ich mit dem Bus zur Arbeit.|Then I take the bus to work.
Ich arbeite in einem Büro.|I work in an office.
Um fünf Uhr gehe ich nach Hause.|At five o’clock I go home.
Am Abend koche ich und lese ein Buch.|In the evening I cook and read a book.`,q:["Wie fährt Lena zur Arbeit?",["Mit dem Bus","Mit dem Auto","Mit dem Fahrrad"]],w:["Describe your own day in 4–5 sentences.","Ich heiße Karim. Ich wohne in Tunis. Am Morgen trinke ich Tee. Dann gehe ich zur Schule. Am Abend lerne ich Deutsch.","Tip: the verb stays in second position, even after “Am Morgen” or “Dann”."]},
{t:"Im Café",l:"A1",s:`Kellner: Guten Tag! Was möchten Sie trinken?|Waiter: Good day! What would you like to drink?
Gast: Einen Tee und ein Stück Kuchen, bitte.|Guest: A tea and a piece of cake, please.
Kellner: Gern. Möchten Sie Zucker?|Waiter: Gladly. Would you like sugar?
Gast: Nein, danke. Ohne Zucker.|Guest: No, thank you. Without sugar.
Kellner: Hier ist Ihr Tee.|Waiter: Here is your tea.
Gast: Vielen Dank. Wie viel kostet das?|Guest: Thank you very much. How much is that?
Kellner: Das macht sieben Euro fünfzig.|Waiter: That comes to seven euros fifty.`,q:["Was bestellt der Gast?",["Tee und Kuchen","Kaffee und Brot","Wasser und Suppe"]],w:["Order a drink and something to eat, then ask for the price.","Guten Tag! Ich möchte einen Kaffee und ein Brötchen, bitte. Wie viel kostet das?","Tip: after möchte the object takes the accusative: der Kaffee becomes einen Kaffee, das Brötchen stays ein Brötchen."]},
{t:"Der Hund im Park",l:"A2",s:`Jeden Sonntag gehen Tom und seine Schwester im Park spazieren.|Every Sunday Tom and his sister go for a walk in the park.
Sie haben einen kleinen Hund, der Max heißt.|They have a small dog named Max.
Heute scheint die Sonne, und der Hund läuft schnell über die Wiese.|Today the sun is shining, and the dog runs quickly across the meadow.
Plötzlich sieht Max eine Katze und rennt hinterher.|Suddenly Max sees a cat and runs after it.
Tom ruft: „Max, komm zurück!“|Tom shouts: “Max, come back!”
Aber der Hund hört nicht.|But the dog doesn’t listen.
Nach fünf Minuten kommt Max müde zurück.|After five minutes Max comes back tired.
Die Katze sitzt auf einem Baum und schaut zu.|The cat sits in a tree and watches.`,q:["Warum läuft Max weg?",["Er sieht eine Katze","Er hat Hunger","Er ist müde"]],w:["Describe a walk you took last weekend (4–5 sentences).","Am Samstag bin ich mit meinem Bruder im Park spazieren gegangen. Das Wetter war schön. Wir haben ein Eis gegessen. Danach sind wir nach Hause gegangen.","Tip: movement verbs like gehen form the Perfekt with sein, while essen uses haben."]},
{t:"Eine Wohnung suchen",l:"A2",s:`Anna sucht eine neue Wohnung in Hamburg.|Anna is looking for a new apartment in Hamburg.
Ihre alte Wohnung ist zu klein und zu teuer.|Her old apartment is too small and too expensive.
Sie schaut jeden Abend im Internet nach Anzeigen.|Every evening she looks at listings online.
Am Samstag besichtigt sie eine Wohnung mit zwei Zimmern und einem Balkon.|On Saturday she views an apartment with two rooms and a balcony.
Die Miete beträgt 750 Euro im Monat.|The rent is 750 euros a month.
Der Vermieter fragt: „Haben Sie ein festes Einkommen?“|The landlord asks: “Do you have a steady income?”
Anna antwortet: „Ja, ich arbeite seit drei Jahren bei einer Firma.“|Anna answers: “Yes, I’ve been working at a company for three years.”
Zwei Tage später bekommt sie die Zusage.|Two days later she gets the confirmation.`,q:["Was ist das Problem mit Annas alter Wohnung?",["Sie ist zu klein und zu teuer","Sie ist zu laut","Sie hat keinen Balkon"]],w:["Describe your ideal apartment in 4 sentences.","Meine Traumwohnung hat drei Zimmer und einen großen Balkon. Sie liegt in der Nähe vom Park. Die Küche ist hell und modern. Die Miete darf nicht zu hoch sein.","Tip: haben takes the accusative (einen großen Balkon), and “in der Nähe von” takes the dative."]},
{t:"Ein Brief an einen Freund",l:"B1",s:`Lieber Karim,|Dear Karim,
ich hoffe, es geht dir gut.|I hope you’re doing well.
Seit zwei Monaten wohne ich jetzt in München, und ich habe mich schon gut eingelebt.|I’ve been living in Munich for two months now, and I’ve already settled in well.
Die Stadt ist wunderschön, aber das Leben hier ist ziemlich teuer.|The city is beautiful, but life here is quite expensive.
Meine Kollegen sind sehr nett und helfen mir oft, wenn ich etwas nicht verstehe.|My colleagues are very nice and often help me when I don’t understand something.
Am Wochenende fahre ich manchmal in die Berge, weil ich die Ruhe dort so mag.|On weekends I sometimes go to the mountains because I like the peace there so much.
Hast du Lust, mich im Sommer zu besuchen?|Do you feel like visiting me in the summer?
Dann könnten wir zusammen wandern gehen.|Then we could go hiking together.
Viele Grüße, dein Jonas|Best wishes, your Jonas`,q:["Warum fährt Jonas am Wochenende in die Berge?",["Er mag die Ruhe","Er arbeitet dort","Er besucht Karim"]],w:["Write a short letter to a friend about your city. Use weil and wenn.","Liebe Sara, ich wohne gern in Tunis, weil das Wetter fast immer schön ist. Wenn ich frei habe, gehe ich gern ans Meer. Besuch mich doch im Sommer!","Tip: after weil and wenn the verb goes to the end of the clause, and the main clause that follows starts with its verb (“Wenn ich frei habe, gehe ich …”)."]}
].map(x=>(x.s=x.s.split("\n").map(r=>r.split("|")),x));
