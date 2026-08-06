const ENGLISH_TEXTS = {
  easy: [
    "the quick brown fox jumps over the lazy dog",
    "she sells sea shells by the sea shore on a sunny day",
    "practice makes a man perfect so keep typing every day",
    "reading books is a very good habit that helps you learn",
    "clean water is essential for all living beings on earth",
    "a small green bird was sitting on the wooden branch",
    "the sun rises in the east and sets in the west",
    "we should always help our friends when they are in need",
    "music has the power to make us feel happy and relaxed",
    "i love to eat fresh fruits and green vegetables daily"
  ],
  medium: [
    "In 2026, technology has become an inseparable part of our lives; however, one must maintain balance.",
    "The atmospheric pressure at sea level is about 101.3 kPa, which is roughly equal to 14.7 psi.",
    "Did you know that the average human heart beats around 100,000 times a day? That is truly amazing!",
    "It's a long road ahead, but with determination and 100% effort, we can achieve our dreams.",
    "To succeed in life, one must work hard, stay focused, and learn from their mistakes (and failures).",
    "The price of the item was $45.99, but we got a 10% discount, saving us nearly five dollars.",
    "A journey of a thousand miles begins with a single step; remember to take that step today.",
    "Please send the email to contact@typingapp.com by 5:30 PM, and don't forget to CC the manager.",
    "The temperature dropped to -5 degrees last night, causing the water pipes to freeze instantly.",
    "Innovation distinguishes between a leader and a follower, as Steve Jobs once remarked."
  ],
  hard: [
    "The Quick-Brown-Fox [v1.0] jumped over the 'lazy' dog's tail @ 45mph, generating a force of ~9.8 N/kg!",
    "Is it true that 2 + 2 = 4? Yes, but in binary (base-2), we write it as 10 + 10 = 100. Fascination!",
    "The CPU's clock speed reached 4.2 GHz (boosted), consuming ~95W of power at a temperature of 72C.",
    "Regex pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/ is used for email validation in JS.",
    "According to the survey, 78.4% of developers prefer Dark Mode (VS Code), while 21.6% prefer Light Mode.",
    "The price index fluctuated wildly: gold rose by +2.5% ($1,950/oz), while silver fell by -1.8% ($23.50/oz).",
    "Syntax Error on line #42: unexpected token ';' at character position 18 (near 'const x = null').",
    "We need to execute: npm run build -- --env=production --port=8080 --verbose && echo \"Done!\"",
    "The complex formula (a + b)^n = sum_{k=0}^n (n choose k) a^{n-k} b^k is known as the Binomial Theorem.",
    "The password must contain: a-z, A-Z, 0-9, and special chars like !@#$%^&*()_+{}[]:;\"'<>,.?/|~`."
  ],
  long: [
    "The history of typing dates back to the late nineteenth century when Christopher Sholes patented the first commercial typewriter. To prevent physical typebars from jamming, Sholes designed the QWERTY keyboard layout, arranging commonly typed letter pairs farther apart. Over time, as typing evolved from mechanical levers to electronic membranes, the layout persisted despite competing designs like Dvorak and Colemak. Today, typing is a vital foundational skill for communication, education, and professional growth globally.",
    "Space exploration has captured human imagination for decades, beginning with early orbital satellites and culminating in plans for manned missions to Mars. The red planet presents extreme technological hurdles, including long-term radiation exposure, thin atmospheric conditions, and sub-zero temperatures. Astronauts must rely on advanced life support systems, closed-loop recycling, and automated habitats powered by solar energy. Exploring Mars will help scientists understand the history of our solar system and the possibilities of sustaining human life on other celestial bodies.",
    "Artificial intelligence has rapidly transitioned from theoretical research to practical applications across diverse industries. Machine learning models process vast amounts of unstructured data to recognize complex pattern variations, enabling autonomous driving, speech transcription, and medical diagnosis support. However, this technology raises significant ethical considerations, including data privacy preservation, algorithmic bias mitigation, and workforce displacement concerns. Addressing these challenges requires collaborative frameworks between computer scientists, policymakers, and ethicists globally.",
    "The ancient Library of Alexandria was once the center of intellectual life in the Mediterranean region, housing thousands of papyrus scrolls containing scientific, philosophical, and literary knowledge. Scholars from various civilizations gathered there to study mathematics, astronomy, grammar, and medicine. Although the library was tragically destroyed by fires over centuries, its legacy remains a symbol of human quest for knowledge. Modern digital archives now strive to preserve our collective cultural heritage, ensuring free information access for future generations.",
    "Environmental sustainability has emerged as a critical global priority due to rising carbon emissions and plastic pollution. Transitioning to renewable energy sources like wind, solar, and geothermal power is essential to mitigate climate change effects. On an individual level, adopting zero-waste habits, reducing energy consumption, and supporting local organic farming can make a substantial cumulative difference. Protecting biodiversity, restoring natural forests, and conserving ocean habitats are vital steps to ensure a healthy and stable planet for all living organisms."
  ]
};

const HINDI_TEXTS = {
  easy: [
    "राम घर पर रहकर अपना पाठ याद कर रहा है",
    "सदा सच बोलना चाहिए क्योंकि सच बोलने से मान बढ़ता है",
    "कमल तालाब में खिलता है और वह बहुत सुंदर दिखता है",
    "लड़का मैदान में गेंद से खेल रहा है और खुश है",
    "हमें समय पर अपना काम पूरा कर लेना चाहिए",
    "आज का दिन बहुत अच्छा और सुहावना मौसम वाला है",
    "पेड़ हमें फल और ठंडी छाया प्रदान करते हैं",
    "किताब पढ़ना एक बहुत ही अच्छी आदत होती है",
    "नदी का पानी साफ और पीने लायक होना चाहिए",
    "आकाश में बादल छाए हुए हैं और बारिश होने वाली है"
  ],
  medium: [
    "भारत एक विशाल देश है, यहाँ अनेक भाषाएँ और बोलियाँ बोली जाती हैं।",
    "आज का तापमान ३५ डिग्री सेल्सियस है, जो सामान्य से थोड़ा अधिक है।",
    "समय का सदुपयोग करना सीखें; क्योंकि बीता हुआ समय कभी वापस नहीं आता।",
    "क्या आप जानते हैं कि कंप्यूटर हमारे दैनिक जीवन का एक महत्वपूर्ण हिस्सा बन चुका है?",
    "मेहनत करने वालों की कभी हार नहीं होती, इसलिए हमें निरंतर प्रयास करते रहना चाहिए।",
    "सफलता पाने के लिए कठिन परिश्रम, धैर्य और सही दिशा की आवश्यकता होती है (हमेशा याद रखें)।",
    "ईमानदारी सबसे अच्छी नीति है (Honesty is the best policy), जो हमें सही मार्ग दिखाती है।",
    "कृपया अपनी ईमेल आईडी contact@typingapp.in पर भेजें, और मैनेजर को सूचित करना न भूलें।",
    "आज बाजार में सोने का भाव १.५% बढ़ गया, जिससे ग्राहकों में हलचल मच गई।",
    "विद्यार्थियों को अपने शिक्षकों का आदर करना चाहिए और उनकी बातों को ध्यान से सुनना चाहिए।"
  ],
  hard: [
    "वैज्ञानिकों ने अंतरिक्ष में एक नवीन ग्रह (Planet-9) की खोज की है, जो पृथ्वी से लगभग ४.५ प्रकाश-वर्ष दूर है!",
    "गणितीय समीकरण: (a + b)² = a² + 2ab + b² का उपयोग बीजगणित में विस्तृत रूप से किया जाता है।",
    "ऋण, ऋतु, ऋषि और ऋग्वेद जैसे संस्कृत निष्ठ शब्दों का हिंदी में उपयोग आज भी श्रद्धापूर्वक किया जाता है।",
    "संविधान के अनुच्छेद ३४३(१) के अनुसार: संघ की राजभाषा 'हिंदी' और लिपि 'देवनागरी' होगी।",
    "क्या २ + २ = ४ होता है? हाँ, परंतु बाइनरी (कंप्यूटर भाषा) में इसे १० + १० = १०० लिखा जाता है।",
    "कार्यालयीन कार्यों में शुचिता, पारदर्शिता और समयबद्धता (Punctuality) अत्यंत आवश्यक पहलू हैं।",
    "डॉ. अब्दुल कलाम का दृष्टिकोण (Vision-2020) भारत को एक विकसित और समृद्ध राष्ट्र बनाने का था।",
    "कंप्यूटर प्रोग्रामिंग में त्रुटियों (Bugs) को ढूंढकर उन्हें ठीक करने की प्रक्रिया को 'डीबगिंग' कहा जाता है।",
    "नवीन औद्योगिक नीतियों के कार्यान्वयन हेतु सरकार ने ५,००0 करोड़ रुपये का विशेष बजट स्वीकृत किया है।",
    "सच्चे मित्र की पहचान विपत्ति के समय होती है; जैसा कि कहा गया है: 'धीरज धरम मित्र अरु नारी, आपद काल परखिए चारी।'"
  ],
  long: [
    "भारतीय संस्कृति विश्व की सबसे प्राचीन और समृद्ध संस्कृतियों में से एक है। इसकी विविधता में एकता की अनूठी विशेषता पूरी दुनिया को आकर्षित करती है। हमारे देश में विभिन्न धर्मों, भाषाओं और त्योहारों का संगम देखने को मिलता है, जो आपसी प्रेम और भाईचारे को बढ़ावा देता है। गंगा-जमुनी तहजीब और वसुधैव कुटुम्बकम् का सिद्धांत हमारी संस्कृति का मूल आधार है। हमें अपनी ऐतिहासिक विरासत, कला और मूल्यों का संरक्षण करना चाहिए ताकि आने वाली पीढ़ियां भी इस महान संस्कृति पर गर्व कर सकें और इसका प्रचार-प्रसार कर सकें।",
    "पर्यावरण संरक्षण आज के समय की सबसे बड़ी आवश्यकता बन गया है। बढ़ते प्रदूषण, वनों की कटाई और प्लास्टिक के अत्यधिक उपयोग ने हमारी पृथ्वी के संतुलन को बिगाड़ दिया है। जलवायु परिवर्तन के कारण मौसम चक्र बदल रहा है और प्राकृतिक आपदाओं की संख्या में निरंतर वृद्धि हो रही है। इस समस्या के समाधान के लिए हमें अधिक से अधिक वृक्षारोपण करना होगा, जल स्रोतों को साफ रखना होगा और नवीकरणीय ऊर्जा स्रोतों जैसे सौर ऊर्जा का उपयोग बढ़ाना होगा। पृथ्वी की सुरक्षा हमारा सामूहिक उत्तरदायित्व है।",
    "डिजिटल क्रांति ने भारत के ग्रामीण क्षेत्रों में अभूतपूर्व बदलाव लाया है। आज इंटरनेट के माध्यम से गांवों में रहने वाले किसान सीधे मौसम की जानकारी, फसलों के दाम और आधुनिक खेती के तरीकों के बारे में जान सकते हैं। इसके अतिरिक्त, ऑनलाइन शिक्षा और डिजिटल बैंकिंग सेवाओं ने ग्रामीण क्षेत्रों में अवसरों के नए द्वार खोले हैं। तकनीक के इस विस्तार से न केवल लोगों का जीवन स्तर सुधरा है, बल्कि गांवों और शहरों के बीच की दूरी भी कम हुई है। यह विकास डिजिटल समावेशन की दिशा में एक बड़ा कदम है।",
    "स्वस्थ शरीर में ही स्वस्थ मस्तिष्क का निवास होता है। आधुनिक जीवनशैली में तनाव और गलत खान-पान के कारण लोगों का स्वास्थ्य प्रभावित हो रहा है। नियमित व्यायाम, संतुलित आहार और पर्याप्त नींद हमारे शरीर को निरोगी रखने के लिए आवश्यक हैं। योग और ध्यान करने से न केवल मानसिक शांति प्राप्त होती है बल्कि हमारी रोग प्रतिरोधक क्षमता भी बढ़ती है। हमें जंक फूड के सेवन से बचना चाहिए और अपने दैनिक जीवन में प्राकृतिक उत्पादों को प्राथमिकता देनी चाहिए ताकि हम एक ऊर्जावान और सुखी जीवन व्यतीत कर सकें।",
    "शिक्षा मनुष्य के सर्वांगीण विकास का मुख्य साधन है। यह न केवल हमें साक्षर बनाती है बल्कि हमारे सोचने-समझने की क्षमता और नैतिक मूल्यों का भी विकास करती है। एक शिक्षित समाज ही देश की प्रगति और विकास का मार्ग प्रशस्त करता है। आधुनिक युग में डिजिटल शिक्षा ने सीखने के तरीकों को और भी सुगम बना दिया है। आज हर वर्ग के लोग घर बैठे ही ज्ञान अर्जन कर सकते हैं। हमें देश के प्रत्येक बच्चे तक गुणवत्तापूर्ण शिक्षा पहुँचाने का प्रयास करना चाहिए ताकि कोई भी ज्ञान के प्रकाश से वंचित न रह सके।"
  ]
};

// Expand paragraphs to make sure we have plenty of practice data (at least 15 in each, adding more to reach 90 total)
ENGLISH_TEXTS.easy.push(
  "a quick decision can save you a lot of time later",
  "please shut the window because the wind is too cold",
  "we saw a large elephant at the zoo yesterday afternoon",
  "she loves to play the piano in her free time every day",
  "he bought a new bicycle with a blue water bottle holder"
);

ENGLISH_TEXTS.medium.push(
  "Self-confidence is the first secret of success; without it, we can achieve very little in our careers.",
  "The restaurant check came to $87.50, and we left a 15% tip for the excellent service.",
  "Could you please explain how to build a responsive website using clean HTML & CSS variables?",
  "Modern web design focuses on user experience (UX), layout simplicity, and micro-interactions.",
  "In the year 2026, artificial intelligence is widely used to assist in writing code and design."
);

ENGLISH_TEXTS.hard.push(
  "The standard config file config.json contains: \"debug\": true, \"retryCount\": 5, \"timeout\": 15000.",
  "Error: connection to 'db_main' failed (IP: 192.168.1.105, Port: 5432) after 3 attempts.",
  "Using ES6 arrow functions like `const add = (a, b) => a + b;` makes Javascript code compact.",
  "The coordinates of the location were set to 28.6139 degrees N and 77.2090 degrees E (New Delhi).",
  "Typing test speed metrics: WPM = (Total Characters / 5) / Time (in minutes). Accuracy = (Correct / Total) * 100."
);

HINDI_TEXTS.easy.push(
  "नियमित व्यायाम करने से हमारा शरीर स्वस्थ और निरोगी रहता है",
  "चिड़िया चहक रही है और सुबह की ताजी हवा बह रही है",
  "सड़क पर हमेशा बाईं ओर चलना चाहिए ताकि दुर्घटना न हो",
  "हमें अपने माता पिता की सेवा और आदर करना चाहिए",
  "आम को फलों का राजा कहा जाता है क्योंकि यह बहुत मीठा होता है"
);

HINDI_TEXTS.medium.push(
  "भारतीय संस्कृति अत्यंत प्राचीन और गौरवशाली है, जो वसुधैव कुटुम्बकम् के सिद्धांत पर आधारित है।",
  "विद्यालय के पुस्तकालय में ५,००० से अधिक पुस्तकें उपलब्ध हैं, जिनका लाभ सभी छात्र उठा सकते हैं।",
  "इंटरनेट के माध्यम से हम दुनिया के किसी भी कोने से पलक झपकते ही जानकारी प्राप्त कर सकते हैं।",
  "पर्यावरण संरक्षण के लिए हमें अधिक से अधिक पेड़ लगाने चाहिए और प्लास्टिक का उपयोग बंद करना चाहिए।",
  "योग अभ्यास करने से न केवल शारीरिक स्वास्थ्य में सुधार होता है, बल्कि मानसिक शांति भी प्राप्त होती है।"
);

HINDI_TEXTS.hard.push(
  "उद्घाटन समारोह में मुख्य अतिथि ने अपने वक्तव्य में कहा, \"युवाओं का उद्यमिता (Entrepreneurship) की ओर झुकाव प्रशंसनीय है।\"",
  "राष्ट्रीय सुरक्षा परिषद (NSC) की बैठक में सीमावर्ती क्षेत्रों की सुरक्षा व्यवस्था की विस्तृत समीक्षा की गई।",
  "पारिस्थितिक तंत्र (Ecosystem) में जैव विविधता का संरक्षण अत्यंत अपरिहार्य एवं महत्वपूर्ण विषय है।",
  "दूरसंचार क्षेत्र में ५जी (5G) के आगमन के उपरांत डेटा ट्रांसमिशन दर में लगभग १० गुना वृद्धि दर्ज की गई है।",
  "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन (गीता श्लोक), कर्म करने के महत्व को अत्यंत गहराई से प्रतिपादित करता है।"
);

const ENGLISH_LESSONS = [
  {
    title: "Lesson 1: Home Row Index Keys (f, j, g, h)",
    text: "f j g h f j g h f g h j j h g f f g f g j h j h ghgh jhjh fgfg"
  },
  {
    title: "Lesson 2: Home Row Left Hand (a, s, d, f)",
    text: "a s d f a s d f f d s a asdf asdf fda sda fda a s d f f d s a"
  },
  {
    title: "Lesson 3: Home Row Right Hand (j, k, l, ;)",
    text: "j k l ; j k l ; ; l k j jkl; jkl; ;lkj ;lkj j k l ; ; l k j"
  },
  {
    title: "Lesson 4: Home Row Combined (asdf jkl;)",
    text: "asdf jkl; asdf jkl; a; s; d; f; j; k; l; ask fad lad sad flask dad fall"
  },
  {
    title: "Lesson 5: Top Row Left Hand (q, w, e, r, t)",
    text: "q w e r t q w e r t t r e w q qwer qwer qwert rewq wet red tea tree"
  },
  {
    title: "Lesson 6: Top Row Right Hand (y, u, i, o, p)",
    text: "y u i o p y u i o p p o i u y uiop uiop yuyi poup you port prior toy"
  },
  {
    title: "Lesson 7: Top Row Combined (qwer uiop)",
    text: "qwer uiop qwer uiop power wire write outer trip report tire prior rot we"
  },
  {
    title: "Lesson 8: Bottom Row Keys (z, x, c, v, b, n, m, ,, ., /)",
    text: "z x c v b n m , . / zxcv m,./ zoom cave zero cone mock zebra van box"
  },
  {
    title: "Lesson 9: Shift Key Practice (Capital Letters)",
    text: "A S D F J K L Q W E R U I O P Z X C V M Apple Zero Queen King Jack"
  },
  {
    title: "Lesson 10: Numbers & Symbols (12345 67890)",
    text: "1 2 3 4 5 6 7 8 9 0 10 20 50 100 250 500 1000 911 411 999 123 456 789"
  }
];

const HINDI_LESSONS = [
  {
    title: "Lesson 1: Remington GAIL - Home Row Keys (क, म, त, ज...)",
    // keys: d (क), e (म), r (त), t (ज), k (ा), s (े)
    text: "क म त ज क म त ज का मा ता जा के मे ते जे काम मात जात जमा कम तम जम"
  },
  {
    title: "Lesson 2: Remington GAIL - Home Row Keys (ल, न, प, व, च...)",
    // keys: y (ल), u (न), i (प), o (व), p (च), l (स), ; (य)
    text: "ल न प व च स य ला ना पा वा चा सा या लाल नमन पवन वचन समय सरल सरस"
  },
  {
    title: "Lesson 3: Remington GAIL - Complete Home Row combined",
    text: "कमल पवन समय नमक चमन नमन जमन सरल सरस कमल पवन समय नमक चमन नमन"
  },
  {
    title: "Lesson 4: Remington GAIL - Vowel Matras & upper keys (ु, ू, ि, ी)",
    // keys: q (ु), w (ू), f (ि), h (ी)
    text: "कलम किला काली पीला मीठा जीत मन की बात सुंदर धूप चूहा मैना कैसा हैरान"
  },
  {
    title: "Lesson 5: Remington GAIL - Bottom Row Keys (ग, ब, अ, इ, द, उ)",
    // keys: x (ग), c (ब), v (अ), b (इ), n (द), m (उ)
    text: "गब बन अइ इब बब दम दर दस देव देशण गब बन अइ इब बब दम दर दस देव"
  },
  {
    title: "Lesson 6: Remington GAIL - Shift Key half characters (क्, म्, त्, ज्)",
    // Shift keys: D (क्), E (म्), R (त्), T (ज्), Y (ल्), U (न्), I (प्)
    text: "क्या म्याऊं त्याग ज्वाला न्याय प्यार व्यापार क्या म्याऊं त्याग ज्वाला न्याय"
  },
  {
    title: "Lesson 7: Remington GAIL - Complex conjuncts & reph/padas",
    text: "ऋण ऋतु ऋषि ऋग्वेद कार्य वर्ण धर्म मर्म राष्ट्र ड्रम ट्रक ट्राम ह्रास ह्रस्व"
  }
];

// Export layouts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ENGLISH_TEXTS, HINDI_TEXTS, ENGLISH_LESSONS, HINDI_LESSONS };
}
