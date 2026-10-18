# Temporary builder; deleted after writing grades-3-4-01.json
import json
import re
from pathlib import Path

ROOT = Path(r"D:\github\spellingBee7004")
SRC = ROOT / "src" / "data" / "grades-3-4.json"
OUT = ROOT / "src" / "data" / "sentence-jobs" / "grades-3-4-01.json"

PAIRS = {
    1: (
        "Maya showed great ability when she solved the puzzle alone.",
        "His ability on the soccer field helped the whole team.",
    ),
    2: (
        "The rabbits stayed aboveground until the rain finally stopped.",
        "Our garden hose runs aboveground beside the flower beds.",
    ),
    3: (
        "Mom said we need absolute quiet during the baby's nap.",
        "The coach asked for absolute focus before the first pitch.",
    ),
    4: (
        "The sponge will absorb the spilled juice on the counter.",
        "Dry soil can absorb a lot of water after rain.",
    ),
    5: (
        "Plants adapt when the weather turns hotter each summer.",
        "New students adapt quickly when classmates are kind.",
    ),
    6: (
        "Put the address neatly on the front of the envelope.",
        "We visited the address printed on the birthday invitation.",
    ),
    7: (
        "The museum showed an adobe house from long ago.",
        "Workers mixed clay to repair the old adobe wall.",
    ),
    8: (
        "Our camping trip felt like a real adventure in the woods.",
        "The library book followed an adventure across a wide river.",
    ),
    9: (
        "The affectionate puppy curled up beside my sister.",
        "Grandma is affectionate and always greets us with a hug.",
    ),
    10: (
        "Lean the rake against the fence after yard work.",
        "Our team played against the visitors on Saturday morning.",
    ),
    11: (
        "Please do not agitate the fish by tapping the tank.",
        "Strong wind can agitate the lake until the boats rock.",
    ),
    12: (
        "The airplane flew above the clouds on our trip.",
        "We built a paper airplane and tested it outdoors.",
    ),
    13: (
        "Mom filled the album with photos from our picnic.",
        "The class made an album of drawings from the farm visit.",
    ),
    14: (
        "We saw an alligator resting near the pond at the zoo.",
        "The science video showed an alligator swimming through calm water.",
    ),
    15: (
        "Dad added allspice to the warm apple muffins.",
        "The cookie recipe called for a pinch of allspice.",
    ),
    16: (
        "The poem made an allusion to a familiar fairy tale.",
        "Her joke was an allusion to yesterday's soccer win.",
    ),
    17: (
        "We almost missed the bus because the toast burned.",
        "The kite almost reached the tallest tree in the park.",
    ),
    18: (
        "The dancers said aloha as they welcomed every guest.",
        "We learned to say aloha before our class luau.",
    ),
    19: (
        "Please alternate colors when you hang the party cups.",
        "The coach will alternate players so everyone gets a turn.",
    ),
    20: (
        "An amber light glowed from the porch at dusk.",
        "The necklace held a tiny insect in golden amber.",
    ),
    21: (
        "Grandpa told us about an ancestor who planted this farm.",
        "The museum photo showed an ancestor wearing a long coat.",
    ),
    22: (
        "Loud tapping can annoy people who are reading nearby.",
        "Please do not annoy the cat while she is sleeping.",
    ),
    23: (
        "Stars appear after sunset if the sky is clear.",
        "The magician made a coin appear in his empty hand.",
    ),
    24: (
        "Fresh air gave us a big appetite after the hike.",
        "Soup can restore your appetite when you feel tired.",
    ),
    25: (
        "The teacher will appoint a line leader for Friday.",
        "Our club will appoint a new helper next week.",
    ),
    26: (
        "Guests will arrive at noon for the picnic lunch.",
        "The school bus should arrive before the bell rings.",
    ),
    27: (
        "She wrote an article about recycling for the class paper.",
        "Dad read an article about garden birds at breakfast.",
    ),
    28: (
        "Grandma keeps aspirin in the high kitchen cabinet.",
        "The nurse said aspirin is only for grown-ups.",
    ),
    29: (
        "The teacher will assign partners for the science project.",
        "Coaches assign positions before the first soccer drill.",
    ),
    30: (
        "Card tricks astonish my little brother every time.",
        "Bright fireworks astonish the crowd at the fair.",
    ),
    31: (
        "Earth has an atmosphere that helps us breathe.",
        "The party atmosphere felt warm and friendly in the gym.",
    ),
    32: (
        "The school held an auction to buy new library books.",
        "We watched an auction of old farm tools on Saturday.",
    ),
    33: (
        "The pitcher signed an autograph for every young fan.",
        "I taped the autograph inside my notebook at home.",
    ),
    34: (
        "Our team's average score improved after extra drills.",
        "The average apple in the basket weighed about one pound.",
    ),
    35: (
        "The baby likes to babble while playing with blocks.",
        "A small brook can babble over rocks in the woods.",
    ),
    36: (
        "Pack your backpack with a lunch and a water bottle.",
        "Her backpack bounced as she ran toward the playground.",
    ),
    37: (
        "We put bait on the hook before fishing at the lake.",
        "Birds ate the bait we left near the garden fence.",
    ),
    38: (
        "Try to balance on one foot during gym class.",
        "The recipe needs a balance of sweet and tart fruit.",
    ),
    39: (
        "Grandma sang a ballad about a river and a boat.",
        "Our choir learned a ballad for the spring concert.",
    ),
    40: (
        "The dog's bark woke us before the alarm clock.",
        "Rough bark covered the old oak beside the trail.",
    ),
    41: (
        "Rainwater filled the barrel beside the garden shed.",
        "The orchard kept a barrel of apples for visitors.",
    ),
    42: (
        "The bashful kitten hid under the living room chair.",
        "A bashful student whispered the answer to a friend.",
    ),
    43: (
        "The sandwich looked beefy with extra meat and cheese.",
        "A beefy oak branch held the swing above the yard.",
    ),
    44: (
        "Dad's old beeper buzzed during dinner last night.",
        "The nurse carried a beeper on her belt at work.",
    ),
    45: (
        "She chose a beige sweater for the school photo.",
        "The living room walls are a soft beige color.",
    ),
    46: (
        "A true friend will not betray a private secret.",
        "Do not betray the team's plan before the big game.",
    ),
    47: (
        "Stars in the sky number more than a billion.",
        "A billion grains of sand would fill a huge box.",
    ),
    48: (
        "In biology we studied how frogs grow from tadpoles.",
        "The biology club planted flowers for visiting butterflies.",
    ),
    49: (
        "A bison grazed on the open prairie grass.",
        "We watched a bison from the park's safe trail.",
    ),
    50: (
        "Do not blame your brother for the spilled milk.",
        "The coach would not blame one player for the loss.",
    ),
    51: (
        "A blazing sunset turned the lake a bright orange.",
        "The blazing campfire kept us warm on the hill.",
    ),
    52: (
        "One small blemish marked the otherwise perfect apple.",
        "She covered a tiny blemish with a bandage before school.",
    ),
    53: (
        "Mom used the blender to make a strawberry smoothie.",
        "We washed the blender after mixing pancake batter.",
    ),
    54: (
        "Leaves caused a blockage in the backyard drain.",
        "A toy boat created a blockage in the creek.",
    ),
    55: (
        "I felt a blush when the class clapped for me.",
        "Ripe peaches blush pink on the sunny side.",
    ),
    56: (
        "The long meeting felt boring until snacks arrived.",
        "A boring rainy afternoon turned fun with board games.",
    ),
    57: (
        "Please do not be bossy when we share toys.",
        "The bossy goose chased us away from the bread.",
    ),
    58: (
        "Grandma gave me a bracelet made of tiny shells.",
        "She wore a friendship bracelet to the school picnic.",
    ),
    59: (
        "It takes bravery to try a new sport in gym.",
        "The class story praised the bravery of a kind helper.",
    ),
    60: (
        "A stiff bristle on the brush cleaned the muddy boots.",
        "Cats bristle when they hear a sudden loud sound.",
    ),
    61: (
        "Travel can broaden your ideas about food and music.",
        "Reading many books will broaden what you know.",
    ),
    62: (
        "The brown bronco trotted around the dusty ranch.",
        "At the fair a bronco waited behind the wooden fence.",
    ),
    63: (
        "My brother packed sandwiches for our hike together.",
        "Her brother joined the choir at school this year.",
    ),
    64: (
        "We made a budget for snacks at the ball game.",
        "Mom's weekly budget includes fruit and bread.",
    ),
    65: (
        "The built-in shelves hold all of our board games.",
        "Our classroom has a built-in sink near the art table.",
    ),
    66: (
        "They opened a lemonade business on the corner.",
        "The family business sells fresh eggs at the market.",
    ),
    67: (
        "Plates belong in the cabinet above the kitchen stove.",
        "The science cabinet holds magnets, rocks, and goggles.",
    ),
    68: (
        "The lake looked calm after the wind died down.",
        "Take a calm breath before you kick the soccer ball.",
    ),
    69: (
        "The vitamin capsule sat beside a glass of water.",
        "A time capsule was buried under the new playground.",
    ),
    70: (
        "Players tried to capture the flag before recess ended.",
        "I hoped to capture the butterfly in a photo.",
    ),
    71: (
        "Be careful when you carry the bowl of soup.",
        "A careful hiker stays on the marked forest path.",
    ),
    72: (
        "The mail carrier waved from the sidewalk this morning.",
        "We put the cat in a carrier for the vet visit.",
    ),
    73: (
        "Pick a category for your report, such as weather.",
        "Apples belong in the fruit category at the market.",
    ),
    74: (
        "They will cater sandwiches for the class picnic.",
        "Our neighbors cater soup and bread for the bake sale.",
    ),
    75: (
        "A wooden catwalk crossed the marsh so hikers stayed dry.",
        "Workers used a catwalk high above the gym floor.",
    ),
    76: (
        "A fan hung from the ceiling in the warm classroom.",
        "We painted the ceiling a light blue in my bedroom.",
    ),
    77: (
        "We will celebrate Grandma's birthday with a backyard picnic.",
        "The team will celebrate after the last soccer match.",
    ),
    78: (
        "The fountain sits in the central part of the park.",
        "Our central hallway leads to the art room.",
    ),
    79: (
        "A century is one hundred years long.",
        "That oak has stood in the yard for a century.",
    ),
    80: (
        "The quiet chapel stood beside the old stone school.",
        "We toured a historic chapel on the field trip.",
    ),
    81: (
        "You have a choice of apple or orange juice.",
        "Her first choice for the project was the rainforest.",
    ),
    82: (
        "The bicycle's chrome handlebars shone in the sunlight.",
        "Dad polished the chrome on the old toaster.",
    ),
    83: (
        "Electricity travels around a circuit in science class.",
        "Runners completed one circuit of the track before lunch.",
    ),
    84: (
        "Fresh citrus fruit filled the bowl on the table.",
        "We planted a citrus tree beside the garden path.",
    ),
    85: (
        "A desert climate is dry and often very hot.",
        "Our climate here has mild winters and warm springs.",
    ),
    86: (
        "The clumsy puppy tripped over its own floppy ears.",
        "I felt clumsy while learning to jump rope.",
    ),
    87: (
        "The comical hat made everyone at the party smile.",
        "A comical goat stole a sandwich at the farm.",
    ),
    88: (
        "A sudden commotion in the hall meant the bell rang.",
        "Birds caused a commotion when the cat walked by.",
    ),
    89: (
        "We used the computer to type our class story.",
        "Dad checked the computer for the weather before soccer.",
    ),
    90: (
        "The bushes conceal the garden hose from the street.",
        "Please do not conceal your library book under the bed.",
    ),
    91: (
        "Fractions were a new concept in math this week.",
        "Sharing is an important concept on the playground.",
    ),
    92: (
        "Please continue reading until you finish the chapter.",
        "The rain will continue through the afternoon picnic.",
    ),
    93: (
        "The sky stayed blue, contrary to the morning forecast.",
        "He held a contrary opinion about the best snack.",
    ),
    94: (
        "Please make a copy of the class newsletter for Mom.",
        "I kept a copy of the recipe on the fridge.",
    ),
    95: (
        "We drove through the country and saw grazing horses.",
        "Each country on the map has its own flag.",
    ),
    96: (
        "Mom cooked cranberry sauce for the holiday dinner.",
        "The muffin had a tart cranberry in every bite.",
    ),
    97: (
        "We will create a mural for the cafeteria wall.",
        "Birds create nests from grass, twigs, and string.",
    ),
    98: (
        "My brother made a creepy face just to be silly.",
        "The old attic felt creepy until we turned on lights.",
    ),
    99: (
        "A crowd gathered to watch the parade downtown.",
        "Please do not crowd the puppies in the small pen.",
    ),
    100: (
        "The curious kitten peeked into the open grocery bag.",
        "Many curious students asked questions about the moon.",
    ),
    101: (
        "The road makes a curve beside the quiet pond.",
        "She learned to curve the baseball toward home plate.",
    ),
    102: (
        "Warm custard was poured over the baked apples.",
        "We made vanilla custard for dessert after dinner.",
    ),
    103: (
        "The puppy's dandruff showed on its dark winter coat.",
        "Special shampoo can help with dandruff on your scalp.",
    ),
    104: (
        "Thick curtains deaden street noise in our bedroom.",
        "Soft mats deaden the sound of jumping in gym.",
    ),
    105: (
        "Simple decency means waiting your turn in line.",
        "He showed decency by sharing his umbrella at recess.",
    ),
    106: (
        "Place the decimal point carefully in your math answer.",
        "The price used a decimal to show extra cents.",
    ),
    107: (
        "We will decorate cupcakes for the class party.",
        "Families decorate their porches with pumpkins in October.",
    ),
    108: (
        "The team hoped to defeat the visitors on Saturday.",
        "Extra study helped her defeat a tricky math problem.",
    ),
    109: (
        "He wore a denim jacket on the cool field trip.",
        "Her denim overalls were perfect for painting class.",
    ),
    110: (
        "We compared the density of a rock and a cork.",
        "Fog's density made the morning walk feel cloudy.",
    ),
    111: (
        "A dependable friend returns the toys you lend.",
        "Our dependable old van started even in cold weather.",
    ),
    112: (
        "Please describe the butterfly you saw near the roses.",
        "Mom asked me to describe the soup's smell at dinner.",
    ),
    113: (
        "We will design a poster for the school fair.",
        "The architect showed a design for the new library.",
    ),
    114: (
        "A fallen tree forced a detour around the park.",
        "We took a detour to buy ice cream after the game.",
    ),
    115: (
        "Tadpoles develop into frogs in the pond each spring.",
        "Good habits develop when you pack your bag at night.",
    ),
    116: (
        "The baseball diamond was dusty after the dry week.",
        "Grandma's ring had a small diamond in the center.",
    ),
    117: (
        "Treat every classmate with dignity on the playground.",
        "The old dog walked with dignity into the kitchen.",
    ),
    118: (
        "We ate dinner on the porch during the cool evening.",
        "The team shared pizza for dinner after the game.",
    ),
    119: (
        "A huge dinosaur skeleton stood in the museum hall.",
        "My little sister named her toy dinosaur Greenie.",
    ),
    120: (
        "Follow the direction of the arrows to the cafeteria.",
        "The wind changed direction before the rain began.",
    ),
    121: (
        "Being dishonest about homework only causes more trouble.",
        "The dishonest sign advertised free candy that was not free.",
    ),
    122: (
        "Sugar will dissolve quickly in the hot tea.",
        "Salt crystals dissolve when we stir the soup.",
    ),
    123: (
        "We will donate coats to the winter clothing drive.",
        "Please donate unused books to the school library.",
    ),
    124: (
        "I like to doodle stars in the margin of notes.",
        "She began to doodle a cat on a napkin at lunch.",
    ),
    125: (
        "The doctor measured a dose of cough syrup carefully.",
        "One dose of plant food helped the tomatoes grow.",
    ),
    126: (
        "A blue dragonfly hovered above the garden pond.",
        "We photographed a dragonfly resting on a cattail.",
    ),
    127: (
        "Last night I had a dream about a giant garden.",
        "Her dream is to join the school soccer team.",
    ),
    128: (
        "Sudden rain can drench you on the walk home.",
        "We had to drench the dry garden after the heat.",
    ),
    129: (
        "Learn to dribble the basketball with either hand.",
        "Juice may dribble down the side of the cup.",
    ),
    130: (
        "The drover guided cattle along the dusty country road.",
        "A drover waved from horseback near the open pasture.",
    ),
    131: (
        "They sang a duet at the spring music program.",
        "My sister and I played a piano duet at home.",
    ),
    132: (
        "Fireflies appeared at dusk near the backyard fence.",
        "We packed the picnic as dusk settled over the lake.",
    ),
    133: (
        "One earmuff slipped off during the sled ride.",
        "He packed an extra earmuff in his winter coat pocket.",
    ),
    134: (
        "No earthly snack could beat Grandma's warm cookies.",
        "The garden felt like an earthly treasure after rain.",
    ),
    135: (
        "The easiest trail led around the quiet pond.",
        "Adding ten was the easiest problem on the quiz.",
    ),
    136: (
        "We watched a solar eclipse through special safe glasses.",
        "The lunar eclipse made the moon look faintly orange.",
    ),
    137: (
        "A strong economy means many people can find work.",
        "We studied the town's economy at the farmer's market.",
    ),
    138: (
        "Only the edible berries should go into the pie.",
        "The teacher showed which garden plants are edible.",
    ),
    139: (
        "Dad grilled eggplant with olive oil for dinner.",
        "Purple eggplant hung from the vines in our garden.",
    ),
    140: (
        "Choir is my favorite elective this school year.",
        "She chose art as an elective instead of band.",
    ),
    141: (
        "Extra raking will eliminate most leaves from the yard.",
        "We must eliminate junk food from our team snacks.",
    ),
    142: (
        "If this seat is taken, please sit elsewhere.",
        "The missing glove was found elsewhere in the gym.",
    ),
    143: (
        "The firefly would elude our jars and fly away.",
        "Hard riddles can elude even careful readers at first.",
    ),
    144: (
        "The family shared a warm embrace at the airport.",
        "Good teams embrace new players from the first day.",
    ),
    145: (
        "Ramp access will enable everyone to enter the library.",
        "Extra time can enable you to finish the puzzle.",
    ),
    146: (
        "I ordered a cheese enchilada at the family restaurant.",
        "Mom baked an enchilada casserole for Friday night.",
    ),
    147: (
        "The wheat field looked endless from the dusty road.",
        "Recess felt endless when we played a long game.",
    ),
    148: (
        "Our English class wrote poems about the river.",
        "She practiced English with a pen pal overseas.",
    ),
    149: (
        "We packed enough water for the whole hiking group.",
        "There was enough pizza for every player after the game.",
    ),
    150: (
        "The cake was entirely gone before the guests arrived.",
        "She felt entirely ready for the science fair.",
    ),
    151: (
        "One error in addition changed the whole math answer.",
        "The scoreboard showed an error and then the right score.",
    ),
    152: (
        "The hamster tried to escape from its open cage.",
        "We planned an escape from the hot sun under trees.",
    ),
    153: (
        "The map showed several European countries beside the sea.",
        "We tasted European cheeses at the food festival.",
    ),
    154: (
        "It was an eventful day with a parade and picnic.",
        "Our eventful field trip included a farm and a mill.",
    ),
    155: (
        "No one had ever seen so many butterflies in the yard.",
        "She is the kindest friend I have ever known.",
    ),
    156: (
        "Daily exercise helps our class stay strong and alert.",
        "Walking the dog is good exercise after dinner.",
    ),
    157: (
        "That telescope is too expensive for our club budget.",
        "Fresh berries can be expensive in the winter months.",
    ),
    158: (
        "Use an eyedropper to add food coloring to the frosting.",
        "The science kit included an eyedropper and a small cup.",
    ),
    159: (
        "One eyelash fell onto her cheek during class.",
        "The costume had a sparkly fake eyelash on each eye.",
    ),
    160: (
        "Our faithful dog waited by the door each afternoon.",
        "She was a faithful helper in the school garden.",
    ),
    161: (
        "A falsehood about the homework only caused confusion.",
        "Tell the truth, because a falsehood can hurt friends.",
    ),
    162: (
        "The famous baker visited our school cafeteria today.",
        "A famous oak stands in the center of the park.",
    ),
    163: (
        "Extra fanciness made the cupcakes look like tiny gifts.",
        "The costume's fanciness came from ribbons and glitter.",
    ),
    164: (
        "Forgetting water can be fatal for a potted plant.",
        "One missing piece was fatal to the whole puzzle.",
    ),
    165: (
        "It was not your fault that the balloon popped.",
        "A crack along the fault showed in the clay model.",
    ),
    166: (
        "The fearless kitten climbed the tallest bookshelf at home.",
        "A fearless goalie blocked every shot in the game.",
    ),
    167: (
        "Thanksgiving dinner felt like a feast of favorite foods.",
        "Ants held a feast around the dropped cookie crumbs.",
    ),
    168: (
        "The feeble flashlight beam barely lit the path.",
        "After the long hike, my legs felt feeble.",
    ),
    169: (
        "Please do not fidget during the quiet reading time.",
        "The puppy would fidget until we opened the door.",
    ),
    170: (
        "She finished in fifth place at the track meet.",
        "The fifth pancake was still warm on the plate.",
    ),
    171: (
        "The soda was fizzling in the picnic cups.",
        "The science volcano was fizzling over the tray.",
    ),
    172: (
        "Please flatten the empty boxes for recycling day.",
        "Rolling pins flatten dough for homemade pizza night.",
    ),
    173: (
        "Do not flaunt a new toy in a friend's face.",
        "Peacocks flaunt their bright feathers in the zoo yard.",
    ),
    174: (
        "The flutist played a gentle tune at the concert.",
        "Our neighbor is a flutist in the town band.",
    ),
    175: (
        "Bright foliage covered the hills in early autumn.",
        "We raked fallen foliage into a pile for jumping.",
    ),
    176: (
        "The foolproof recipe even worked for first-time bakers.",
        "A foolproof map led us around the nature trail.",
    ),
    177: (
        "A muddy footprint marked the clean kitchen floor.",
        "We found a deer footprint beside the forest stream.",
    ),
    178: (
        "The forestry class planted pine trees on the hill.",
        "A career in forestry can mean protecting local woods.",
    ),
    179: (
        "Finding the lost kitten felt like good fortune.",
        "The cookie held a fortune about kindness and friends.",
    ),
    180: (
        "Kids splashed near the fountain in the city park.",
        "A drinking fountain stands by the soccer field.",
    ),
    181: (
        "The farm kept fowl such as chickens and ducks.",
        "Wild fowl rested on the pond at sunrise.",
    ),
    182: (
        "The fragrant roses filled the kitchen with perfume.",
        "Fresh bread smelled fragrant as it cooled on the rack.",
    ),
    183: (
        "Dad framed her painting and hung it in the hall.",
        "The class photo was framed beside the trophy case.",
    ),
    184: (
        "We make frequent visits to the library after school.",
        "The garden stayed green after frequent rain all spring.",
    ),
    185: (
        "The messy room looked frightful after the sleepover.",
        "Mom called the burnt toast a frightful breakfast surprise.",
    ),
    186: (
        "Grandma mailed a fruitcake packed with nuts and cherries.",
        "We sliced the fruitcake for guests after the concert.",
    ),
    187: (
        "Knots in yarn can frustrate even a patient knitter.",
        "Missing the bus may frustrate you on a rainy morning.",
    ),
    188: (
        "Use a funnel to pour juice into the small bottle.",
        "Rainwater rushed through a funnel into the barrel.",
    ),
    189: (
        "New furniture arrived for the reading corner at school.",
        "We dusted the furniture before company came for dinner.",
    ),
    190: (
        "The fussy toddler refused every vegetable except carrots.",
        "A fussy cat ignored the new brand of food.",
    ),
    191: (
        "In the future I want to study ocean animals.",
        "Saving coins now helps your future trip to camp.",
    ),
    192: (
        "The cook worked in the galley of the small boat.",
        "We toured the galley while visiting the museum ship.",
    ),
    193: (
        "Bikes are stored in the garage beside the rakes.",
        "Dad parked the van in the garage after soccer.",
    ),
    194: (
        "Fresh garlic made the pasta sauce smell wonderful.",
        "We planted garlic cloves in the fall garden.",
    ),
    195: (
        "Each winter garment hung on a hook by the door.",
        "The costume garment needed a button before the play.",
    ),
    196: (
        "The gatekeeper opened the park for morning walkers.",
        "A friendly gatekeeper checked tickets at the fair.",
    ),
    197: (
        "A generous neighbor shared extra tomatoes from her garden.",
        "He was generous with compliments after the class concert.",
    ),
    198: (
        "Use a gentle hand when you hold the baby chick.",
        "A gentle breeze cooled us on the playground.",
    ),
    199: (
        "The story described the gentry living on a quiet estate.",
        "Our history book said the gentry owned much farmland.",
    ),
    200: (
        "Wash hands to keep the snack table germfree.",
        "The nurse kept her tools in a germfree tray.",
    ),
    201: (
        "The toddler spoke cheerful gibberish to her stuffed bear.",
        "Without the code, the message looked like gibberish.",
    ),
    202: (
        "A gigantic pumpkin sat on the porch at Halloween.",
        "The museum had a gigantic model of a whale.",
    ),
    203: (
        "Fresh ginger added zip to the homemade cookies.",
        "We grated ginger into the soup on a cold night.",
    ),
    204: (
        "The glassblower shaped a blue vase at the fair.",
        "We watched a glassblower make an ornament from hot glass.",
    ),
    205: (
        "A glimmer of sunlight reached the forest floor.",
        "We saw a glimmer of the lake through the trees.",
    ),
    206: (
        "The glossy magazine showed photos of garden birds.",
        "She brushed her pony until its coat looked glossy.",
    ),
    207: (
        "The soccer ball bounced off the goalpost and out.",
        "Volunteers painted each goalpost before the Saturday game.",
    ),
    208: (
        "The goatherd led the animals down the rocky path.",
        "A young goatherd waved from the hillside pasture.",
    ),
    209: (
        "A goose honked as it crossed the park lawn.",
        "We fed the goose cracked corn beside the pond.",
    ),
    210: (
        "A road grader smoothed the dirt path after rain.",
        "The fourth grader carried her project into the gym.",
    ),
    211: (
        "We had to grapple with a tricky math puzzle.",
        "The class had to grapple with a stuck tent zipper.",
    ),
    212: (
        "We gratefully accepted extra pencils from a kind classmate.",
        "The hikers gratefully drank cold water at the fountain.",
    ),
    213: (
        "Our shoes crunched on gravel along the driveway.",
        "We spread gravel along the garden path on Saturday.",
    ),
    214: (
        "In science we learned gravity pulls a ball back down.",
        "In science we measured gravity with a simple drop test.",
    ),
    215: (
        "Pancakes sizzled on the griddle every Sunday morning.",
        "The camp cook used a griddle for toasted sandwiches.",
    ),
    216: (
        "It is kind to grieve with a friend who is sad.",
        "We grieve when a favorite tree is cut down.",
    ),
    217: (
        "Grandpa called the bright socks groovy and laughed.",
        "The band played a groovy song at the picnic.",
    ),
    218: (
        "Stay behind the guardrail when you view the canyon.",
        "A new guardrail was added along the school driveway.",
    ),
    219: (
        "He felt guilt after hiding his sister's crayons.",
        "Sharing the last cookie took away her guilt.",
    ),
    220: (
        "The gummy candy stuck to my back teeth.",
        "Fresh pine sap felt gummy on our fingers.",
    ),
    221: (
        "Bright student artwork covers the hallway outside our classroom.",
        "Our dog naps in the hallway near the kitchen.",
    ),
    222: (
        "Please drop the towels in the hamper after your bath.",
        "Dirty uniforms went into the hamper after the game.",
    ),
    223: (
        "The hamster stuffed its cheeks with sunflower seeds.",
        "Our class hamster slept in a nest of shredded paper.",
    ),
    224: (
        "The toy officer set a plastic handcuff on the table.",
        "A costume handcuff came with the detective dress-up kit.",
    ),
    225: (
        "A brown hare hopped across the snowy field.",
        "We spotted a hare eating clover near the garden.",
    ),
    226: (
        "The choir sang in harmony during the winter concert.",
        "Friends work in harmony when they share art supplies.",
    ),
    227: (
        "She plucked the harp for the school talent show.",
        "A golden harp stood on the museum's music floor.",
    ),
    228: (
        "A hasty lunch left no time for an apple.",
        "Those hasty steps on ice can make you slip.",
    ),
    229: (
        "A hawk circled above the open soccer field.",
        "We watched a hawk from the nature-center window.",
    ),
    230: (
        "The headstrong pony refused to leave the shady oak.",
        "A headstrong toddler insisted on wearing two different shoes.",
    ),
    231: (
        "The peach pie tasted heavenly after the long hike.",
        "A heavenly breeze cooled the porch at sunset.",
    ),
    232: (
        "Measure the height of the sunflower each Friday.",
        "The roller coaster's height made my brother cheer.",
    ),
    233: (
        "Family recipes are part of our heritage at holidays.",
        "The festival celebrated the town's heritage with music.",
    ),
    234: (
        "A tall hickory tree dropped nuts on the trail.",
        "Dad used hickory chips while grilling corn on Saturday.",
    ),
    235: (
        "We drove on the highway to reach the state park.",
        "A wide highway runs past the soccer complex.",
    ),
    236: (
        "Our history lesson covered the first moon landing.",
        "Grandma's photo album holds the history of our farm.",
    ),
    237: (
        "Bees returned to the hive as evening arrived.",
        "The farmer showed us a hive behind the orchard.",
    ),
    238: (
        "Painting rocks is my favorite hobby after homework.",
        "His hobby is building model boats in the garage.",
    ),
    239: (
        "Our civics book defined homicide as a serious crime.",
        "The news used homicide as a formal legal word.",
    ),
    240: (
        "Your honesty about a mistake earns respect from teachers.",
        "Friendship grows when honesty is part of every talk.",
    ),
    241: (
        "Our family stayed in a hotel near the beach.",
        "The team bus stopped at a hotel after the meet.",
    ),
    242: (
        "Grandpa's hound slept beside the porch steps.",
        "A brown hound trotted along the hiking path.",
    ),
    243: (
        "In the story, a housemaid opened the shutters at dawn.",
        "The play's housemaid carried a tray of teacups.",
    ),
    244: (
        "I had a hunch the missing sock was in the dryer.",
        "Sit up tall and do not hunch over your desk.",
    ),
    245: (
        "We went hunting for pinecones in the park.",
        "The class went hunting for library books about frogs.",
    ),
    246: (
        "She cleared every hurdle in the track meet.",
        "A fallen log became a hurdle on the trail.",
    ),
    247: (
        "We hurried to the bus before the rain began.",
        "He hurried through breakfast to make the soccer carpool.",
    ),
    248: (
        "The slow waves had a hypnotic sound on the beach.",
        "Soft rain made a hypnotic rhythm on the roof.",
    ),
    249: (
        "A huge iceberg floated in the cold polar sea.",
        "The science video compared an iceberg to a floating mountain.",
    ),
    250: (
        "The pond held a clear image of the surrounding trees.",
        "We printed an image of the class garden.",
    ),
    251: (
        "A foggy lens can impair your view of the birds.",
        "Loud noise may impair your focus during a test.",
    ),
    252: (
        "Local grocers import bananas from farms far away.",
        "Our town will import extra sand for the playground.",
    ),
    253: (
        "Kind manners will impress visitors at the school play.",
        "The mural will impress families on open-house night.",
    ),
    254: (
        "The seedling grew an inch after one week of rain.",
        "Move the chair an inch so the door can open.",
    ),
    255: (
        "Extra watering will increase the height of the beans.",
        "Daily drills can increase your speed on the running track.",
    ),
    256: (
        "The cake was indeed as tasty as it looked.",
        "Spring had indeed arrived when the robins returned.",
    ),
    257: (
        "Use the index at the back of the science book.",
        "Mom checked the cookbook index for a pancake recipe.",
    ),
    258: (
        "A small cut can become an infection without a bandage.",
        "The nurse talked about infection and washing hands well.",
    ),
    259: (
        "Please inform the teacher if you forgot your lunch.",
        "Signs inform hikers about the length of each trail.",
    ),
    260: (
        "The nurse will inject the vaccine in my arm.",
        "Cooks inject flavor into the turkey with a special tool.",
    ),
    261: (
        "Be careful not to injure your ankle during soccer.",
        "A loose rug can injure someone who is in a hurry.",
    ),
    262: (
        "I had an inkling that rain would spoil the picnic.",
        "She had no inkling the surprise party was for her.",
    ),
    263: (
        "Type your input on the computer for the class poll.",
        "The coach asked for input about Saturday's game time.",
    ),
    264: (
        "We will inscribe names on the class time capsule.",
        "Artists inscribe a tiny mark on the pottery base.",
    ),
    265: (
        "We played indoors instead when thunder rolled nearby.",
        "Have fruit instead of candy after the soccer game.",
    ),
    266: (
        "Coaches instruct players before the first whistle blows.",
        "Recipes instruct you to stir until the batter is smooth.",
    ),
    267: (
        "Her interest in birds began after a park walk.",
        "Saving coins in a jar can earn interest at the bank.",
    ),
    268: (
        "Please interpret this graph for the rest of the class.",
        "Guides interpret the canyon's rock layers for visitors.",
    ),
    269: (
        "Please introduce your guest to the rest of the class.",
        "Farmers will introduce a new apple at the market.",
    ),
    270: (
        "We will invite neighbors to the backyard movie night.",
        "Please invite a partner to join your science group.",
    ),
    271: (
        "Fold the paper inward to make a sharp crease.",
        "The snails pulled inward when we touched their shells.",
    ),
    272: (
        "We learned an Irish dance for the spring festival.",
        "Grandma baked Irish soda bread on Saturday morning.",
    ),
    273: (
        "Each item on the picnic table belonged in the basket.",
        "The lost-and-found item was a striped wool hat.",
    ),
    274: (
        "The piano keys were a creamy ivory color.",
        "She wore an ivory ribbon in her hair for pictures.",
    ),
    275: (
        "He jabbed the straw into the juice box.",
        "She jabbed the needle through the thick cloth.",
    ),
    276: (
        "A muddy jackboot stood by the farmhouse door.",
        "The costume included a tall jackboot for the play.",
    ),
    277: (
        "The janitor mopped the cafeteria after lunch period.",
        "Our school janitor watered the plants in the hallway.",
    ),
    278: (
        "A noisy jay scolded us from the oak branch.",
        "We spotted a jay stealing peanuts from the feeder.",
    ),
    279: (
        "She wore a jazzy hat to the school talent show.",
        "The band played a jazzy tune at the picnic.",
    ),
    280: (
        "Please do not jeer when a teammate misses a shot.",
        "Kind fans will not jeer at the visiting team.",
    ),
    281: (
        "I wrote in my journal about the zoo trip.",
        "Our class journal records the weather each morning.",
    ),
    282: (
        "The mechanic wore a blue jumpsuit in the garage.",
        "Her sparkly jumpsuit was ready for the dance recital.",
    ),
    283: (
        "The kennel had clean beds for every visiting dog.",
        "We built a shady kennel beside the back porch.",
    ),
    284: (
        "Enter the code on the keypad to open the library.",
        "The toy cash register had a colorful keypad.",
    ),
    285: (
        "One extra keystroke changed the whole typed sentence.",
        "Slow down each keystroke when you learn to type.",
    ),
    286: (
        "Please speak kindly to everyone in the lunch line.",
        "A neighbor kindly returned our escaped chicken today.",
    ),
    287: (
        "Pack a knapsack with fruit for the nature walk.",
        "His knapsack bounced as he climbed the hill.",
    ),
    288: (
        "Winter knitwear hung on the hooks by the door.",
        "Grandma's knitwear kept us warm at the football game.",
    ),
    289: (
        "Turn the knob slowly to open the garden gate.",
        "A brass knob decorated each drawer in the kitchen.",
    ),
    290: (
        "Dad called himself a kook for wearing mismatched socks.",
        "The friendly kook at the fair juggled rubber chickens.",
    ),
    291: (
        "Grandma's lace tablecloth came out for Sunday dinner.",
        "She learned to lace her skates before ice time.",
    ),
    292: (
        "A lantern lit our path back to the cabin.",
        "We hung a paper lantern for the backyard party.",
    ),
    293: (
        "The tiny lapdog rode in a basket on the train.",
        "Grandma's lapdog snored during the movie at home.",
    ),
    294: (
        "A beetle larva lived under the rotting log.",
        "We found a larva on the underside of a tomato leaf.",
    ),
    295: (
        "Please carry the laundry basket to the washing machine.",
        "Wet laundry flapped on the line in the breeze.",
    ),
    296: (
        "Wash your hands in the lavatory before lunch.",
        "The train lavatory had a tiny sink and mirror.",
    ),
    297: (
        "We planted lavender beside the sunny garden path.",
        "The soap smelled like lavender after our bath.",
    ),
    298: (
        "Too much laziness will not help you finish the puzzle.",
        "Weekend laziness ended when friends called us outside.",
    ),
    299: (
        "A garden leaflet listed plants that attract butterflies well.",
        "We handed a leaflet about the bake sale to neighbors.",
    ),
    300: (
        "A small leakage under the sink wet the cabinet.",
        "The tent leakage left a damp spot on my sleeping bag.",
    ),
}

FORBIDDEN = [
    r"\bspell\b",
    r"\bspelling\b",
    r"\bpronouncer\b",
    r"\buil\b",
    r"\blisten\b",
    r"\bwrite it\b",
    r"\bletters\b",
    r"\bword list\b",
    r"\bpractice round\b",
    r"\bscreen\b",
]


def contains_exact(sentence: str, word: str) -> bool:
    return re.search(rf"(?<![A-Za-z]){re.escape(word)}(?![A-Za-z])", sentence) is not None


def main() -> None:
    source = json.loads(SRC.read_text(encoding="utf-8"))
    words = {item["id"]: item["word"] for item in source if 1 <= item["id"] <= 300}
    notes = {item["id"]: item.get("note") for item in source if 1 <= item["id"] <= 300}

    missing = [i for i in range(1, 301) if i not in PAIRS]
    extra = sorted(set(PAIRS) - set(range(1, 301)))
    if missing or extra:
        raise SystemExit(f"id gaps: missing={missing[:20]} extra={extra[:20]}")

    errors = []
    out = []
    for i in range(1, 301):
        word = words[i]
        s1, s2 = PAIRS[i]
        rec = {"id": i, "word": word, "sentence1": s1, "sentence2": s2}
        out.append(rec)
        for label, sent in (("sentence1", s1), ("sentence2", s2)):
            n = len(sent.split())
            if not (8 <= n <= 18):
                errors.append(f"{i} {word} {label} wordcount={n}: {sent}")
            if not sent[:1].isupper():
                errors.append(f"{i} {word} {label} not capitalized: {sent}")
            if not sent.endswith("."):
                errors.append(f"{i} {word} {label} no period: {sent}")
            if sent.endswith("?"):
                errors.append(f"{i} {word} {label} question: {sent}")
            if not contains_exact(sent, word):
                errors.append(f"{i} {word} {label} missing exact word: {sent}")
            low = sent.lower()
            for pat in FORBIDDEN:
                if re.search(pat, low):
                    errors.append(f"{i} {word} {label} forbidden {pat}: {sent}")
            if s1 == s2:
                errors.append(f"{i} {word} duplicate sentences")

    if errors:
        print("ERRORS", len(errors))
        print("\n".join(errors[:80]))
        raise SystemExit(1)

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(out)} objects to {OUT}")
    print("notes in range:", {i: notes[i] for i in range(1, 301) if notes[i]})


if __name__ == "__main__":
    main()
