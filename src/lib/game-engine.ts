import { shuffleArray } from './utils'
import type { Category, GameMode, QuestionData } from '@/types'

interface CuratedEntry {
  title: string
  clue: string
}

const MOVIES: CuratedEntry[] = [
  { title: 'Avatar', clue: 'A paraplegic marine travels to an alien world and falls in love with a native warrior, leading him to fight against his own kind to protect her people.' },
  { title: 'Avatar: The Way of Water', clue: 'A former human-turned-Na\'vi defends his family and new home from a familiar enemy who returns to Pandora seeking vengeance.' },
  { title: 'Titanic', clue: 'A wealthy young woman falls for a penniless artist aboard a doomed ocean liner on its maiden voyage across the Atlantic.' },
  { title: 'Avengers: Endgame', clue: 'Earth mightiest heroes must undo the devastation caused by a cosmic tyrant who wiped out half of all life in the universe.' },
  { title: 'Avengers: Infinity War', clue: 'A powerful alien collects magical stones to reshape the universe, forcing a team of heroes from across the galaxy to stand against him.' },
  { title: 'Joker', clue: 'A failed stand-up comedian ignored by society slowly descends into madness and becomes a symbol of chaos in Gotham City.' },
  { title: 'Interstellar', clue: 'A former pilot and his team travel through a wormhole near Saturn to find a new habitable planet for humanity facing extinction.' },
  { title: 'Inception', clue: 'A thief who steals corporate secrets by entering peoples dreams is offered a chance to erase his criminal record by planting an idea.' },
  { title: 'The Intouchables', clue: 'A wealthy quadriplegic hires a young man from the projects as his caregiver, leading to an unlikely friendship that changes both their lives.' },
  { title: 'Oppenheimer', clue: 'A brilliant physicist leads the secret development of the atomic bomb during World War II, only to grapple with the moral weight of his creation.' },
  { title: 'Spider-Man: No Way Home', clue: 'A teenage superhero asks a sorcerer to make his secret identity unknown again, but the spell goes wrong and brings villains from other dimensions.' },
  { title: 'Gladiator', clue: 'A betrayed Roman general is sold into slavery and rises through the ranks of the arena to seek vengeance against the corrupt emperor who murdered his family.' },
  { title: 'Pulp Fiction', clue: 'The lives of two hitmen, a gangsters wife, a boxer, and a pair of diner robbers intertwine in a series of darkly comic stories in Los Angeles.' },
  { title: 'Fight Club', clue: 'A depressed office worker and a charismatic soap salesman start an underground fight club that evolves into something much more dangerous.' },
  { title: 'The Matrix', clue: 'A computer programmer discovers that the world he lives in is a simulated reality created by intelligent machines to control humanity.' },
  { title: 'The Lord of the Rings: The Fellowship of the Ring', clue: 'A humble hobbit sets out on a perilous journey to destroy a powerful ring before the dark lord who created it can reclaim it.' },
  { title: 'The Lord of the Rings: The Two Towers', clue: 'As the dark lords army grows, the scattered fellowship must unite to defend the kingdom of Rohan while the hobbits continue toward Mordor.' },
  { title: 'The Lord of the Rings: The Return of the King', clue: 'The final battle for Middle-earth begins as the armies of good make their last stand against the dark lords forces while a hobbit completes his quest.' },
  { title: 'Harry Potter and the Philosophers Stone', clue: 'An orphaned boy discovers he is a wizard on his eleventh birthday and begins his education at a magical school where dark forces are stirring.' },
  { title: 'Harry Potter and the Deathly Hallows: Part 2', clue: 'The final confrontation between the boy wizard and the dark lord who killed his parents takes place at the magical school that was once his home.' },
  { title: 'The Shawshank Redemption', clue: 'A banker wrongly convicted of murder forms an unlikely friendship during decades of imprisonment and never gives up hope of freedom.' },
  { title: 'The Green Mile', clue: 'A death row prison guard discovers that one of his inmates possesses a mysterious healing power and must decide what is truly just.' },
  { title: 'Forrest Gump', clue: 'A simple man with a kind heart accidentally influences major historical events while pursuing his lifelong dream of reuniting with his childhood sweetheart.' },
  { title: 'Léon: The Professional', clue: 'A professional hitman reluctantly takes in a young girl whose family was murdered by corrupt DEA agents and teaches her his deadly craft.' },
  { title: 'Terminator 2: Judgment Day', clue: 'A reprogrammed cyborg is sent back in time to protect a young boy from a more advanced liquid-metal assassin sent to kill him.' },
  { title: 'The Fifth Element', clue: 'A futuristic taxi driver must protect the embodiment of the fifth element, a perfect woman, who is the key to saving Earth from an ancient evil.' },
  { title: 'Se7en', clue: 'Two detectives hunt a serial killer who uses the seven deadly sins as the theme for his gruesome murders in a rain-soaked city.' },
  { title: 'Shutter Island', clue: 'A US Marshal investigates the disappearance of a patient from a hospital for the criminally insane on a remote island, but nothing is what it seems.' },
  { title: 'The Wolf of Wall Street', clue: 'The true story of a stockbroker who builds a massive fortune through fraud and excess, living a life of drugs, sex, and crime before it all collapses.' },
  { title: 'The Gentlemen', clue: 'An American expat who built a highly profitable marijuana empire in London plots his exit from the business but rival gangsters have other plans.' },
  { title: 'The Grand Budapest Hotel', clue: 'The adventures of a legendary hotel concierge and his young protégé in a famous European ski resort between the two world wars.' },
  { title: 'Dune', clue: 'A young nobleman travels to the most dangerous planet in the universe to protect his family and the most valuable substance known to humanity.' },
  { title: 'Dune: Part Two', clue: 'A young messiah now leads a rebellion across the desert planet, seeking vengeance against those who destroyed his family while fulfilling an ancient prophecy.' },
  { title: 'Barbie', clue: 'The iconic doll leaves her perfect pink world for the real one and discovers that being human is both messy and wonderful.' },
  { title: 'Anora', clue: 'A young sex worker from Brooklyn marries the son of a Russian oligarch, but when his parents learn of the union, they send thugs to annul it.' },
  { title: 'The Substance', clue: 'An aging Hollywood star uses a mysterious black-market drug that creates a younger, more beautiful version of herself with terrifying side effects.' },
  { title: 'Furious 7', clue: 'A crew of street racers turned international criminals faces a vengeful assassin while trying to protect a sophisticated tracking device from falling into wrong hands.' },
  { title: 'Pirates of the Caribbean: The Curse of the Black Pearl', clue: 'A charming blacksmith and an eccentric pirate captain team up to rescue a kidnapped governor daughter from a crew of undead pirates cursed by Aztec gold.' },
  { title: 'John Wick', clue: 'A retired hitman returns to the criminal underworld to seek vengeance against the men who killed his dog and stole his car.' },
  { title: 'Wrath of Man', clue: 'A mysterious new security guard at a cash truck company reveals his true identity and deadly purpose after a heist goes wrong.' },
  { title: 'Nobody', clue: 'A seemingly ordinary suburban father lets loose his hidden lethal skills when two thieves break into his home and threaten his family.' },
  { title: 'It', clue: 'A group of bullied kids in a small town band together to defeat a shape-shifting evil entity that feeds on their fears and haunts the sewers.' },
  { title: 'A Quiet Place', clue: 'A family must live in complete silence to avoid blind monsters with hypersensitive hearing that hunt by sound.' },
  { title: 'Insidious', clue: 'A young boy enters a comatose state after a fall, and his parents discover that malevolent spirits from another realm are trying to possess his body.' },
  { title: 'The Conjuring', clue: 'A family moves into a farmhouse and experiences increasingly terrifying paranormal activity, forcing them to call demonologists for help.' },
  { title: 'Saw', clue: 'Two men wake up chained in a dilapidated bathroom with a dead body between them and must play a deadly game to survive.' },
  { title: 'The Godfather', clue: 'The aging patriarch of a powerful mafia dynasty must choose a successor among his sons as their criminal empire faces new challenges.' },
  { title: 'Schindlers List', clue: 'A German businessman saves the lives of over a thousand Jewish refugees during the Holocaust by employing them in his factories.' },
  { title: 'The Silence of the Lambs', clue: 'An FBI trainee must seek the help of a brilliant cannibalistic serial killer to catch another murderer who skins his victims.' },
  { title: 'Knockin on Heavens Door', clue: 'Two terminally ill men escape from a hospital and embark on a wild road trip to see the ocean for the first and last time.' },
]

const SERIES: CuratedEntry[] = [
  { title: 'Squid Game', clue: 'Hundreds of cash-strapped players compete in deadly childhood games for a massive prize, but losing means death in this brutal survival drama.' },
  { title: 'Stranger Things', clue: 'A group of kids in 1980s Indiana uncover supernatural mysteries involving a missing boy, a psychic girl, and a dangerous alternate dimension.' },
  { title: 'The Walking Dead', clue: 'A group of survivors navigate a post-apocalyptic world overrun by flesh-eating zombies while facing threats from other desperate humans.' },
  { title: 'The Witcher', clue: 'A mutated monster hunter for hire struggles to find his place in a dark fantasy world where humans are often more wicked than the beasts.' },
  { title: 'Wednesday', clue: 'A psychic teenage girl with a gothic attitude enrolls at a peculiar school for outcasts and investigates a murder mystery involving her family.' },
  { title: 'The White Lotus', clue: 'The lives of wealthy vacationers and the hotel staff who cater to them collide in increasingly dark and unexpected ways at a tropical resort.' },
  { title: 'The Last of Us', clue: 'A hardened smuggler must escort a teenage girl who is immune to a fungal pandemic across a post-apocalyptic America to save humanity.' },
  { title: 'Black Mirror', clue: 'Each standalone episode explores a dystopian near-future where advanced technology has unexpected and often terrifying consequences on human behavior.' },
  { title: 'Game of Thrones', clue: 'Noble families wage war for control of the Iron Throne while an ancient enemy with ice powers threatens to destroy all of humanity from beyond a massive wall.' },
  { title: 'Breaking Bad', clue: 'A terminally ill high school chemistry teacher turns to cooking and selling methamphetamine to secure his family future, becoming a feared drug lord.' },
  { title: 'Better Call Saul', clue: 'A small-time lawyer with good intentions gradually transforms into a morally flexible criminal attorney in the years before he meets his infamous client.' },
  { title: 'House M.D.', clue: 'A brilliant but misanthropic diagnostician leads a team of doctors to solve rare medical mysteries while battling his own addiction and personal demons.' },
  { title: 'Sherlock', clue: 'A modern-day update of the legendary detective and his army doctor partner who solve impossible crimes in contemporary London.' },
  { title: 'Supernatural', clue: 'Two brothers hunt demons, ghosts, and monsters across America while trying to save people and hunt things, following their father footsteps.' },
  { title: 'The X-Files', clue: 'An FBI agent who believes in aliens and paranormal phenomena is paired with a skeptical scientific partner to investigate unsolved cases.' },
  { title: 'The Big Bang Theory', clue: 'A group of socially awkward genius scientists and their interactions with the world, especially with their attractive neighbor across the hall.' },
  { title: 'Friends', clue: 'Six close friends in their twenties and thirties navigate careers, relationships, and life in New York City while always being there for each other.' },
  { title: 'The Office', clue: 'A mockumentary about the employees of a paper company where the well-meaning but clueless regional manager constantly creates awkward situations.' },
  { title: 'How I Met Your Mother', clue: 'A father tells his children the long and complicated story of how he met their mother, involving many adventures with his four best friends.' },
  { title: 'Euphoria', clue: 'A group of high school students navigate drugs, sex, trauma, and identity as they struggle to find their place in a hyper-connected yet isolating world.' },
  { title: 'House of Cards', clue: 'A ruthless and manipulative politician and his equally ambitious wife stop at nothing to climb the ranks of power in Washington D.C.' },
  { title: 'Narcos', clue: 'The true story of the rise and fall of the most powerful drug cartels in Colombia and the DEA agents who risk everything to bring them down.' },
  { title: 'Ozark', clue: 'A financial advisor moves his family from Chicago to the Missouri Ozarks after a money-laundering scheme goes wrong, and he must repay a drug cartel.' },
  { title: 'Billions', clue: 'A cunning US Attorney engages in a high-stakes cat-and-mouse game with a brilliant hedge fund manager as they battle over money power and justice.' },
  { title: 'Fargo', clue: 'Each season tells a new darkly comedic crime story set in the snowy Midwest involving ordinary people caught up in extraordinary violent situations.' },
  { title: 'American Horror Story', clue: 'Each season of this anthology horror series takes place in a different terrifying setting, from a haunted house to an asylum to a cult.' },
  { title: 'Homeland', clue: 'A brilliant but unstable CIA officer suspects a decorated war hero of being involved in a terrorist plot against the United States.' },
  { title: 'The Sopranos', clue: 'A New Jersey mafia boss struggles to balance the demands of his criminal organization with the needs of his dysfunctional family while seeing a therapist.' },
  { title: 'The Wire', clue: 'A gripping exploration of the drug trade in Baltimore from multiple perspectives: dealers, police, politicians, dock workers, and the media.' },
  { title: 'Twin Peaks', clue: 'An eccentric FBI agent travels to a small logging town to investigate the murder of a homecoming queen, uncovering dark secrets beneath the surface.' },
  { title: 'The Mandalorian', clue: 'A lone bounty hunter in the outer reaches of the galaxy is hired to retrieve a mysterious child and instead becomes its protector.' },
  { title: 'Loki', clue: 'The god of mischief is captured after escaping with the Tesseract and forced to help a time-bending agency fix the timeline he broke.' },
  { title: 'The Falcon and the Winter Soldier', clue: 'A man with wings and a man with a metal arm team up to face a new threat after their friend Captain America retired.' },
  { title: 'Dexter', clue: 'A blood-splatter analyst for the Miami police department lives a double life as a serial killer who only murders other killers who escaped justice.' },
  { title: 'Firefly', clue: 'The crew of a small smuggling spaceship in the distant future takes on jobs legal and illegal while trying to stay one step ahead of a totalitarian alliance.' },
  { title: 'Doctor Who', clue: 'A time-traveling alien with two hearts travels through time and space in his blue police box, saving civilizations and exploring the universe.' },
  { title: 'Misfits', clue: 'A group of young offenders doing community service are struck by a strange storm and develop supernatural powers that complicate their already chaotic lives.' },
  { title: 'Killing Eve', clue: 'A bored British intelligence officer becomes obsessed with capturing a brilliant and psychopathic assassin, leading to a dangerous mutual fascination.' },
  { title: 'The Fall', clue: 'A detective superintendent investigates a series of murders in Belfast while the charming serial killer she hunts leads a seemingly normal life.' },
  { title: 'Your Honor', clue: 'A respected judge makes a devastating choice to protect his son after a hit-and-run accident, setting off a chain of lies and violence.' },
  { title: 'The Crown', clue: 'The story of the reign of Queen Elizabeth II from her wedding in 1947 through the decades, exploring the personal and political challenges she faced.' },
  { title: 'Downton Abbey', clue: 'The lives of the aristocratic Crawley family and their servants in a grand English country estate from the early 1900s through the aftermath of World War I.' },
  { title: 'Outlander', clue: 'A World War II nurse is mysteriously transported back to 18th-century Scotland where she falls in love with a Highland warrior and must navigate two worlds.' },
  { title: 'Westworld', clue: 'A futuristic theme park where wealthy guests live out their wildest fantasies with android hosts turns deadly when the hosts begin to gain consciousness.' },
  { title: 'Money Heist', clue: 'A mysterious mastermind known as The Professor gathers a team of eight criminals to execute the most ambitious heist in history: printing billions in the Royal Mint.' },
  { title: 'Elite', clue: 'Three working-class students enroll at the most exclusive private school in Spain, leading to tensions romance and murder among the wealthy students.' },
  { title: 'Yali Capkini', clue: 'A wealthy playboy from a prominent Istanbul family is forced to marry a girl from a modest background, and their relationship slowly transforms both.' },
  { title: 'Magnificent Century', clue: 'The epic story of Sultan Suleiman the Magnificent and his powerful wife Hürrem Sultan, who rises from slave to queen of the Ottoman Empire.' },
  { title: 'Sen Cal Kapimi', clue: 'A young woman determined to become an architect crosses paths with a cold businessman, and their constant bickering slowly turns into something deeper.' },
  { title: 'Kiralik Ask', clue: 'A woman working at a shoe company agrees to pretend to be the girlfriend of a famous shoe designer in exchange for money to pay off her debts.' },
]

const ANIME: CuratedEntry[] = [
  { title: 'Toradora!', clue: 'A gentle high school boy and a fierce tiny girl with a temper team up to help each other win the hearts of their crushes, but feelings get complicated.' },
  { title: 'Clannad', clue: 'A delinquent high school boy meets a strange girl who talks to herself and together they help other students with their problems while finding friendship.' },
  { title: 'Clannad: After Story', clue: 'The story continues years after high school as the main character faces adulthood marriage parenthood and devastating loss that will break your heart.' },
  { title: 'Your Lie in April', clue: 'A former child piano prodigy loses his ability to hear music after his mother death, until a free-spirited violinist forces him back onto the stage.' },
  { title: 'Kaguya-sama: Love is War', clue: 'Two genius student council members are madly in love with each other but refuse to admit it, engaging in elaborate mind games to make the other confess first.' },
  { title: 'Fruits Basket (2019)', clue: 'An orphaned girl discovers that members of a cursed family transform into animals of the Chinese zodiac when hugged by the opposite sex.' },
  { title: 'Horimiya', clue: 'A popular and studious high school girl and a quiet pierced boy discover each other true selves outside of school and grow closer through shared secrets.' },
  { title: 'Kimi ni Todoke: From Me to You', clue: 'A shy girl often mistaken for a horror movie ghost because of her long black hair tries to make friends and finds love with the most popular boy in class.' },
  { title: 'My Teen Romantic Comedy SNAFU', clue: 'A cynical loner who believes youth is a lie is forced to join a volunteer club where he helps others with their problems while learning about friendship.' },
  { title: 'Rascal Does Not Dream of Bunny Girl Senpai', clue: 'A high school boy encounters girls suffering from a strange syndrome where their problems manifest physically, starting with a bunny girl no one else can see.' },
  { title: 'The Angel Next Door Spoils Me Rotten', clue: 'A plain high school boy finds himself being doted on by the school beauty who lives next door after he helps her when she gets caught in the rain.' },
  { title: 'My Dress-Up Darling', clue: 'A shy boy who crafts traditional Japanese dolls helps a popular girl create cosplay costumes, and their shared passion brings them closer together.' },
  { title: 'Golden Time', clue: 'A college freshman in Tokyo loses his memories from before high school and navigates new friendships love and a ghost from his forgotten past.' },
  { title: 'Tsuki ga Kirei', clue: 'Two shy and awkward middle school students find themselves drawn to each other through their mutual love of literature and struggle to express their feelings.' },
  { title: 'ReLIFE', clue: 'A 27-year-old man who regrets his past is given a drug that makes him look 17 again so he can relive his senior year of high school.' },
  { title: 'Tonikawa: Over the Moon for You', clue: 'A boy who nearly died in a truck accident is saved by a mysterious beautiful girl, and when he confesses his love, she agrees to marry him on the spot.' },
  { title: 'Teasing Master Takagi-san', clue: 'A middle school boy is constantly teased by the girl who sits next to him but her teasing is actually her awkward way of showing affection.' },
  { title: 'Wolf Girl and Black Prince', clue: 'A prideful girl pretends to have a boyfriend to impress her friends, but her fake boyfriend turns out to be a sadistic boy who blackmails her.' },
  { title: 'The Dangers in My Heart', clue: 'A gloomy middle schooler who fantasizes about murdering his classmates finds himself falling for the bubbly and popular class idol instead.' },
  { title: 'The Pet Girl of Sakurasou', clue: 'A practical high school boy ends up living in a dorm for misfits and must take care of a brilliant but helpless girl who cant even open doors by herself.' },
  { title: 'Kokoro Connect', clue: 'Five high school friends begin randomly swapping bodies with each other due to a mysterious phenomenon caused by a trickster entity.' },
  { title: 'Romantic Killer', clue: 'A video game obsessed girl is suddenly forced into romantic situations by a magical creature who confiscates her games and makes her live a dating sim.' },
  { title: 'The Garden of Words', clue: 'A teenage boy skips school to sit in a garden during rainy mornings where he meets a mysterious older woman who shares his love of rainy days.' },
  { title: '5 Centimeters Per Second', clue: 'A poignant story about two childhood friends who grow apart over the years as distance and time slowly erode their connection.' },
  { title: 'A Silent Voice', clue: 'A former bully seeks redemption by reaching out to the deaf girl he tormented in elementary school, leading to a story of forgiveness and healing.' },
  { title: 'I Want to Eat Your Pancreas', clue: 'A loner boy discovers that his cheerful classmate is dying of a pancreatic disease and despite his initial reluctance they form a deep bond.' },
  { title: 'Your Name', clue: 'A rural girl and a city boy mysteriously swap bodies and must navigate each others lives while falling in love across time and space.' },
  { title: 'Weathering With You', clue: 'A runaway boy in Tokyo meets a girl with the power to control the weather, and they try to use her gift to bring sunshine to a rain-soaked city.' },
  { title: 'Suzume', clue: 'A teenage girl and a mysterious young man travel across Japan closing supernatural doors that unleash disasters, while running from a magical cat.' },
  { title: 'Violet Evergarden', clue: 'A former child soldier learns to understand human emotions and love by working as an Auto Memory Doll, writing letters for others after the war ends.' },
  { title: 'Wolf Children', clue: 'A young woman falls in love with a wolf man and raises their two half-wolf children alone after his death, struggling to give them a normal life.' },
  { title: 'Orange', clue: 'A high school girl receives a letter from her future self warning her about the new transfer student and telling her to make different choices.' },
  { title: 'Ao Haru Ride', clue: 'A girl who changed her personality in high school reunites with her middle school crush who has also changed and they must rediscover each other.' },
  { title: 'Say I Love You', clue: 'A girl who believes she doesnt need friends because they always betray her meets the most popular boy in school who slowly breaks down her walls.' },
  { title: 'My Little Monster', clue: 'A studious girl who values grades above all else meets a violent and unpredictable boy who has been isolated from the class and they develop an odd bond.' },
  { title: 'Lovely Complex', clue: 'A very tall girl and a very short boy who are constantly mistaken for a comedy duo navigate the ups and downs of their unlikely romance.' },
  { title: 'Nana', clue: 'Two young women with the same name but completely different personalities meet on a train to Tokyo and become roommates, sharing their dreams and struggles.' },
  { title: 'Paradise Kiss', clue: 'A studious high school girl is recruited to be a model by a group of eccentric fashion design students and discovers a new world of creativity.' },
  { title: 'Honey and Clover', clue: 'A group of art college students navigate love friendship and their uncertain futures as they try to find their paths in life and art.' },
  { title: 'Kids on the Slope', clue: 'A classically trained pianist moves to a new town in 1960s Japan and bonds with a troubled delinquent over their shared love of jazz music.' },
  { title: 'Chihayafuru', clue: 'A passionate girl dedicates her life to the competitive world of karuta a traditional Japanese card game and inspire others to join her quest for glory.' },
  { title: 'Just Because!', clue: 'A boy returns to his hometown for his final semester of high school and reconnects with old friends as everyone prepares for college exams and uncertain futures.' },
  { title: 'Waiting in the Summer', clue: 'A group of high school friends decide to make a film together and their project becomes the backdrop for romance when a mysterious alien girl joins them.' },
  { title: 'One Week Friends', clue: 'A boy discovers that his classmate loses all memories of her friends every Monday and he decides to become her friend over and over again each week.' },
  { title: 'True Tears', clue: 'A high school boy with artistic dreams lives with a strange girl who cannot cry and must choose between her and a childhood friend.' },
  { title: 'White Album 2', clue: 'A love triangle unfolds between a boy and two girls in a high school light music club as they prepare for their final performance together.' },
  { title: 'Domestic Girlfriend', clue: 'A high school boy in love with his teacher accidentally starts a forbidden relationship with her sister and then his father remarries both of them.' },
  { title: 'Scums Wish', clue: 'Two high school students who are in love with other people form a fake relationship to fill the emptiness inside them, with tragic consequences.' },
  { title: 'A Lull in the Sea', clue: 'A group of children from an underwater village must attend school on the surface for the first time, facing prejudice and discovering love across two worlds.' },
  { title: 'Summer Wars', clue: 'A math prodigy must help a virtual world avatar defeat an AI that threatens to destroy both the digital and real worlds during a family reunion.' },
  { title: 'The Boy and the Beast', clue: 'A runaway boy wanders into a world of anthropomorphic beasts and is taken in by a gruff bear-like warrior who trains him in combat and life.' },
  { title: 'Maquia: When the Promised Flower Blooms', clue: 'A young immortal girl from a secluded clan is torn from her home and raises a human orphan as her own son, knowing he will grow old while she stays young.' },
  { title: 'The Anthem of the Heart', clue: 'A girl who was cursed as a child to never speak again after her words hurt her parents is chosen to star in a musical and must find her voice.' },
  { title: 'Josee, the Tiger and the Fish', clue: 'A young man takes a job caring for a wheelchair-bound girl who dreams of exploring the world outside her grandmother home.' },
  { title: 'Ride Your Wave', clue: 'A young woman discovers she can transform into water and reunite with her deceased boyfriend whenever she sings their favorite song.' },
  { title: 'Her Blue Sky', clue: 'A teenage girl meets a mysterious guitarist who might be her older sister boyfriend from years ago who somehow never aged.' },
  { title: 'Penguin Highway', clue: 'A curious fourth-grade boy investigates why penguins suddenly appear in his suburban town and discovers the strange woman at the dentist office holds the key.' },
  { title: 'Words Bubble Up Like Soda Pop', clue: 'A boy who expresses himself through haiku poetry and a girl who hides her face behind a mask form an unlikely bond during a summer at the mall.' },
  { title: 'Bloom Into You', clue: 'A high school girl who has never felt romantic feelings meets a senior who claims she will never fall in love either and their relationship deepens.' },
  { title: 'Citrus', clue: 'A fashionable girl who values her independence gets a new stepsister who is the complete opposite, and their hostile relationship slowly becomes something more.' },
  { title: 'Adachi and Shimamura', clue: 'Two high school girls who skip class together sometimes develop a slow and tender relationship that neither of them fully understands at first.' },
  { title: 'Sakura Trick', clue: 'Two best friends in high school decide to show their affection for each other by sharing kisses in secret places around their school.' },
  { title: 'Given', clue: 'A shy high school boy who used to play guitar meets a talented musician and begins playing bass in his band, finding healing and love through music.' },
  { title: 'Doukyuusei', clue: 'Two very different high school boys prepare for their school choir festival performance and unexpectedly fall in love along the way.' },
  { title: 'Sasaki and Miyano', clue: 'A quiet boy who loves BL manga gets noticed by a former delinquent who becomes interested in him, starting a sweet high school romance.' },
  { title: 'Yuri on Ice', clue: 'A world-class figure skater hits rock bottom after a devastating loss and finds renewed passion for the sport under a flamboyant new Russian coach.' },
  { title: 'My Happy Marriage', clue: 'A young woman with a magical gift is treated cruelly by her family and forced into an arranged marriage with a cold military commander who might be her salvation.' },
  { title: 'Snow White with the Red Hair', clue: 'A cheerful herbalist with striking red hair flees her kingdom after a prince tries to make her his concubine finds refuge and love in a neighboring land.' },
  { title: 'Yona of the Dawn', clue: 'A pampered princess must flee her kingdom when her beloved cousin murders her father, and she sets out to find legendary warriors to reclaim her throne.' },
  { title: 'Kamisama Kiss', clue: 'A homeless teenage girl is given a strange kiss by a mysterious man and ends up becoming the new deity of a rundown shrine with a fox familiar.' },
  { title: 'InuYasha', clue: 'A modern-day girl is pulled into a magical well that transports her to feudal Japan where she meets a half-demon boy and must help him find a sacred jewel.' },
  { title: 'Maid Sama!', clue: 'The strict female student council president of a formerly all-boys school works secretly at a maid cafe, and the most popular boy discovers her secret.' },
  { title: 'Special A', clue: 'A competitive girl who has always been second best to the rich boy at everything she does finally admits her feelings and they might be mutual.' },
  { title: 'Nodame Cantabile', clue: 'A serious classical piano student is frustrated by his free-spirited and messy neighbor whose eccentric playing style somehow shows true genius.' },
  { title: 'Blue Box', clue: 'A badminton player and a basketball girl share a gym and slowly their competitive spirits turn into something warmer as they chase their dreams together.' },
  { title: 'The Girl Who Leapt Through Time', clue: 'A high school girl discovers she can literally leap backwards through time and uses her power to fix everyday problems until the consequences catch up.' },
  { title: 'Suzuka', clue: 'A high school boy moves into his aunt dormitory near a track and field school where he falls for the talented high jumper who lives next door.' },
  { title: 'Fuuka', clue: 'A boy who was content living his ordinary life meets a strange girl who loves music and together with friends they form a band to chase their dreams.' },
  { title: 'Kimi no Iru Machi', clue: 'A country boy moves to Tokyo to be closer to the girl he fell for during her stay in his hometown only to find city life is more complicated.' },
  { title: 'Please Teacher!', clue: 'A high school boy discovers his beautiful homeroom teacher is actually an alien stranded on Earth and they enter a secret marriage to protect her identity.' },
  { title: 'Recovery of an MMO Junkie', clue: 'A 30-year-old woman quits her job and becomes a NEET spending all her time in an MMO where she befriends a kind player who is her coworker in real life.' },
  { title: 'Wotakoi: Love is Hard for Otaku', clue: 'Two childhood friends who are both hardcore otaku reunite as adults working at the same company and decide to date understanding each other hobbies perfectly.' },
  { title: 'Princess Jellyfish', clue: 'A group of socially awkward women who live together as shut-ins must protect their home from developers and one of them finds love with a crossdressing man.' },
  { title: 'The Ancient Magus Bride', clue: 'A suicidal teenage girl is bought at an auction by a mysterious non-human mage who takes her as his apprentice and bride in a world of magic.' },
  { title: 'Sacrificial Princess and the King of Beasts', clue: 'A human girl is sent as a sacrifice to the beast king but instead of killing her he keeps her as his bride in a world of animal-human hybrids.' },
  { title: 'Love Chunibyo Other Delusions', clue: 'A boy who used to have delusions of grandeur in middle school meets a girl who still lives in her fantasy world and must help her face reality.' },
  { title: 'Nisekoi', clue: 'A high school boy from a gangster family is forced to pretend to date a girl from a rival gang family to maintain peace between the two groups.' },
  { title: 'The Quintessential Quintuplets', clue: 'A poor high school genius is hired as a tutor for five identical quintuplet sisters who all have terrible grades and different personalities.' },
  { title: 'We Never Learn: Bokuben', clue: 'A studious high school boy tutors three girls in subjects they are terrible at, and each girl represents a different field of knowledge he must master.' },
  { title: 'Masamune-kun Revenge', clue: 'A boy who was cruelly rejected by a rich girl in his childhood transforms himself and returns years later seeking revenge by making her fall for him.' },
  { title: 'Yamada-kun and the Seven Witches', clue: 'A high school troublemaker discovers he can swap bodies by kissing and uncovers a secret society of seven witches with unique powers at his school.' },
  { title: 'Boarding School Juliet', clue: 'The leader of a dorm at a warring boarding school and the leader of the rival girls dorm are secretly in love and must hide their relationship.' },
  { title: 'Rent-a-Girlfriend', clue: 'A heartbroken college student rents a girlfriend through an app but his rented girlfriend turns out to be more complicated and real than expected.' },
  { title: 'More Than a Married Couple But Not Lovers', clue: 'Two high school students with opposite personalities are paired together as a fake married couple in a practical class about marriage.' },
  { title: 'Komi Cant Communicate', clue: 'A girl with crippling social anxiety who has never spoken to anyone at school is determined to make 100 friends with the help of her kind classmate.' },
]

export async function generateQuestions(
  category: Category,
  gameMode: GameMode,
  count: number = 10
): Promise<QuestionData[]> {
  const source = category === 'anime' ? ANIME : [...MOVIES, ...SERIES]
  const shuffled = shuffleArray(source)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  const allTitles = source.map(e => e.title)

  return shuffleArray(selected.map((entry, i) => {
    const options = generateOptions(entry.title, allTitles, gameMode)
    return {
      id: `${category}-curated-${i}`,
      type: 'description',
      mediaUrl: null,
      clue: entry.clue,
      options,
      correctAnswer: entry.title,
      timeLimit: gameMode === 'timer' ? 8000 : 15000,
      category,
      title: entry.title,
    }
  }))
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

const WORDS = ['the', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'is', 'it']

function wordDistance(a: string, b: string): number {
  const aWords = normalizeTitle(a).split(/\s+/).filter(w => !WORDS.includes(w))
  const bWords = normalizeTitle(b).split(/\s+/).filter(w => !WORDS.includes(w))
  let matches = 0
  for (const w of aWords) {
    if (bWords.includes(w)) matches++
  }
  return matches / Math.max(aWords.length, bWords.length)
}

function generateOptions(correct: string, allNames: string[], _gameMode: GameMode): string[] {
  const filtered = allNames.filter(
    (n) => n !== correct && wordDistance(n, correct) < 0.6
  )
  const shuffled = shuffleArray(filtered)
  const distractors = shuffled.slice(0, 3)
  const options = shuffleArray([correct, ...distractors])

  while (options.length < 4) {
    const idx = Math.floor(Math.random() * allNames.length)
    const fallback = allNames[idx]
    if (!options.includes(fallback)) options.push(fallback)
  }

  return options.slice(0, 4)
}
