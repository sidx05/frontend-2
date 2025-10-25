// src/app/api/news/route.ts  
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Article } from '@/models/Article';
import { Category } from '@/models/Category';
import { Settings } from '@/models/Settings';


// GET /api/news?lang=telugu&category=movies&page=1&limit=12 - Get filtered news
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    let limit = parseInt(searchParams.get('limit') || '0');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Determine default limit from settings when not explicitly provided
    if (!limit || isNaN(limit) || limit <= 0) {
      try {
        const settings = await Settings.findOne({}).lean();
        if (settings && (settings as any).maxArticlesPerPage) {
          limit = (settings as any).maxArticlesPerPage;
        }
      } catch (e) {
        console.warn('[api/news] Failed to read limit from settings:', e);
      }
      if (!limit || limit <= 0) limit = 12; // Fallback default
    }

    // Build query
    const query: any = {
      status: { $in: ['scraped', 'processed', 'published'] }
    };
    
    if (language && language !== 'all') {
      query.language = language;
    }
    
    // Build independent condition groups so we can AND them together
    const orConditions: any[] = []; // for search
    const andGroups: any[] = []; // combine category + search strictly

    // Category filter: handle both ObjectId and text-based categories
    if (category && category !== 'all') {
      const key = String(category).toLowerCase();
      
      // Check if the category parameter is an ObjectId (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(key);
      
      if (isObjectId) {
        // Direct ObjectId match
        andGroups.push({ $or: [ { category: key }, { categories: key } ] });
      } else {
        // Try to find category document first
      let catDocId: any = null;
      try {
        const catDoc: any = await Category.findOne({ key }).select('_id').lean();
        catDocId = catDoc && catDoc._id ? String(catDoc._id) : null;
      } catch {}

      if (catDocId) {
          // Match by ObjectId from Category collection
        andGroups.push({ $or: [ { category: catDocId }, { categories: catDocId } ] });
      } else {
          // Fallback: match by text (for articles with string categories)
          console.warn(`[api/news] Category not found for slug: ${key}, using text-based fallback`);
          
          // Special handling for "general" and "uncategorized" categories
          if (key === 'general' || key === 'uncategorized') {
            // For general/uncategorized category, we want articles that don't have specific categories
            // or articles that couldn't be categorized properly
            andGroups.push({
              $or: [
                { category: { $exists: false } },
                { category: null },
                { category: '' },
                { category: 'general' },
                { category: 'uncategorized' },
                { categories: { $exists: false } },
                { categories: { $size: 0 } },
                { categories: null }
              ]
            });
          } else {
            // For text-based categories, we need to find articles that would be categorized as this category
            // by smart detection. Since the database query can't do smart detection, we'll modify the query
            // to be more inclusive and then apply smart filtering in memory.
            
            // For text categories, we'll get all articles and filter them by smart detection
            // This means we need to remove the category filter from the database query
            // and handle it in the smart filtering step instead
            
            // Don't add any category filter to the database query for text categories
            // The smart filtering will handle this after the database query
            console.log(`[api/news] Using smart filtering for category: ${key}`);
          }
        }
      }
    }
    
    if (search) {
      orConditions.push(
        { title: { $regex: new RegExp(search, 'i') } },
        { summary: { $regex: new RegExp(search, 'i') } },
        { content: { $regex: new RegExp(search, 'i') } }
      );
    }
    
    // Combine conditions: category AND (optional) search
    if (orConditions.length > 0) andGroups.push({ $or: orConditions });
    if (andGroups.length > 0) query.$and = andGroups;
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Multilingual content-based categorization (hoisted)
    function computeCategoryFromText(title: string, summary: string, content: string, language?: string): string {
      const normalize = (str: string) =>
        (str || '')
          .toLowerCase()
          .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
          .replace(/[\p{P}\p{S}]/gu, ' ')         // punctuation/symbols
          .replace(/\s+/g, ' ')                    // collapse whitespace
          .trim();

      const text = normalize(`${title} ${summary} ${content}`);
      
      // Language normalization mapping
      const langMap: Record<string, string> = {
        'te': 'telugu',
        'ta': 'tamil', 
        'hi': 'hindi',
        'bn': 'bengali',
        'gu': 'gujarati',
        'mr': 'marathi',
        'en': 'english'
      };
      const normalizedLang = langMap[language?.toLowerCase() || ''] || language?.toLowerCase() || 'english';

      // Expandable multilingual dictionary
      const dict: Record<string, string[]> = {
        politics: [
          // English
          'politics','political','election','elections','minister','government','parliament','assembly','mla','mp','party','pm','president','congress','bjp','tdp','ysr','trs','aap','cabinet','opposition','vote','voting','campaign',
          // Telugu
          'రాజకీయ','రాజకీయం','రాజకీయాలు','రాజకీయాల','రాజకీయాల్లో','రాజకీయ నేత','రాజకీయ నేతలు','ఎన్నిక','ఎన్నికలు','ఎన్నికల్లో','మంత్రి','ప్రభుత్వ','సభ','సభ్యుడు','సభ్యులు','అసెంబ్లీ','శాసనసభ','లోక్‌సభ','రాజ్యసభ','పార్టీ','ముఖ్యమంత్రి','అధ్యక్షుడు','ఎంపీ','ఎంఎల్ఏ','నేత','నాయకుడు','ప్రతిపక్షం','ఓటు','ఓటింగ్','క్యాబినెట్',
          // Tamil
          'ராஜகியம்','ராஜகிய','தேர்தல்','அரசு','மந்திரி','பாராளுமன்றம்','சட்டமன்றம்','கட்சி','பிரதமர்','எம்எல்ஏ','எம்பி','எதிர்க்கட்சிகள்','வாக்கு','வாக்குப்பதிவு',
          // Hindi
          'राजनीति','चुनाव','मंत्री','सरकार','संसद','विधानसभा','पार्टी','मुख्यमंत्री','राष्ट्रपति','सांसद','विधायक','नेता','विपक्ष','मतदान','अभियान',
          // Bengali
          'রাজনীতি','নির্বাচন','মন্ত্রী','সরকার','সংসদ','বিধানসভা','দল','মুখ্যমন্ত্রী','রাষ্ট্রপতি','সাংসদ','বিধায়ক','নেতা','বিরোধী','ভোট','প্রচার',
          // Gujarati
          'રાજકારણ','ચૂંટણી','મંત્રી','સરકાર','સંસદ','વિધાનસભા','પક્ષ','મુખ્યમંત્રી','રાષ્ટ્રપતિ','સાંસદ','વિધાયક','નેતા','વિરોધી','મતદાન','અભિયાન',
          // Marathi
          'राजकारण','निवडणूक','मंत्री','सरकार','संसद','विधानसभा','पक्ष','मुख्यमंत्री','राष्ट्रपती','खासदार','आमदार','नेता','विरोधी','मतदान','मोहीम'
        ],
        sports: [
          // English
          'sports','sport','cricket','football','soccer','tennis','badminton','hockey','ipl','match','player','tournament','score','goal','winner','loser','series','league','cup',
          // Telugu (include common inflections)
          'క్రీడ','క్రీడలు','క్రీడల','క్రీడలలో','ఆట','ఆటలు','మ్యాచ్','మ్యాచ్‌లు','మ్యాచులు','ఫలితాలు','జట్టు','జట్లు','జట్టులో','ప్లేయర్','ప్లేయర్లు','ఆటగాడు','ఆటగాళ్లు','విజయం','ఓటమి','ర్యాంకింగ్','సిరీస్','లీగ్','కప్','క్రికెట్','ఫుట్బాల్','టెన్నిస్','బ్యాడ్మింటన్','హాకీ',
          // Tamil
          'விளையாட்டு','விளையாட்டுகள்','கிரிக்கெட்','கால்பந்து','டென்னிஸ்','பேட்மிண்டன்','ஹாக்கி','போட்டி','மேட்ச்','அணி','வீரர்','ஸ்கோர்','லீக்','கப்',
          // Hindi
          'खेल','क्रिकेट','फुटबॉल','टेनिस','बैडमिंटन','हॉकी','मैच','खिलाड़ी','टूर्नामेंट','स्कोर','गोल','विजेता','हारनेवाला','सीरीज','लीग','कप',
          // Bengali
          'খেলা','ক্রিকেট','ফুটবল','টেনিস','ব্যাডমিন্টন','হকি','ম্যাচ','খেলোয়াড়','টুর্নামেন্ট','স্কোর','গোল','বিজয়ী','পরাজিত','সিরিজ','লিগ','কাপ',
          // Gujarati
          'રમત','ક્રિકેટ','ફુટબોલ','ટેનિસ','બેડમિન્ટન','હોકી','મેચ','રમતવીર','ટુર્નામેન્ટ','સ્કોર','ગોલ','વિજેતા','હારનાર','સિરિઝ','લીગ','કપ',
          // Marathi
          'खेळ','क्रिकेट','फुटबॉल','टेनिस','बॅडमिंटन','हॉकी','सामना','खेळाडू','स्पर्धा','गोल','विजेता','हरलेला','मालिका','लीग','कप'
        ],
        entertainment: [
          // English
          'entertainment','movie','movies','film','cinema','actor','actress','director','trailer','song','review','bollywood','tollywood','kollywood','box office',
          // Telugu
          'సినిమా','చిత్రం','చలనచిత్రం','నటుడు','నటి','హీరో','హీరోయిన్','దర్శకుడు','ట్రైలర్','పాట','సాంగ్','సమీక్ష','రివ్యూ','బాక్సాఫీస్','బాక్స్ ఆఫీస్','టాలీవుడ్','బాలీవుడ్','కోలీవుడ్','వెబ్ సిరీస్','సీరియల్',
          // Tamil
          'பொழுதுபோக்கு','திரைப்படம்','சினிமா','நடிகர்','நடிகை','இயக்குனர்','டிரைலர்','பாடல்','விமர்சனம்','பாக்ஸ் ஆபிஸ்','காலிவுட்','கொலிவுட்','தொலைக்காட்சி',
          // Hindi
          'मनोरंजन','फिल्म','सिनेमा','अभिनेता','अभिनेत्री','निर्देशक','ट्रेलर','गाना','समीक्षा','बॉलीवुड','टॉलीवुड','कोलीवुड','बॉक्स ऑफिस',
          // Bengali
          'বিনোদন','চলচ্চিত্র','সিনেমা','অভিনেতা','অভিনেত্রী','পরিচালক','ট্রেইলার','গান','সমালোচনা','বলিউড','টলিউড','কলিউড','বক্স অফিস',
          // Gujarati
          'મનોરંજન','ફિલ્મ','સિનેમા','અભિનેતા','અભિનેત્રી','દિગ્દર્શક','ટ્રેલર','ગીત','સમીક્ષા','બોલીવુડ','ટોલીવુડ','કોલીવુડ','બોક્સ ઓફિસ',
          // Marathi
          'मनोरंजन','चित्रपट','सिनेमा','अभिनेता','अभिनेत्री','दिग्दर्शक','ट्रेलर','गाणे','समीक्षा','बॉलिवूड','टॉलिवूड','कोलिवूड','बॉक्स ऑफिस'
        ],
        technology: [
          // English
          'technology','tech','gadget','smartphone','mobile','ai','artificial intelligence','software','internet','robot','startup','app','update','chip','semiconductor',
          // Telugu
          'టెక్నాలజీ','సాంకేతికం','సాంకేతిక','గాడ్జెట్','మొబైల్','స్మార్ట్‌ఫోన్','కృత్రిమ మేధస్సు','ఎఐ','సాఫ్ట్‌వేర్','ఇంటర్నెట్','రోబోట్','స్టార్టప్','యాప్','అప్డేట్','చిప్',
          // Tamil
          'தொழில்நுட்பம்','டெக்','கேட்ஜெட்','ஸ்மார்ட்போன்','மொபைல்','கணினி','மென்பொருள்','இணையம்','ரோபோட்','ஸ்டார்ட்அப்','சிப்','புதுப்பிப்பு',
          // Hindi
          'तकनीक','गैजेट','स्मार्टफोन','मोबाइल','कृत्रिम बुद्धिमत्ता','सॉफ्टवेयर','इंटरनेट','रोबोट','स्टार्टअप','ऐप','अपडेट','चिप',
          // Bengali
          'প্রযুক্তি','গ্যাজেট','স্মার্টফোন','মোবাইল','কৃত্রিম বুদ্ধিমত্তা','সফটওয়্যার','ইন্টারনেট','রোবট','স্টার্টআপ','অ্যাপ','আপডেট','চিপ',
          // Gujarati
          'ટેકનોલોજી','ગેજેટ','સ્માર્ટફોન','મોબાઇલ','કૃત્રિમ બુદ્ધિ','સોફ્ટવેર','ઇન્ટરનેટ','રોબોટ','સ્ટાર્ટઅપ','એપ','અપડેટ','ચિપ',
          // Marathi
          'तंत्रज्ञान','गॅजेट','स्मार्टफोन','मोबाइल','कृत्रिम बुद्धिमत्ता','सॉफ्टवेअर','इंटरनेट','रोबोट','स्टार्टअप','अॅप','अपडेट','चिप'
        ],
        health: [
          // English
          'health','hospital','doctor','covid','vaccine','medical','fitness','disease','therapy','treatment','medicine',
          // Telugu
          'ఆరోగ్యం','ఆరోగ్య','ఆసుపత్రి','హాస్పిటల్','డాక్టర్','వ్యాక్సిన్','టీకా','వైద్యం','వ్యాధి','జబ్బు','చికిత్స','ఔషధం','ఫిట్‌నెస్',
          // Tamil
          'ஆரோக்கியம்','மருத்துவமனை','டாக்டர்','தடுப்பூசி','மருத்துவம்','நோய்','சிகிச்சை','மருந்து',
          // Hindi
          'स्वास्थ्य','अस्पताल','डॉक्टर','कोविड','टीका','चिकित्सा','फिटनेस','बीमारी','उपचार','दवा',
          // Bengali
          'স্বাস্থ্য','হাসপাতাল','ডাক্তার','কোভিড','টিকা','চিকিৎসা','ফিটনেস','রোগ','চিকিৎসা','ঔষধ',
          // Gujarati
          'સ્વાસ્થ્ય','હોસ્પિટલ','ડૉક્ટર','કોવિડ','વેક્સિન','દવા','ફિટનેસ','રોગ','ઉપચાર','દવા',
          // Marathi
          'आरोग्य','दवाखाना','डॉक्टर','कोविड','लस','वैद्यकीय','फिटनेस','रोग','उपचार','औषध'
        ],
        business: [
          // English
          'business','market','stock','share','company','finance','banking','economy','revenue','profit','startup','funding',
          // Telugu
          'వ్యాపారం','వ్యాపార','వ్యాపారవేత్త','వ్యాపారవేత్తలు','మార్కెట్','మార్కెట్లలో','స్టాక్','షేర్','షేర్లు','కంపెనీ','ఫైనాన్స్','బ్యాంకింగ్','ఆర్థిక','ద్రవ్యోల్బణం','ఆదాయం','లాభం','నష్టం','నష్టాలు',
          // Tamil
          'வணிகம்','சந்தை','பங்கு','நிறுவனம்','நிதி','வங்கி','பொருளாதாரம்','வருவாய்','லாபம்','நஷ்டம்','நிதியுதவி',
          // Hindi
          'व्यापार','बाजार','शेयर','कंपनी','वित्त','बैंकिंग','अर्थव्यवस्था','राजस्व','लाभ','स्टार्टअप','निधि',
          // Bengali
          'ব্যবসা','বাজার','শেয়ার','কোম্পানি','অর্থ','ব্যাংকিং','অর্থনীতি','রাজস্ব','লাভ','স্টার্টআপ','তহবিল',
          // Gujarati
          'વ્યવસાય','બજાર','શેર','કંપની','ફાઇનાન્સ','બેંકિંગ','અર્થતંત્ર','રાજસ્વ','લાભ','સ્ટાર્ટઅપ','ફંડિંગ',
          // Marathi
          'व्यवसाय','बाजार','शेअर','कंपनी','वित्त','बँकिंग','अर्थव्यवस्था','राजस्व','नफा','स्टार्टअप','निधी'
        ],
        education: [
          // English
          'education','exam','results','student','school','college','university','admission','scholarship',
          // Telugu
          'విద్య','పరీక్ష','ఫలితాలు','విద్యార్థి','పాఠశాల','కళాశాల','విశ్వవిద్యాలయం','దాఖలాలు','వేతనం',
          // Tamil
          'கல்வி','தேர்வு','முடிவுகள்','மாணவர்','பள்ளி','கல்லூரி','பல்கலைக்கழகம்','சேர்க்கை','உதவித்தொகை',
          // Hindi
          'शिक्षा','परीक्षा','परिणाम','छात्र','स्कूल','कॉलेज','विश्वविद्यालय','प्रवेश','छात्रवृत्ति',
          // Bengali
          'শিক্ষা','পরীক্ষা','ফলাফল','ছাত্র','স্কুল','কলেজ','বিশ্ববিদ্যালয়','ভর্তি','বৃত্তি',
          // Gujarati
          'શિક્ષણ','પરીક્ષા','પરિણામ','વિદ્યાર્થી','શાળા','કોલેજ','યુનિવર્સિટી','પ્રવેશ','છાત્રવૃત્તિ',
          // Marathi
          'शिक्षण','परीक्षा','निकाल','विद्यार्थी','शाळा','कॉलेज','विश्वविद्यालय','प्रवेश','शिष्यवृत्ती'
        ],
        crime: [
          // English
          'crime','police','murder','theft','robbery','scam','fraud','arrest','assault','violence',
          // Telugu
          'క్రైమ్','నేరం','నేరాలు','పోలీసు','హత్య','హత్యలు','దొంగతనం','దొంగతనాలు','దొంగలు','దోపిడీ','మోసం','అరెస్ట్','అరెస్టు','కోర్టు','కోర్టులో','దాడి','హింస','నేరస్థుడు','నేరస్థులు',
          // Tamil
          'குற்றம்','காவல்துறை','கொலை','திருட்டு','கொள்ளை','மோசடி','கைது','தாக்குதல்','வன்முறை',
          // Hindi
          'अपराध','पुलिस','हत्या','चोरी','डकैती','घोटाला','धोखाधड़ी','गिरफ्तारी','हमला','हिंसा',
          // Bengali
          'অপরাধ','পুলিশ','খুন','চুরি','ডাকাতি','কেলেঙ্কারি','জালিয়াতি','গ্রেফতার','আক্রমণ','সহিংসতা',
          // Gujarati
          'અપરાધ','પોલીસ','હત્યા','ચોરી','ડકાઈ','ઘોટાલો','ધોકાધડી','ગિરફતારી','હુમલો','હિંસા',
          // Marathi
          'गुन्हा','पोलिस','खून','चोरी','दरोडा','घोटाळा','फसवणूक','अटक','हल्ला','हिंसा'
        ]
      };

      let best = 'general';
      let bestScore = 0;

      const partialMatch = (t: string, k: string) => {
        if (!k || k.length < 3) return false;
        if (t.includes(k)) return true;
        const stem = k.slice(0, Math.max(3, Math.floor(k.length * 0.7)));
        return stem.length >= 3 && t.includes(stem);
      };

      for (const [cat, keys] of Object.entries(dict)) {
        let score = 0;
        
        // Filter keywords by language before matching
        const langWords = keys.filter(word => {
          // Detect script range for language-specific filtering
          if (normalizedLang === 'telugu') return /[\u0C00-\u0C7F]/.test(word);
          if (normalizedLang === 'hindi') return /[\u0900-\u097F]/.test(word);
          if (normalizedLang === 'tamil') return /[\u0B80-\u0BFF]/.test(word);
          if (normalizedLang === 'bengali') return /[\u0980-\u09FF]/.test(word);
          if (normalizedLang === 'gujarati') return /[\u0A80-\u0AFF]/.test(word);
          if (normalizedLang === 'marathi') return /[\u0900-\u097F]/.test(word);
          if (normalizedLang === 'english') return /^[a-z]+$/i.test(word);
          // Fallback: if language not recognized, use all keywords
          return true;
        });
        
        for (const k of langWords) {
          if (partialMatch(text, k)) {
            // weight longer, more specific keywords slightly higher
            score += Math.max(1, Math.floor(k.length / 4));
          }
        }
        if (score > bestScore) {
          bestScore = score;
          best = cat;
        }
      }

      return bestScore > 0 ? best : 'general';
    }

    // If we're filtering by a text category, use smart filtering approach
    let articles: any[] = [];
    let total = 0;
    
    if (category && category !== 'all' && !/^[0-9a-fA-F]{24}$/.test(category)) {
      console.log(`[api/news] Using smart filtering for category: ${category}`);
      
      // Get all articles for this language (without category filter)
      const baseQuery = { ...query };
      if (baseQuery.$and) {
        baseQuery.$and = baseQuery.$and.filter((condition: any) => {
          if (condition.$or) {
            return !condition.$or.some((orCondition: any) => 
              orCondition.category || orCondition.categories
            );
          }
          return true;
        });
      }
      
      const allArticles = await Article.find(baseQuery)
        .sort(sort)
        .limit(Math.min(limit * 10, 500)) // Dynamic limit: fetch 10x needed or max 500
        .populate('category', 'key label icon color')
        .populate('categories', 'key label icon color')
        .select('title summary content thumbnail source publishedAt scrapedAt language category categories author wordCount readingTime tags slug')
        .lean();
      
      // Apply smart filtering with source-based priority
      const smartFilteredArticles = allArticles.filter(article => {
        // For specific RSS feeds, trust the source categorization over content detection
        const sourceName = article.source?.name || '';
        const isABPCrime = sourceName.includes('ABP Live Telugu - Crime');
        const isABPBusiness = sourceName.includes('ABP Live Telugu - Business');
        const isOKAndhra = sourceName.includes('OK Telugu Andhra Pradesh');
        
        if (isABPCrime && category === 'crime') return true;
        if (isABPBusiness && category === 'business') return true;
        if (isOKAndhra && category === 'andhra-pradesh') return true;
        
        // For other sources, use content-based detection
        const detectedCategory = computeCategoryFromText(article.title, article.summary, article.content, language || undefined);
        return detectedCategory === category;
      });
      
      total = smartFilteredArticles.length;
      articles = smartFilteredArticles.slice((page - 1) * limit, page * limit);
      
      console.log(`[api/news] Smart filtering: ${allArticles.length} -> ${total} articles`);
    } else {
      // Normal database query for ObjectId categories or no category filter
      articles = await Article.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category', 'key label icon color')
      .populate('categories', 'key label icon color')
      .select('title summary content thumbnail source publishedAt scrapedAt language category categories author wordCount readingTime tags slug')
      .lean();
    
      total = await Article.countDocuments(query);
    }

    // Format response
    const formattedArticles = articles.map(article => {
      // Prefer human-readable category from categories[] if available
      let displayCategory: any = undefined;
      const requestedCategory = (searchParams.get('category') || '').toLowerCase();
      const sourceName = article.source?.name || '';

      // For specific RSS feeds, use their intended category
      if (sourceName.includes('ABP Live Telugu - Crime')) {
        displayCategory = 'crime';
      } else if (sourceName.includes('ABP Live Telugu - Business')) {
        displayCategory = 'business';
      } else if (sourceName.includes('OK Telugu Andhra Pradesh')) {
        displayCategory = 'andhra-pradesh';
      } else if (typeof (article as any).category === 'string' && !/^[0-9a-fA-F]{24}$/.test((article as any).category)) {
        displayCategory = (article as any).category;
      } else if (Array.isArray(article.categories) && article.categories.length > 0) {
        const first = String(article.categories[0]);
        if (/^[0-9a-fA-F]{24}$/.test(first)) {
          // If categories array contains ObjectId, use smart detection
          displayCategory = computeCategoryFromText(article.title, article.summary, article.content, article.language);
        } else {
          displayCategory = first;
        }
      } else if (typeof (article as any).category === 'string' && /^[0-9a-fA-F]{24}$/.test((article as any).category)) {
        // If main category is ObjectId, use smart detection
        displayCategory = computeCategoryFromText(article.title, article.summary, article.content, article.language);
      } else {
        // Last resort: infer from content
        displayCategory = computeCategoryFromText(article.title, article.summary, article.content, article.language);
      }
      return ({
        id: article._id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        thumbnail: article.thumbnail,
        images: article.images,
        source: {
          name: article.source?.name || 'Unknown',
          url: article.source?.url || ''
        },
        publishedAt: article.publishedAt,
        scrapedAt: article.scrapedAt,
        language: article.language,
        category: displayCategory,
        categories: article.categories || [],
        author: article.author,
        wordCount: article.wordCount,
        readingTime: article.readingTime,
        tags: article.tags || [],
        url: `/article/${article.slug || article._id}`
      });
    });
    
    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        language,
        category,
        search,
        sortBy,
        sortOrder
      },
      totalFound: total
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
