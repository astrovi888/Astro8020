
// Rows: [German, English, frequency band (approx. rank ceiling of hardest word), level, theme, grammar note]
const OLD=[
["Ich habe keine Zeit.","I don’t have time.",100,"A1","Daily","keine negates nouns used without an article; nicht negates verbs and adjectives."],
["Das ist mein Haus.","That is my house.",100,"A1","Home","Haus is neuter, so das Haus. mein- takes the same endings as ein-: no ending for neuter nominative."],
["Wo ist der Bahnhof?","Where is the train station?",200,"A1","Daily","Question word first, verb second. Bahnhof is masculine: der Bahnhof."],
["Ich arbeite jeden Tag.","I work every day.",200,"A1","Work","Time expressions like jeden Tag take the accusative."],
["Ich möchte bitte ein Wasser.","I would like a water, please.",200,"A1","Restaurant","möchte is the polite form of wanting. Wasser is neuter: ein Wasser (accusative looks the same)."],
["Kannst du mir helfen?","Can you help me?",200,"A1","Daily","helfen takes the dative: mir, not mich. With a modal verb, the infinitive goes to the end."],
["Wir essen heute im Restaurant.","We are eating at a restaurant today.",300,"A1","Restaurant","im = in dem. in + dative answers “where?”. The verb stays in second position."],
["Das Essen ist fertig.","The food is ready.",300,"A1","Kitchen","Das Essen is a verb used as a noun, and these are always neuter."],
["Das Wasser kocht schon.","The water is already boiling.",300,"A1","Kitchen","Wasser is neuter, so das Wasser. schon = already."],
["Ich fahre mit dem Zug nach Berlin.","I’m taking the train to Berlin.",300,"A1","Daily","mit always takes the dative: dem Zug. nach is used for cities and countries."],
["Ich muss morgen früh aufstehen.","I have to get up early tomorrow.",300,"A2","Daily","aufstehen is separable. With a modal verb it stays together as one infinitive at the end."],
["Ich habe gestern lange gearbeitet.","I worked for a long time yesterday.",300,"A2","Work","Perfekt = haben + past participle at the end of the sentence."],
["Ich weiß nicht, was ich sagen soll.","I don’t know what I’m supposed to say.",300,"B1","Daily","In an indirect question the verb moves to the end. weiß is irregular (wissen)."],
["Der Hund ist im Garten.","The dog is in the garden.",400,"A1","Animals","im = in dem. Location (“where?”) takes the dative. Hund is masculine: der Hund."],
["Ich gehe mit dem Hund spazieren.","I’m going for a walk with the dog.",400,"A1","Animals","mit + dative: dem Hund. spazieren gehen = to go for a walk."],
["Haben Sie einen Tisch für zwei Personen?","Do you have a table for two people?",400,"A1","Restaurant","Tisch is masculine, so the accusative is einen Tisch. für always takes the accusative."],
["Mach bitte das Fenster zu.","Please close the window.",400,"A1","Home","Imperative of a separable verb (zumachen): the prefix goes to the end. Fenster is neuter."],
["Wenn es regnet, bleibe ich zu Hause.","If it rains, I stay at home.",400,"A2","Outdoors","wenn sends the verb to the end of its clause. The main clause then starts with its verb."],
["Ich freue mich auf das Wochenende.","I’m looking forward to the weekend.",400,"B1","Work","sich freuen auf + accusative is for future events (über is for things happening now)."],
["Die Katze schläft auf dem Sofa.","The cat is sleeping on the sofa.",500,"A1","Animals","auf + dative when the cat is already there (where?). Katze is feminine: die Katze."],
["Wir kochen heute Abend zusammen.","We’re cooking together this evening.",500,"A1","Kitchen","heute Abend = this evening. Abend is masculine, but no article is needed here."],
["Ich stelle die Lampe auf den Tisch.","I’m putting the lamp on the table.",500,"A2","Home","Movement (where to?) means accusative: auf den Tisch. Compare: Die Lampe steht auf dem Tisch."],
["Hätte ich mehr Zeit, würde ich öfter wandern gehen.","If I had more time, I would go hiking more often.",500,"B2","Outdoors","Unreal condition (Konjunktiv II). Dropping wenn puts the verb first: Hätte ich…"],
["Die Wohnung hat zwei Zimmer und einen Balkon.","The apartment has two rooms and a balcony.",600,"A1","Home","haben takes the accusative. Balkon is masculine: einen Balkon. Wohnung is feminine."],
["Ich hätte gern die Rechnung, bitte.","I’d like the bill, please.",600,"A2","Restaurant","hätte gern is a polite request. Rechnung is feminine: die Rechnung."],
["Obwohl ich müde war, habe ich weitergearbeitet.","Although I was tired, I kept working.",600,"B1","Work","obwohl sends the verb to the end. After the clause, the main clause verb comes first: habe ich."],
["Der Wald ist sehr ruhig.","The forest is very quiet.",700,"A1","Outdoors","Wald is masculine: der Wald. sehr + adjective = very."],
["Der Chef hat heute keine Zeit für das Meeting.","The boss has no time for the meeting today.",700,"A2","Work","für + accusative. Meeting is neuter: das Meeting."],
["Ich räume die Küche auf, bevor die Gäste kommen.","I tidy the kitchen before the guests arrive.",800,"B1","Home","aufräumen is separable. bevor sends the verb to the end. Küche is feminine: die Küche."],
["Kannst du bitte die Zwiebeln schneiden?","Can you please cut the onions?",800,"A2","Kitchen","Zwiebeln is plural, so die. The infinitive schneiden goes to the end with a modal verb."],
["Der Hund, den wir gestern gesehen haben, gehört meiner Nachbarin.","The dog we saw yesterday belongs to my neighbor.",800,"B1","Animals","den = masculine accusative relative pronoun (object of gesehen). gehören takes the dative: meiner Nachbarin."],
["Wir wandern am Wochenende in den Bergen.","We hike in the mountains on the weekend.",900,"A2","Outdoors","am = an dem. Dative plural adds -n: in den Bergen."],
["Das Pferd steht auf der Wiese.","The horse is standing in the meadow.",900,"A2","Animals","Germans say auf der Wiese. Wiese is feminine, dative: der. Pferd is neuter: das Pferd."],
["Die Besprechung wurde auf nächste Woche verschoben.","The meeting was postponed until next week.",900,"B2","Work","Passive: wurde + past participle. The doer is not mentioned."]
];
const G={
mod:"Modal verb: it takes the second slot and the main verb goes to the end as an infinitive.",
dat:"mit, bei, von, zu, nach, aus, seit always take the dative.",
acc:"Direct objects take the accusative. Only masculine changes: der → den, ein → einen.",
sep:"Separable verb: the prefix jumps to the end of the main clause.",
perf:"Perfekt: haben or sein + past participle, with the participle at the end.",
sub:"In a clause with weil, dass, wenn, obwohl, the conjugated verb goes to the end.",
v2:"Verb second: whatever comes first, the conjugated verb is the second element.",
q:"Questions: a question word comes first, or the verb leads in yes/no questions.",
neg:"kein negates nouns; nicht negates verbs, adjectives and everything else.",
wo:"Two-way prepositions: dative for location (wo?), accusative for movement (wohin?).",
refl:"Reflexive verb: the pronoun (mich, dich, sich…) belongs with the verb.",
imp:"Imperative: the verb comes first.",
ko2:"Konjunktiv II (hätte, wäre, würde) expresses polite or unreal wishes.",
rel:"Relative clause: the pronoun matches the noun’s gender, its case comes from its job in the clause, and the verb goes to the end.",
inf:"Infinitive with zu: zu stands right before the infinitive at the end of the clause.",
idm:"Fixed expression: feelings and impressions use the dative (mir, dir, ihm…).",
gen:"Learn every noun with its article: gender is rarely guessable.",
comp:"Comparison: adjective + -er, then als.",
sein:"sein and haben are irregular, so learn them as they are.",
time:"Times: um + clock time, am + day, im + month or season."};
const note=t=>t.split("+").every(x=>G[x])?t.split("+").map(x=>G[x]).join(" "):t;
const P=`
Ich heiße Anna.|My name is Anna.|100|A1|Daily|v2
Wie geht es dir?|How are you?|100|A1|Daily|q
Mir geht es gut, danke.|I’m fine, thank you.|200|A1|Daily|idm
Ich komme aus Tunesien.|I come from Tunisia.|200|A1|Daily|dat
Ich spreche ein bisschen Deutsch.|I speak a little German.|300|A1|Daily|acc
Sprichst du Englisch?|Do you speak English?|300|A1|Daily|q
Ich verstehe das nicht.|I don’t understand that.|200|A1|Daily|neg
Kannst du das bitte wiederholen?|Can you repeat that, please?|400|A1|Daily|mod
Was bedeutet das?|What does that mean?|300|A1|Daily|q
Ich brauche Hilfe.|I need help.|200|A1|Daily|acc
Entschuldigung, wo ist die Toilette?|Excuse me, where is the restroom?|500|A1|Daily|q
Wie viel kostet das?|How much does that cost?|300|A1|Daily|q
Ich nehme das.|I’ll take that.|200|A1|Daily|acc
Es ist schon spät.|It’s already late.|200|A1|Daily|v2
Wie spät ist es?|What time is it?|200|A1|Daily|q
Ich habe Hunger.|I’m hungry.|300|A1|Daily|sein
Ich habe Durst.|I’m thirsty.|400|A1|Daily|sein
Mir ist kalt.|I’m cold.|300|A1|Daily|idm
Ich bin müde.|I’m tired.|200|A1|Daily|sein
Das gefällt mir.|I like that.|300|A2|Daily|idm
Es tut mir leid.|I’m sorry.|300|A1|Daily|idm
Hast du morgen Zeit?|Do you have time tomorrow?|200|A1|Daily|q
Ich rufe dich später an.|I’ll call you later.|400|A2|Daily|sep
Ich warte seit einer Stunde.|I’ve been waiting for an hour.|500|A2|Daily|dat
Wir haben uns lange nicht gesehen.|We haven’t seen each other for a long time.|400|A2|Daily|refl+perf
Ich denke oft an meine Familie.|I often think about my family.|300|A2|Daily|denken an takes the accusative: an meine Familie.
Ich glaube, dass er recht hat.|I think he’s right.|300|B1|Daily|sub
Ich möchte wissen, wann der Zug kommt.|I’d like to know when the train is coming.|400|B1|Daily|sub
Weil ich krank bin, bleibe ich heute im Bett.|Because I’m sick, I’m staying in bed today.|500|A2|Daily|sub
Ich habe vergessen, dir zu schreiben.|I forgot to write to you.|500|B1|Daily|inf
Es ist wichtig, pünktlich zu sein.|It’s important to be on time.|700|B1|Daily|inf
Ich würde gern nach Deutschland reisen.|I would like to travel to Germany.|500|B1|Daily|ko2
Wenn ich Zeit hätte, würde ich mehr lesen.|If I had time, I would read more.|400|B2|Daily|ko2+sub
Das Buch, das ich gelesen habe, war sehr gut.|The book I read was very good.|500|B1|Daily|rel
Ich arbeite als Lehrer.|I work as a teacher.|800|A2|Work|v2
Ich habe heute viel zu tun.|I have a lot to do today.|300|A2|Work|inf
Wann beginnt die Arbeit?|When does work start?|300|A1|Work|q
Die Arbeit beginnt um acht Uhr.|Work starts at eight o’clock.|300|A1|Work|time
Ich habe einen Termin um zehn Uhr.|I have an appointment at ten o’clock.|500|A1|Work|acc+time
Können wir den Termin verschieben?|Can we postpone the appointment?|900|A2|Work|mod
Ich schicke Ihnen die E-Mail heute noch.|I’ll send you the email today.|500|A2|Work|Ihnen is dative (to whom?), die E-Mail is accusative (what?). The dative object comes first.
Haben Sie meine Nachricht bekommen?|Did you get my message?|400|A2|Work|perf
Ich bin im Moment in einer Besprechung.|I’m in a meeting right now.|500|A2|Work|wo
Mein Kollege ist heute krank.|My colleague is sick today.|700|A1|Work|v2
Wir müssen das Projekt bis Freitag abschließen.|We have to finish the project by Friday.|700|B1|Work|mod+sep
Ich bewerbe mich um eine Stelle.|I’m applying for a job.|800|B1|Work|refl
Das Gehalt ist nicht schlecht.|The salary isn’t bad.|900|A2|Work|neg
Ich arbeite von zu Hause aus.|I work from home.|300|A2|Work|dat
Mein Chef ist sehr freundlich.|My boss is very friendly.|700|A1|Work|sein
Wir haben morgen eine Konferenz.|We have a conference tomorrow.|900|A2|Work|acc
Der Kunde wartet schon seit zehn Minuten.|The customer has been waiting for ten minutes already.|600|A2|Work|dat
Ich habe die Rechnung noch nicht bezahlt.|I haven’t paid the invoice yet.|600|A2|Work|perf
Wir sollten das morgen besprechen.|We should discuss that tomorrow.|500|B1|Work|mod
Ich kümmere mich um die Kunden.|I take care of the customers.|900|B1|Work|refl
Nachdem wir gegessen hatten, sind wir zur Arbeit gegangen.|After we had eaten, we went to work.|500|B2|Work|Plusquamperfekt: hatten + participle for what happened first, then Perfekt for what came next.
Ich wohne in einer kleinen Wohnung.|I live in a small apartment.|300|A1|Home|wo
Das Schlafzimmer ist im ersten Stock.|The bedroom is on the first floor.|700|A2|Home|wo
Das Badezimmer ist neben der Küche.|The bathroom is next to the kitchen.|700|A2|Home|wo
Die Tür ist geschlossen.|The door is closed.|300|A1|Home|gen
Bitte mach das Licht an.|Please turn on the light.|300|A1|Home|imp+sep
Ich muss die Wäsche waschen.|I have to do the laundry.|900|A2|Home|mod
Der Schlüssel liegt auf dem Tisch.|The key is on the table.|500|A1|Home|wo
Wir haben ein neues Sofa gekauft.|We bought a new sofa.|700|A2|Home|perf
Das Wohnzimmer ist groß und hell.|The living room is big and bright.|600|A1|Home|gen
Ich putze jeden Samstag das Bad.|I clean the bathroom every Saturday.|700|A2|Home|acc
Kannst du den Müll rausbringen?|Can you take out the trash?|900|A2|Home|mod+sep
Ich suche meinen Schlüssel.|I’m looking for my key.|500|A1|Home|acc
Das Bett steht an der Wand.|The bed stands against the wall.|400|A2|Home|wo
Wir ziehen nächsten Monat um.|We’re moving next month.|500|A2|Home|sep
Die Miete ist zu hoch.|The rent is too high.|600|A2|Home|gen
Ich hänge das Bild an die Wand.|I’m hanging the picture on the wall.|400|B1|Home|wo
Das Bild hängt an der Wand.|The picture is hanging on the wall.|400|A2|Home|wo
Ich lege das Buch auf den Tisch.|I’m putting the book on the table.|500|A2|Home|wo
Heute scheint die Sonne.|The sun is shining today.|400|A1|Outdoors|v2
Es ist kalt und es regnet.|It’s cold and it’s raining.|300|A1|Outdoors|v2
Wir gehen im Park spazieren.|We’re going for a walk in the park.|600|A1|Outdoors|wo
Der Fluss ist sehr tief.|The river is very deep.|600|A2|Outdoors|gen
Ich möchte auf den Berg steigen.|I’d like to climb the mountain.|600|A2|Outdoors|wo+mod
Die Sonne geht um sechs Uhr unter.|The sun sets at six o’clock.|400|A2|Outdoors|sep+time
Wir sind am Strand gewesen.|We were at the beach.|800|A2|Outdoors|perf
Ich fahre gern mit dem Fahrrad.|I like riding my bike.|600|A1|Outdoors|dat
Hast du eine Jacke dabei?|Did you bring a jacket?|700|A2|Outdoors|q
Der See ist im Sommer warm.|The lake is warm in summer.|700|A1|Outdoors|time
Im Winter schneit es oft.|It often snows in winter.|500|A1|Outdoors|time
Wir machen ein Picknick am Fluss.|We’re having a picnic by the river.|900|A2|Outdoors|wo
Der Weg führt durch den Wald.|The path leads through the forest.|500|B1|Outdoors|durch always takes the accusative.
Wir sind den ganzen Tag gewandert.|We hiked all day.|700|A2|Outdoors|perf
Bei schönem Wetter gehen wir raus.|When the weather is nice, we go outside.|400|A2|Outdoors|dat
Die Luft ist hier sehr sauber.|The air is very clean here.|500|A2|Outdoors|gen
Einen Tisch für vier Personen, bitte.|A table for four people, please.|400|A1|Restaurant|acc
Was empfehlen Sie?|What do you recommend?|500|A2|Restaurant|q
Ich nehme die Suppe und einen Salat.|I’ll have the soup and a salad.|700|A1|Restaurant|acc
Ich bin Vegetarier.|I’m vegetarian.|1000|A2|Restaurant|sein
Ist das Essen scharf?|Is the food spicy?|700|A1|Restaurant|q
Wir möchten zahlen, bitte.|We’d like to pay, please.|400|A1|Restaurant|mod
Zusammen oder getrennt?|Together or separately?|500|A1|Restaurant|q
Das Fleisch ist sehr lecker.|The meat is very tasty.|600|A1|Restaurant|gen
Ich trinke einen Kaffee mit Milch.|I’m drinking a coffee with milk.|500|A1|Restaurant|dat+acc
Haben Sie auch etwas ohne Fleisch?|Do you also have something without meat?|600|A2|Restaurant|ohne always takes the accusative.
Die Speisekarte, bitte.|The menu, please.|900|A1|Restaurant|gen
Das Frühstück ist von sieben bis zehn Uhr.|Breakfast is from seven to ten o’clock.|600|A2|Restaurant|dat
Es hat sehr gut geschmeckt.|It tasted very good.|400|A2|Restaurant|perf
Ich bestelle noch ein Bier.|I’m ordering another beer.|800|A1|Restaurant|acc
Ich brauche ein Messer und ein Brett.|I need a knife and a board.|900|A1|Kitchen|acc
Schneide die Tomaten in kleine Stücke.|Cut the tomatoes into small pieces.|700|A2|Kitchen|imp
Die Pfanne ist noch heiß.|The pan is still hot.|1000|A2|Kitchen|gen
Gib bitte etwas Salz in die Suppe.|Please add some salt to the soup.|600|A2|Kitchen|wo
Der Kuchen muss eine Stunde backen.|The cake has to bake for an hour.|800|A2|Kitchen|mod
Ich koche gern italienisch.|I like cooking Italian food.|600|A2|Kitchen|gern after the verb means “like doing it”.
Wir haben kein Brot mehr.|We have no bread left.|400|A1|Kitchen|neg
Ist noch Milch im Kühlschrank?|Is there still milk in the fridge?|900|A2|Kitchen|wo
Die Eier sind im Kühlschrank.|The eggs are in the fridge.|700|A1|Kitchen|wo
Rühr die Soße um.|Stir the sauce.|900|A2|Kitchen|imp+sep
Das Rezept ist ganz einfach.|The recipe is really simple.|900|A2|Kitchen|gen
Ich schäle die Kartoffeln.|I’m peeling the potatoes.|1000|A2|Kitchen|acc
Der Teller steht im Schrank.|The plate is in the cupboard.|900|A1|Kitchen|wo
Wie lange muss das kochen?|How long does that have to cook?|500|A2|Kitchen|q+mod
Ich habe zwei Katzen.|I have two cats.|500|A1|Animals|acc
Der Vogel singt jeden Morgen.|The bird sings every morning.|600|A1|Animals|acc
Die Kuh steht auf der Weide.|The cow is standing in the pasture.|1000|A2|Animals|wo
Mein Hund bellt nachts.|My dog barks at night.|800|A1|Animals|v2
Der Fisch schwimmt im Wasser.|The fish swims in the water.|500|A1|Animals|wo
Hast du Angst vor Hunden?|Are you afraid of dogs?|500|A2|Animals|Angst haben vor takes the dative, and the dative plural adds -n: vor Hunden.
Die Katze fängt eine Maus.|The cat catches a mouse.|700|A2|Animals|acc
Wir füttern die Tiere jeden Tag.|We feed the animals every day.|700|A2|Animals|acc
Das Pferd läuft sehr schnell.|The horse runs very fast.|900|A1|Animals|gen
Im Zoo gibt es viele Tiere.|There are many animals at the zoo.|800|A2|Animals|es gibt takes the accusative (here a plural).
Ich gehe mit der Katze zum Tierarzt.|I’m taking the cat to the vet.|900|A2|Animals|zum = zu dem. zu and mit take the dative.
Der Hund ist größer als die Katze.|The dog is bigger than the cat.|500|A2|Animals|comp
Die Vögel fliegen nach Süden.|The birds fly south.|600|A2|Animals|v2
Ich lerne seit einem Jahr Deutsch.|I’ve been learning German for a year.|400|A2|Daily|dat
Kannst du langsamer sprechen?|Can you speak more slowly?|400|A1|Daily|mod+comp
Ich habe eine Frage.|I have a question.|200|A1|Daily|acc
Das ist eine gute Idee.|That’s a good idea.|300|A1|Daily|gen
Ich weiß es nicht.|I don’t know.|200|A1|Daily|neg
Ich kenne ihn schon lange.|I’ve known him for a long time.|300|A2|Daily|Use kennen for people and places, wissen for facts. ihn is the accusative of er.
Wo wohnst du?|Where do you live?|200|A1|Daily|q
Was machst du am Wochenende?|What are you doing at the weekend?|300|A1|Daily|q+time
Ich stehe um sieben Uhr auf.|I get up at seven o’clock.|300|A1|Daily|sep+time
Ich gehe nach der Arbeit einkaufen.|I go shopping after work.|300|A2|Daily|nach takes the dative: nach der Arbeit.
Hast du Lust, ins Kino zu gehen?|Do you feel like going to the cinema?|400|B1|Daily|inf
Ich habe mich verlaufen.|I got lost.|500|B1|Daily|refl+perf
Es freut mich, dich kennenzulernen.|Nice to meet you.|400|A2|Daily|inf
Ich bin mit dem Bus gekommen.|I came by bus.|400|A2|Daily|perf+dat
Das war ein langer Tag.|That was a long day.|300|A1|Daily|sein
Gestern war ich im Kino.|Yesterday I was at the cinema.|400|A2|Daily|v2+wo
Ich hatte keine Ahnung.|I had no idea.|600|A2|Daily|neg
Morgen fahre ich nach München.|Tomorrow I’m going to Munich.|300|A1|Daily|v2
Ich bin schon einmal dort gewesen.|I’ve been there once before.|300|A2|Daily|perf
Entschuldigung, ich habe Sie nicht verstanden.|Sorry, I didn’t understand you.|400|A2|Daily|perf+neg
Er hat gesagt, dass er später kommt.|He said that he’s coming later.|300|B1|Daily|sub
Ich habe keine Lust mehr.|I don’t feel like it anymore.|400|A2|Daily|neg
Wenn du willst, können wir zusammen essen.|If you like, we can eat together.|300|A2|Daily|sub+mod
Seit ich hier wohne, bin ich glücklicher.|Since I’ve lived here, I’ve been happier.|400|B1|Daily|sub+comp
Je mehr ich übe, desto besser verstehe ich.|The more I practice, the better I understand.|500|B2|Daily|je … desto takes a comparative in both parts. je sends the verb to the end of its clause.
Ich habe mich an das Wetter gewöhnt.|I’ve gotten used to the weather.|600|B2|Daily|sich gewöhnen an takes the accusative: an das Wetter. The Perfekt uses haben.
Man sollte jeden Tag ein bisschen üben.|You should practice a little every day.|400|B1|Daily|man means “one” or “you” in general. It takes the same verb form as er.
Es kommt darauf an, was du willst.|It depends on what you want.|500|B2|Daily|es kommt darauf an is followed by a clause, and the verb goes to the end of that clause.
Ich bin froh, dass du da bist.|I’m glad you’re here.|400|B1|Daily|sub
Ich schreibe eine E-Mail an meinen Chef.|I’m writing an email to my boss.|500|A2|Work|schreiben an takes the accusative: an meinen Chef.
Wir haben heute eine Besprechung um drei Uhr.|We have a meeting today at three o’clock.|500|A1|Work|time
Ich muss noch viele Briefe schreiben.|I still have to write a lot of letters.|400|A2|Work|mod
Können Sie mir bitte helfen?|Could you please help me?|300|A1|Work|helfen takes the dative: mir. After a modal verb the infinitive goes to the end.
Wann haben Sie Zeit für ein Gespräch?|When do you have time for a conversation?|500|A2|Work|q
Der Vertrag ist noch nicht unterschrieben.|The contract hasn’t been signed yet.|900|B1|Work|sein + participle describes a result (the contract is in a signed state), not the action.
Ich habe eine neue Stelle gefunden.|I found a new job.|500|A2|Work|perf
Die Firma sucht neue Mitarbeiter.|The company is looking for new employees.|600|A2|Work|acc
Ich verdiene nicht viel.|I don’t earn much.|700|A2|Work|neg
Wir müssen früher anfangen.|We have to start earlier.|500|A2|Work|mod+comp
Das Meeting wurde abgesagt.|The meeting was cancelled.|900|B2|Work|Passive: wurde + past participle. Written German prefers wurde to ist worden.
Ich arbeite nur halbtags.|I only work part-time.|700|A2|Work|v2
Der Computer funktioniert nicht.|The computer isn’t working.|700|A2|Work|neg
Hast du die Datei schon geschickt?|Have you already sent the file?|700|A2|Work|perf+q
Ich war gestern wegen eines Termins beim Arzt.|I was at the doctor’s yesterday because of an appointment.|600|B1|Work|wegen takes the genitive: eines Termins (note the -s). In speech many people use the dative.
Entschuldigung für die Verspätung.|Sorry for the delay.|800|A2|Work|für always takes the accusative.
Ich hoffe, dass wir bald eine Lösung finden.|I hope we find a solution soon.|600|B1|Work|sub
Wir wohnen im dritten Stock.|We live on the third floor.|700|A2|Home|wo
Die Wohnung ist hell und ruhig.|The apartment is bright and quiet.|600|A1|Home|gen
Ich möchte ein Zimmer mieten.|I would like to rent a room.|700|A2|Home|mod
Stell die Tasche bitte auf den Stuhl.|Please put the bag on the chair.|500|A2|Home|wo+imp
Die Tasche steht auf dem Stuhl.|The bag is on the chair.|500|A2|Home|wo
Kannst du das Fenster aufmachen?|Can you open the window?|400|A1|Home|mod+sep
Meine Nachbarn sind sehr nett.|My neighbors are very nice.|800|A1|Home|sein
Es gibt keinen Aufzug.|There’s no elevator.|900|A2|Home|es gibt takes the accusative, so kein becomes keinen for masculine Aufzug.
Ich schlafe auf dem Sofa.|I’m sleeping on the sofa.|700|A1|Home|wo
Die Heizung ist kaputt.|The heating is broken.|800|A2|Home|gen
Ich muss die Miete bis Montag überweisen.|I have to transfer the rent by Monday.|900|B1|Home|mod
Seit wann wohnst du hier?|Since when have you lived here?|400|A2|Home|German uses the present tense with seit for something that still continues.
Wir haben das Bad renoviert.|We renovated the bathroom.|900|B1|Home|perf
Das Wetter ist heute schön.|The weather is nice today.|400|A1|Outdoors|v2
Es wird bald dunkel.|It’s getting dark soon.|400|A2|Outdoors|werden + adjective means to become or get: es wird dunkel.
Der Himmel ist bewölkt.|The sky is cloudy.|700|A2|Outdoors|gen
Wir sind gestern auf den Berg gestiegen.|We climbed the mountain yesterday.|600|B1|Outdoors|perf+wo
Hast du Lust, am Fluss spazieren zu gehen?|Do you feel like going for a walk by the river?|600|B1|Outdoors|inf
Im Sommer fahren wir ans Meer.|In summer we go to the sea.|500|A2|Outdoors|ans = an das. Movement toward a place takes the accusative.
Die Blumen blühen im Frühling.|The flowers bloom in spring.|900|A2|Outdoors|time
Der Wind ist heute sehr stark.|The wind is very strong today.|500|A2|Outdoors|gen
Es hat die ganze Nacht geregnet.|It rained all night.|500|A2|Outdoors|perf
Nimm einen Schirm mit, es könnte regnen.|Take an umbrella, it might rain.|900|B1|Outdoors|imp+sep+ko2
Bevor wir losgehen, ziehe ich eine Jacke an.|Before we set off, I’ll put on a jacket.|600|B1|Outdoors|sub+sep
Was möchten Sie trinken?|What would you like to drink?|400|A1|Restaurant|mod+q
Ich hätte gern ein Glas Wasser.|I’d like a glass of water.|600|A1|Restaurant|ko2
Das schmeckt wirklich gut.|That tastes really good.|500|A1|Restaurant|v2
Ist dieser Platz noch frei?|Is this seat still free?|500|A1|Restaurant|q
Ich bin allergisch gegen Nüsse.|I’m allergic to nuts.|800|B1|Restaurant|allergisch gegen takes the accusative, and gegen always does.
Können wir bitte getrennt bezahlen?|Can we pay separately, please?|500|A2|Restaurant|mod
Zum Nachtisch nehme ich ein Eis.|For dessert I’ll have an ice cream.|900|A2|Restaurant|zum = zu dem. zu always takes the dative.
Das Essen war leider kalt.|Unfortunately the food was cold.|400|A2|Restaurant|war is the Präteritum of sein. It is common in speech for sein and haben.
Ich habe eine Reservierung auf den Namen Müller.|I have a reservation under the name Müller.|700|A2|Restaurant|acc
Die Bedienung ist sehr aufmerksam.|The service is very attentive.|900|B1|Restaurant|gen
Ich koche heute Abend Nudeln mit Tomatensoße.|I’m cooking pasta with tomato sauce tonight.|900|A2|Kitchen|dat+acc
Erhitze das Öl in der Pfanne.|Heat the oil in the pan.|900|A2|Kitchen|imp+wo
Gib die Zwiebeln dazu.|Add the onions.|800|A2|Kitchen|imp
Der Reis braucht zwanzig Minuten.|The rice needs twenty minutes.|1000|A2|Kitchen|acc
Hast du Salz und Pfeffer?|Do you have salt and pepper?|900|A1|Kitchen|q
Ich backe einen Apfelkuchen.|I’m baking an apple cake.|900|A2|Kitchen|acc
Die Suppe ist zu salzig.|The soup is too salty.|700|A2|Kitchen|gen
Nimm zwei Eier und etwas Mehl.|Take two eggs and some flour.|700|A2|Kitchen|imp
Das Wasser muss erst kochen.|The water has to boil first.|300|A2|Kitchen|mod
Stell den Ofen auf zweihundert Grad.|Set the oven to two hundred degrees.|900|B1|Kitchen|imp+acc
Wir haben einen Hund und zwei Katzen.|We have a dog and two cats.|500|A1|Animals|acc
Der Hund spielt im Garten.|The dog is playing in the garden.|500|A1|Animals|wo
Die Katze schläft den ganzen Tag.|The cat sleeps all day.|500|A1|Animals|acc
Hast du ein Haustier?|Do you have a pet?|800|A1|Animals|q
Der Hund muss dreimal am Tag raus.|The dog has to go out three times a day.|500|A2|Animals|mod
Die Schafe stehen auf der Wiese.|The sheep are standing in the meadow.|900|A2|Animals|wo
Vögel bauen ihre Nester im Frühling.|Birds build their nests in spring.|700|B1|Animals|ihre is a possessive that agrees with the plural noun Nester (accusative plural).
Der Tierarzt hat den Hund untersucht.|The vet examined the dog.|900|B1|Animals|perf
Ich habe Angst vor Spinnen.|I’m afraid of spiders.|700|A2|Animals|Angst haben vor takes the dative, and the dative plural adds -n: vor Spinnen.
Die Katze, die auf dem Sofa schläft, gehört mir.|The cat sleeping on the sofa is mine.|600|B1|Animals|rel
`.trim().split("\n").map(l=>{const a=l.split("|");return[a[0],a[1],+a[2],a[3],a[4],note(a[5])]});
const S=OLD.concat(P);
