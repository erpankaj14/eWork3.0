const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'public', 'i18n');
const defaultJson = JSON.parse(fs.readFileSync(path.join(i18nPath, 'en.json'), 'utf8'));
const enJson = JSON.parse(fs.readFileSync(path.join(i18nPath, 'en.json'), 'utf8'));
const hiJson = JSON.parse(fs.readFileSync(path.join(i18nPath, 'hi.json'), 'utf8'));

defaultJson.HOME = {};
enJson.HOME = {};
hiJson.HOME = {};

const homeReplacements = [
  {
    orig: "Government of Rajasthan Portal",
    key: "HOME.GOVT_PORTAL",
    def: "Government of Rajasthan Portal",
    en: "Government of Rajasthan Portal",
    hi: "राजस्थान सरकार पोर्टल"
  },
  {
    orig: "सुदृढ़ पंचायत, समृद्ध राजस्थान",
    key: "HOME.TITLE_HINDI",
    def: "सुदृढ़ पंचायत, समृद्ध राजस्थान",
    en: "Strong Panchayat, Prosperous Rajasthan",
    hi: "सुदृढ़ पंचायत, समृद्ध राजस्थान"
  },
  {
    orig: "Empowering Rural Communities through Integrated Work Monitoring",
    key: "HOME.SUBTITLE",
    def: "Empowering Rural Communities through Integrated Work Monitoring",
    en: "Empowering Rural Communities through Integrated Work Monitoring",
    hi: "एकीकृत कार्य निगरानी के माध्यम से ग्रामीण समुदायों का सशक्तिकरण"
  },
  {
    orig: "The official real-time tracking dashboard of the Rural Development and Panchayati Raj Department. Check financial sanctions, physical progress, and scheme implementations across Rajasthan.",
    key: "HOME.DESC",
    def: "The official real-time tracking dashboard of the Rural Development and Panchayati Raj Department. Check financial sanctions, physical progress, and scheme implementations across Rajasthan.",
    en: "The official real-time tracking dashboard of the Rural Development and Panchayati Raj Department. Check financial sanctions, physical progress, and scheme implementations across Rajasthan.",
    hi: "ग्रामीण विकास और पंचायती राज विभाग का आधिकारिक वास्तविक समय ट्रैकिंग डैशबोर्ड। राजस्थान भर में वित्तीय स्वीकृतियों, भौतिक प्रगति और योजना कार्यान्वयन की जांच करें।"
  },
  { orig: "View Scheme Analytics", key: "HOME.VIEW_ANALYTICS", def: "View Scheme Analytics", en: "View Scheme Analytics", hi: "योजना एनालिटिक्स देखें" },
  { orig: "Download Annual Report", key: "HOME.DOWNLOAD_REPORT", def: "Download Annual Report", en: "Download Annual Report", hi: "वार्षिक रिपोर्ट डाउनलोड करें" },
  { orig: "State Development Summary", key: "HOME.STATE_SUMMARY", def: "State Development Summary", en: "State Development Summary", hi: "राज्य विकास सारांश" },
  { orig: "Key Highlights", key: "HOME.KEY_HIGHLIGHTS", def: "Key Highlights", en: "Key Highlights", hi: "मुख्य आकर्षण" },
  { orig: "Total Allocation", key: "HOME.TOTAL_ALLOCATION", def: "Total Allocation", en: "Total Allocation", hi: "कुल आवंटन" },
  { orig: ">Lacs<", key: "HOME.LACS", def: ">Lacs<", en: ">Lacs<", hi: ">लाख<", isRaw: true, rep: ">{{ 'HOME.LACS' | translate }}<" },
  { orig: "Works Completed", key: "HOME.WORKS_COMPLETED", def: "Works Completed", en: "Works Completed", hi: "पूर्ण कार्य" },
  { orig: "Active Works", key: "HOME.ACTIVE_WORKS", def: "Active Works", en: "Active Works", hi: "सक्रिय कार्य" },
  { orig: "Chief Minister, Rajasthan", key: "HOME.CM_TITLE", def: "Chief Minister, Rajasthan", en: "Chief Minister, Rajasthan", hi: "मुख्यमंत्री, राजस्थान" },
  { orig: "Shri Bhajan Lal Sharma", key: "HOME.CM_NAME", def: "Shri Bhajan Lal Sharma", en: "Shri Bhajan Lal Sharma", hi: "श्री भजन लाल शर्मा" },
  { orig: "\"Our mission is to establish transparency and accelerate infrastructural growth across all rural panchayats of Rajasthan.\"", key: "HOME.CM_QUOTE", def: "\"Our mission is to establish transparency and accelerate infrastructural growth across all rural panchayats of Rajasthan.\"", en: "\"Our mission is to establish transparency and accelerate infrastructural growth across all rural panchayats of Rajasthan.\"", hi: "\"हमारा मिशन राजस्थान की सभी ग्राम पंचायतों में पारदर्शिता स्थापित करना और बुनियादी ढांचे के विकास को गति देना है।\"" },
  { orig: "Minister of Rural Development", key: "HOME.RD_TITLE", def: "Minister of Rural Development", en: "Minister of Rural Development", hi: "ग्रामीण विकास मंत्री" },
  { orig: "ग्रामीण विकास एवं पंचायती राज विभाग", key: "HOME.RD_NAME", def: "ग्रामीण विकास एवं पंचायती राज विभाग", en: "Rural Development and Panchayati Raj Department", hi: "ग्रामीण विकास एवं पंचायती राज विभाग" },
  { orig: "\"Providing clean drinking water, high-quality roads, sanitation, and sustainable employment is the core focus of our department.\"", key: "HOME.RD_QUOTE", def: "\"Providing clean drinking water, high-quality roads, sanitation, and sustainable employment is the core focus of our department.\"", en: "\"Providing clean drinking water, high-quality roads, sanitation, and sustainable employment is the core focus of our department.\"", hi: "\"स्वच्छ पेयजल, उच्च गुणवत्ता वाली सड़कें, स्वच्छता और स्थायी रोजगार प्रदान करना हमारे विभाग का मुख्य फोकस है।\"" },
  { orig: "Major Schemes / प्रमुख योजनाएं", key: "HOME.MAJOR_SCHEMES", def: "Major Schemes / प्रमुख योजनाएं", en: "Major Schemes", hi: "प्रमुख योजनाएं" },
  
  // Scheme Names & desc
  { orig: "महात्मा गांधी नरेगा (MGNREGA)", key: "HOME.SCHEME1_NAME", def: "महात्मा गांधी नरेगा (MGNREGA)", en: "Mahatma Gandhi NREGA (MGNREGA)", hi: "महात्मा गांधी नरेगा (MGNREGA)" },
  { orig: "Providing 100 days of guaranteed wage employment in rural areas.", key: "HOME.SCHEME1_DESC", def: "Providing 100 days of guaranteed wage employment in rural areas.", en: "Providing 100 days of guaranteed wage employment in rural areas.", hi: "ग्रामीण क्षेत्रों में 100 दिनों के गारंटीकृत मजदूरी रोजगार प्रदान करना।" },
  { orig: "Employment Scheme", key: "HOME.SCHEME1_TAG", def: "Employment Scheme", en: "Employment Scheme", hi: "रोजगार योजना" },

  { orig: "पीएम आवास योजना (PMAY-G)", key: "HOME.SCHEME2_NAME", def: "पीएम आवास योजना (PMAY-G)", en: "PM Awas Yojana (PMAY-G)", hi: "पीएम आवास योजना (PMAY-G)" },
  { orig: "Providing clean housing with basic amenities for rural families.", key: "HOME.SCHEME2_DESC", def: "Providing clean housing with basic amenities for rural families.", en: "Providing clean housing with basic amenities for rural families.", hi: "ग्रामीण परिवारों के लिए बुनियादी सुविधाओं के साथ स्वच्छ आवास प्रदान करना।" },
  { orig: "Rural Housing", key: "HOME.SCHEME2_TAG", def: "Rural Housing", en: "Rural Housing", hi: "ग्रामीण आवास" },

  { orig: "स्वच्छ भारत मिशन (SBM-G)", key: "HOME.SCHEME3_NAME", def: "स्वच्छ भारत मिशन (SBM-G)", en: "Swachh Bharat Mission (SBM-G)", hi: "स्वच्छ भारत मिशन (SBM-G)" },
  { orig: "Ensuring 100% open defecation free rural areas & waste management.", key: "HOME.SCHEME3_DESC", def: "Ensuring 100% open defecation free rural areas & waste management.", en: "Ensuring 100% open defecation free rural areas & waste management.", hi: "100% खुले में शौच मुक्त ग्रामीण क्षेत्रों और अपशिष्ट प्रबंधन सुनिश्चित करना।" },
  { orig: "Sanitation", key: "HOME.SCHEME3_TAG", def: "Sanitation", en: "Sanitation", hi: "स्वच्छता" },

  { orig: "जल जीवन मिशन (Jal Jeevan)", key: "HOME.SCHEME4_NAME", def: "जल जीवन मिशन (Jal Jeevan)", en: "Jal Jeevan Mission (JJM)", hi: "जल जीवन मिशन (JJM)" },
  { orig: "Providing functional tap connections to every rural household.", key: "HOME.SCHEME4_DESC", def: "Providing functional tap connections to every rural household.", en: "Providing functional tap connections to every rural household.", hi: "प्रत्येक ग्रामीण घर में कार्यात्मक नल कनेक्शन प्रदान करना।" },
  { orig: "Water Supply", key: "HOME.SCHEME4_TAG", def: "Water Supply", en: "Water Supply", hi: "जल आपूर्ति" },

  { orig: "सांसद आदर्श ग्राम योजना (SAGY)", key: "HOME.SCHEME5_NAME", def: "सांसद आदर्श ग्राम योजना (SAGY)", en: "Sansad Adarsh Gram Yojana (SAGY)", hi: "सांसद आदर्श ग्राम योजना (SAGY)" },
  { orig: "Developing model gram panchayats with holistic infrastructure.", key: "HOME.SCHEME5_DESC", def: "Developing model gram panchayats with holistic infrastructure.", en: "Developing model gram panchayats with holistic infrastructure.", hi: "समग्र बुनियादी ढांचे के साथ मॉडल ग्राम पंचायतों का विकास करना।" },
  { orig: "Model Village", key: "HOME.SCHEME5_TAG", def: "Model Village", en: "Model Village", hi: "मॉडल गांव" },

  { orig: "विधायक स्थानीय विकास (MLA-LAD)", key: "HOME.SCHEME6_NAME", def: "विधायक स्थानीय विकास (MLA-LAD)", en: "MLA Local Area Development (MLA-LAD)", hi: "विधायक स्थानीय विकास (MLA-LAD)" },
  { orig: "Local constituency development projects recommended by state MLAs.", key: "HOME.SCHEME6_DESC", def: "Local constituency development projects recommended by state MLAs.", en: "Local constituency development projects recommended by state MLAs.", hi: "राज्य विधायकों द्वारा अनुशंसित स्थानीय निर्वाचन क्षेत्र विकास परियोजनाएं।" },
  { orig: "Local Area Dev.", key: "HOME.SCHEME6_TAG", def: "Local Area Dev.", en: "Local Area Dev.", hi: "स्थानीय क्षेत्र विकास" },

  { orig: "सीमा क्षेत्र विकास (BADP)", key: "HOME.SCHEME7_NAME", def: "सीमा क्षेत्र विकास (BADP)", en: "Border Area Development (BADP)", hi: "सीमा क्षेत्र विकास (BADP)" },
  { orig: "Socio-economic infrastructure development in border rural areas.", key: "HOME.SCHEME7_DESC", def: "Socio-economic infrastructure development in border rural areas.", en: "Socio-economic infrastructure development in border rural areas.", hi: "सीमावर्ती ग्रामीण क्षेत्रों में सामाजिक-आर्थिक बुनियादी ढांचे का विकास।" },
  { orig: "Border Infrastructure", key: "HOME.SCHEME7_TAG", def: "Border Infrastructure", en: "Border Infrastructure", hi: "सीमा बुनियादी ढांचा" },

  { orig: "स्वविवेक जिला विकास (SJSY)", key: "HOME.SCHEME8_NAME", def: "स्वविवेक जिला विकास (SJSY)", en: "District Special Programs (SJSY)", hi: "स्वविवेक जिला विकास (SJSY)" },
  { orig: "Discretionary district Special programs addressing local community needs.", key: "HOME.SCHEME8_DESC", def: "Discretionary district Special programs addressing local community needs.", en: "Discretionary district Special programs addressing local community needs.", hi: "स्थानीय समुदाय की जरूरतों को संबोधित करने वाले विवेकाधीन जिला विशेष कार्यक्रम।" },
  { orig: "District Special", key: "HOME.SCHEME8_TAG", def: "District Special", en: "District Special", hi: "जिला विशेष" },

  { orig: "Stats &rarr;", key: "HOME.STATS", def: "Stats &rarr;", en: "Stats &rarr;", hi: "आंकड़े &rarr;" },
  
  // Filters
  { orig: "Filter Data", key: "HOME.FILTER_DATA", def: "Filter Data", en: "Filter Data", hi: "डेटा फ़िल्टर करें" },
  { orig: "Apply", key: "HOME.APPLY", def: "Apply", en: "Apply", hi: "लागू करें" },
  { orig: "Reset", key: "HOME.RESET", def: "Reset", en: "Reset", hi: "रीसेट" },
  
  // Middle section
  { orig: "Financial Statistics & Allocations (₹ in Lakhs)", key: "HOME.FINANCIAL_STATS", def: "Financial Statistics & Allocations (₹ in Lakhs)", en: "Financial Statistics & Allocations (₹ in Lakhs)", hi: "वित्तीय सांख्यिकी और आवंटन (₹ लाखों में)" },
  { orig: "Total Allocated", key: "HOME.TOTAL_ALLOCATED", def: "Total Allocated", en: "Total Allocated", hi: "कुल आवंटित" },
  { orig: "Total Released", key: "HOME.TOTAL_RELEASED", def: "Total Released", en: "Total Released", hi: "कुल जारी" },
  { orig: "Total Expenditure", key: "HOME.TOTAL_EXPENDITURE", def: "Total Expenditure", en: "Total Expenditure", hi: "कुल व्यय" },
  { orig: "Allocation Trend Over Years", key: "HOME.ALLOCATION_TREND", def: "Allocation Trend Over Years", en: "Allocation Trend Over Years", hi: "वर्षों में आवंटन की प्रवृत्ति" },
  { orig: ">Expenditure<", key: "HOME.EXPENDITURE", def: ">Expenditure<", en: ">Expenditure<", hi: ">व्यय<", isRaw: true, rep: ">{{ 'HOME.EXPENDITURE' | translate }}<" },
  { orig: ">Release<", key: "HOME.RELEASE", def: ">Release<", en: ">Release<", hi: ">रिलीज़<", isRaw: true, rep: ">{{ 'HOME.RELEASE' | translate }}<" },
  
  { orig: "Physical Implementation Progress", key: "HOME.PHYSICAL_PROGRESS", def: "Physical Implementation Progress", en: "Physical Implementation Progress", hi: "भौतिक कार्यान्वयन प्रगति" },
  { orig: "Completion Rate", key: "HOME.COMPLETION_RATE", def: "Completion Rate", en: "Completion Rate", hi: "पूर्णता दर" },
  { orig: "Works Recommended", key: "HOME.WORKS_RECOMMENDED", def: "Works Recommended", en: "Works Recommended", hi: "अनुशंसित कार्य" },
  
  { orig: "Sector Wise Allocation & Progress", key: "HOME.SECTOR_WISE", def: "Sector Wise Allocation & Progress", en: "Sector Wise Allocation & Progress", hi: "क्षेत्रवार आवंटन एवं प्रगति" },
  { orig: " Works<", key: "HOME.WORKS", def: " Works<", en: " Works<", hi: " कार्य<", isRaw: true, rep: " {{ 'HOME.WORKS' | translate }}<" },
  { orig: "FS: ", key: "HOME.FS", def: "FS: ", en: "FS: ", hi: "स्वीकृत: ", isRaw: true, rep: "{{ 'HOME.FS' | translate }}: " },
  { orig: "CC: ", key: "HOME.CC", def: "CC: ", en: "CC: ", hi: "पूर्ण: ", isRaw: true, rep: "{{ 'HOME.CC' | translate }}: " },

  // Bottom section
  { orig: "District Performance Leaderboard", key: "HOME.DISTRICT_LEADERBOARD", def: "District Performance Leaderboard", en: "District Performance Leaderboard", hi: "जिला प्रदर्शन लीडरबोर्ड" },
  { orig: "Administrative Sanctions by Top Districts", key: "HOME.DISTRICT_LEADERBOARD_SUB", def: "Administrative Sanctions by Top Districts", en: "Administrative Sanctions by Top Districts", hi: "शीर्ष जिलों द्वारा प्रशासनिक स्वीकृतियां" },
  { orig: "Global Leaderboard", key: "HOME.GLOBAL_LEADERBOARD", def: "Global Leaderboard", en: "Global Leaderboard", hi: "ग्लोबल लीडरबोर्ड" },
  { orig: "Rank", key: "HOME.RANK", def: "Rank", en: "Rank", hi: "रैंक" },
  { orig: ">District<", key: "HOME.DISTRICT", def: ">District<", en: ">District<", hi: ">जिला<", isRaw: true, rep: ">{{ 'HOME.DISTRICT' | translate }}<" },
  { orig: "Total Sanctions", key: "HOME.TOTAL_SANCTIONS", def: "Total Sanctions", en: "Total Sanctions", hi: "कुल स्वीकृतियां" },
  { orig: "Prog.", key: "HOME.PROG", def: "Prog.", en: "Prog.", hi: "प्रगति" },
];

let homeHtml = fs.readFileSync(path.join(__dirname, 'src/app/features/home/home.component.html'), 'utf8');

homeReplacements.forEach(rep => {
  defaultJson.HOME[rep.key.split('.')[1]] = rep.def;
  enJson.HOME[rep.key.split('.')[1]] = rep.en;
  hiJson.HOME[rep.key.split('.')[1]] = rep.hi;
  
  if (rep.isRaw) {
    homeHtml = homeHtml.split(rep.orig).join(rep.rep);
  } else {
    homeHtml = homeHtml.split(rep.orig).join(`{{ '${rep.key}' | translate }}`);
  }
});

fs.writeFileSync(path.join(__dirname, 'src/app/features/home/home.component.html'), homeHtml);


// DASHBOARD 1
defaultJson.DASHBOARD1 = {};
enJson.DASHBOARD1 = {};
hiJson.DASHBOARD1 = {};

const d1Replacements = [
  { orig: "State Progress Reports", key: "DASHBOARD1.TAG", def: "State Progress Reports", en: "State Progress Reports", hi: "राज्य प्रगति रिपोर्ट" },
  { orig: "कार्य समीक्षा एवं रिपोर्ट पोर्टल", key: "DASHBOARD1.TITLE", def: "कार्य समीक्षा एवं रिपोर्ट पोर्टल", en: "Work Review & Report Portal", hi: "कार्य समीक्षा एवं रिपोर्ट पोर्टल" },
  { orig: "Detailed Review of Rural Development Infrastructure and Allocation Statistics", key: "DASHBOARD1.SUBTITLE", def: "Detailed Review of Rural Development Infrastructure and Allocation Statistics", en: "Detailed Review of Rural Development Infrastructure and Allocation Statistics", hi: "ग्रामीण विकास बुनियादी ढांचे और आवंटन सांख्यिकी की विस्तृत समीक्षा" },
  { orig: "Explore comprehensive reports, critical alerts, and live telemetry feed regarding physical and financial sanction status across Rajasthan.", key: "DASHBOARD1.DESC", def: "Explore comprehensive reports, critical alerts, and live telemetry feed regarding physical and financial sanction status across Rajasthan.", en: "Explore comprehensive reports, critical alerts, and live telemetry feed regarding physical and financial sanction status across Rajasthan.", hi: "राजस्थान भर में भौतिक और वित्तीय स्वीकृति स्थिति के संबंध में व्यापक रिपोर्ट, महत्वपूर्ण अलर्ट और लाइव टेलीमेट्री फ़ीड का अन्वेषण करें।" },
  { orig: "Export Report PDF", key: "DASHBOARD1.EXPORT_PDF", def: "Export Report PDF", en: "Export Report PDF", hi: "रिपोर्ट पीडीएफ निर्यात करें" },
  
  { orig: "Filter Report", key: "DASHBOARD1.FILTER_REPORT", def: "Filter Report", en: "Filter Report", hi: "रिपोर्ट फ़िल्टर करें" },
  { orig: "-- Select District --", key: "DASHBOARD1.SELECT_DISTRICT", def: "-- Select District --", en: "-- Select District --", hi: "-- जिला चुनें --" },
  
  { orig: "Monthly Progress Matrix", key: "DASHBOARD1.MONTHLY_PROGRESS", def: "Monthly Progress Matrix", en: "Monthly Progress Matrix", hi: "मासिक प्रगति मैट्रिक्स" },
  { orig: "Sanctions (AS/FS) vs Physically Completed Works", key: "DASHBOARD1.SANCTIONS_VS_COMPLETED", def: "Sanctions (AS/FS) vs Physically Completed Works", en: "Sanctions (AS/FS) vs Physically Completed Works", hi: "स्वीकृतियां (एएस/एफएस) बनाम भौतिक रूप से पूर्ण कार्य" },
  { orig: ">Sanctions<", key: "DASHBOARD1.SANCTIONS", def: ">Sanctions<", en: ">Sanctions<", hi: ">स्वीकृतियां<", isRaw: true, rep: ">{{ 'DASHBOARD1.SANCTIONS' | translate }}<" },
  { orig: ">Completed<", key: "DASHBOARD1.COMPLETED", def: ">Completed<", en: ">Completed<", hi: ">पूर्ण<", isRaw: true, rep: ">{{ 'DASHBOARD1.COMPLETED' | translate }}<" },
  
  { orig: "Scheme Allocation & Physical Progress", key: "DASHBOARD1.SCHEME_ALLOCATION", def: "Scheme Allocation & Physical Progress", en: "Scheme Allocation & Physical Progress", hi: "योजना आवंटन और भौतिक प्रगति" },
  { orig: "Target vs Achievement of Core Schemes", key: "DASHBOARD1.TARGET_VS_ACHIEVEMENT", def: "Target vs Achievement of Core Schemes", en: "Target vs Achievement of Core Schemes", hi: "मुख्य योजनाओं का लक्ष्य बनाम उपलब्धि" },
  { orig: "Live Stats", key: "DASHBOARD1.LIVE_STATS", def: "Live Stats", en: "Live Stats", hi: "लाइव आँकड़े" },
  { orig: "Allocated: ₹", key: "DASHBOARD1.ALLOCATED", def: "Allocated: ₹", en: "Allocated: ₹", hi: "आवंटित: ₹", isRaw: true, rep: "{{ 'DASHBOARD1.ALLOCATED' | translate }}" },
  { orig: "Spent: ₹", key: "DASHBOARD1.SPENT", def: "Spent: ₹", en: "Spent: ₹", hi: "खर्च: ₹", isRaw: true, rep: "{{ 'DASHBOARD1.SPENT' | translate }}" },
  { orig: "Cr<", key: "DASHBOARD1.CR", def: "Cr<", en: "Cr<", hi: "करोड़<", isRaw: true, rep: "{{ 'DASHBOARD1.CR' | translate }}<" },

  { orig: "Allocation by Sector", key: "DASHBOARD1.ALLOCATION_BY_SECTOR", def: "Allocation by Sector", en: "Allocation by Sector", hi: "क्षेत्रवार आवंटन" },
  { orig: ">Sectors<", key: "DASHBOARD1.SECTORS", def: ">Sectors<", en: ">Sectors<", hi: ">क्षेत्र<", isRaw: true, rep: ">{{ 'DASHBOARD1.SECTORS' | translate }}<" },
  { orig: "Panchayat Infra (₹4,200Cr)", key: "DASHBOARD1.PANCHAYAT_INFRA", def: "Panchayat Infra (₹4,200Cr)", en: "Panchayat Infra (₹4,200Cr)", hi: "पंचायत इन्फ्रा (₹4,200 करोड़)" },
  { orig: "Water & Agri (₹3,800Cr)", key: "DASHBOARD1.WATER_AGRI", def: "Water & Agri (₹3,800Cr)", en: "Water & Agri (₹3,800Cr)", hi: "जल एवं कृषि (₹3,800 करोड़)" },
  { orig: "Constituency Works (₹2,400Cr)", key: "DASHBOARD1.CONSTITUENCY_WORKS", def: "Constituency Works (₹2,400Cr)", en: "Constituency Works (₹2,400Cr)", hi: "निर्वाचन क्षेत्र कार्य (₹2,400 करोड़)" },
  { orig: "Social Welfare (₹1,250Cr)", key: "DASHBOARD1.SOCIAL_WELFARE", def: "Social Welfare (₹1,250Cr)", en: "Social Welfare (₹1,250Cr)", hi: "समाज कल्याण (₹1,250 करोड़)" },

  { orig: "Live Telemetry Feed", key: "DASHBOARD1.TELEMETRY_FEED", def: "Live Telemetry Feed", en: "Live Telemetry Feed", hi: "लाइव टेलीमेट्री फ़ीड" },
  { orig: "Realtime", key: "DASHBOARD1.REALTIME", def: "Realtime", en: "Realtime", hi: "रीयलटाइम" },

  { orig: "Critical Monitoring Alerts", key: "DASHBOARD1.CRITICAL_ALERTS", def: "Critical Monitoring Alerts", en: "Critical Monitoring Alerts", hi: "महत्वपूर्ण निगरानी अलर्ट" },
  { orig: "Pending Administrative Action", key: "DASHBOARD1.PENDING_ACTION", def: "Pending Administrative Action", en: "Pending Administrative Action", hi: "लंबित प्रशासनिक कार्रवाई" },
  { orig: "Action Required", key: "DASHBOARD1.ACTION_REQUIRED", def: "Action Required", en: "Action Required", hi: "कार्रवाई आवश्यक है" },
  
  { orig: "Circulars & Orders", key: "DASHBOARD1.CIRCULARS", def: "Circulars & Orders", en: "Circulars & Orders", hi: "परिपत्र और आदेश" },
  { orig: "Official releases", key: "DASHBOARD1.OFFICIAL_RELEASES", def: "Official releases", en: "Official releases", hi: "आधिकारिक विज्ञप्ति" },
  { orig: "Order regarding release of 3rd installment of PMAY-G funds for FY 2026.", key: "DASHBOARD1.CIRCULAR_1", def: "Order regarding release of 3rd installment of PMAY-G funds for FY 2026.", en: "Order regarding release of 3rd installment of PMAY-G funds for FY 2026.", hi: "वित्त वर्ष 2026 के लिए पीएमएवाई-जी (PMAY-G) फंड की तीसरी किस्त जारी करने के संबंध में आदेश।" },
  { orig: "Guidelines for social audits under NREGA in border blocks.", key: "DASHBOARD1.CIRCULAR_2", def: "Guidelines for social audits under NREGA in border blocks.", en: "Guidelines for social audits under NREGA in border blocks.", hi: "सीमावर्ती ब्लॉकों में नरेगा के तहत सामाजिक अंकेक्षण के लिए दिशानिर्देश।" },
  { orig: "Instructions on geoconservation check dams in arid zones.", key: "DASHBOARD1.CIRCULAR_3", def: "Instructions on geoconservation check dams in arid zones.", en: "Instructions on geoconservation check dams in arid zones.", hi: "शुष्क क्षेत्रों में भू-संरक्षण चेक डैम पर निर्देश।" },
  { orig: "View All Documents &rarr;", key: "DASHBOARD1.VIEW_ALL_DOCS", def: "View All Documents &rarr;", en: "View All Documents &rarr;", hi: "सभी दस्तावेज़ देखें &rarr;" },
  
  { orig: "Recent Project Sanctions", key: "DASHBOARD1.RECENT_SANCTIONS", def: "Recent Project Sanctions", en: "Recent Project Sanctions", hi: "हाल ही में स्वीकृत परियोजनाएं" },
  { orig: "Status of recently processed administrative orders", key: "DASHBOARD1.STATUS_RECENT", def: "Status of recently processed administrative orders", en: "Status of recently processed administrative orders", hi: "हाल ही में संसाधित प्रशासनिक आदेशों की स्थिति" },
  { orig: "View All Sanctions", key: "DASHBOARD1.VIEW_ALL_SANC", def: "View All Sanctions", en: "View All Sanctions", hi: "सभी स्वीकृतियां देखें" },

  { orig: ">Project ID<", key: "DASHBOARD1.TABLE_PRJ_ID", def: ">Project ID<", en: ">Project ID<", hi: ">प्रोजेक्ट आईडी<", isRaw: true, rep: ">{{ 'DASHBOARD1.TABLE_PRJ_ID' | translate }}<" },
  { orig: ">Description<", key: "DASHBOARD1.TABLE_DESC", def: ">Description<", en: ">Description<", hi: ">विवरण<", isRaw: true, rep: ">{{ 'DASHBOARD1.TABLE_DESC' | translate }}<" },
  { orig: ">Department<", key: "DASHBOARD1.TABLE_DEPT", def: ">Department<", en: ">Department<", hi: ">विभाग<", isRaw: true, rep: ">{{ 'DASHBOARD1.TABLE_DEPT' | translate }}<" },
  { orig: ">Cost<", key: "DASHBOARD1.TABLE_COST", def: ">Cost<", en: ">Cost<", hi: ">लागत<", isRaw: true, rep: ">{{ 'DASHBOARD1.TABLE_COST' | translate }}<" },
  { orig: ">Status<", key: "DASHBOARD1.TABLE_STATUS", def: ">Status<", en: ">Status<", hi: ">स्थिति<", isRaw: true, rep: ">{{ 'DASHBOARD1.TABLE_STATUS' | translate }}<" },
];

let d1Html = fs.readFileSync(path.join(__dirname, 'src/app/features/dashboard-1/dashboard-1.component.html'), 'utf8');

d1Replacements.forEach(rep => {
  defaultJson.DASHBOARD1[rep.key.split('.')[1]] = rep.def;
  enJson.DASHBOARD1[rep.key.split('.')[1]] = rep.en;
  hiJson.DASHBOARD1[rep.key.split('.')[1]] = rep.hi;
  
  if (rep.isRaw) {
    d1Html = d1Html.split(rep.orig).join(rep.rep);
  } else {
    d1Html = d1Html.split(rep.orig).join(`{{ '${rep.key}' | translate }}`);
  }
});
fs.writeFileSync(path.join(__dirname, 'src/app/features/dashboard-1/dashboard-1.component.html'), d1Html);


// DASHBOARD 2
defaultJson.DASHBOARD2 = {};
enJson.DASHBOARD2 = {};
hiJson.DASHBOARD2 = {};

const d2Replacements = [
  { orig: "Live Telemetry", key: "DASHBOARD2.LIVE_TELEMETRY", def: "Live Telemetry", en: "Live Telemetry", hi: "लाइव टेलीमेट्री" },
  { orig: "Visual ", key: "DASHBOARD2.VISUAL", def: "Visual ", en: "Visual ", hi: "दृश्य ", isRaw: true, rep: "{{ 'DASHBOARD2.VISUAL' | translate }}" },
  { orig: ">Analytics Hub<", key: "DASHBOARD2.ANALYTICS_HUB", def: ">Analytics Hub<", en: ">Analytics Hub<", hi: ">एनालिटिक्स हब<", isRaw: true, rep: ">{{ 'DASHBOARD2.ANALYTICS_HUB' | translate }}<" },
  { orig: "Deep dive into interactive, multi-dimensional graphical representations of scheme performance and budgetary trends.", key: "DASHBOARD2.DESC", def: "Deep dive into interactive, multi-dimensional graphical representations of scheme performance and budgetary trends.", en: "Deep dive into interactive, multi-dimensional graphical representations of scheme performance and budgetary trends.", hi: "योजना के प्रदर्शन और बजटीय रुझानों के संवादात्मक, बहुआयामी चित्रमय प्रतिनिधित्व में गहराई से गोता लगाएँ।" },
  
  { orig: "Macro trend: No. of CC Against FS", key: "DASHBOARD2.MACRO_TREND", def: "Macro trend: No. of CC Against FS", en: "Macro trend: No. of CC Against FS", hi: "मैक्रो रुझान: एफएस के मुकाबले सीसी की संख्या" },
  { orig: "A comprehensive timeline view of sanctioned vs completed works across all major schemes.", key: "DASHBOARD2.TIMELINE_VIEW", def: "A comprehensive timeline view of sanctioned vs completed works across all major schemes.", en: "A comprehensive timeline view of sanctioned vs completed works across all major schemes.", hi: "सभी प्रमुख योजनाओं में स्वीकृत बनाम पूर्ण कार्यों का एक व्यापक समयरेखा दृश्य।" },
  { orig: "FS (Sanctioned)", key: "DASHBOARD2.FS_SANCTIONED", def: "FS (Sanctioned)", en: "FS (Sanctioned)", hi: "एफएस (स्वीकृत)" },
  { orig: "CC (Completed)", key: "DASHBOARD2.CC_COMPLETED", def: "CC (Completed)", en: "CC (Completed)", hi: "सीसी (पूर्ण)" },
  
  { orig: "Expenditure Distribution", key: "DASHBOARD2.EXPENDITURE_DIST", def: "Expenditure Distribution", en: "Expenditure Distribution", hi: "व्यय वितरण" },
  { orig: "Schemewise allocation", key: "DASHBOARD2.SCHEMEWISE_ALLOC", def: "Schemewise allocation", en: "Schemewise allocation", hi: "योजनावार आवंटन" },
  
  { orig: "Yearly Performance Matrix", key: "DASHBOARD2.YEARLY_PERF", def: "Yearly Performance Matrix", en: "Yearly Performance Matrix", hi: "वार्षिक प्रदर्शन मैट्रिक्स" },
  { orig: "Financial Year Wise Comparison", key: "DASHBOARD2.FY_COMPARISON", def: "Financial Year Wise Comparison", en: "Financial Year Wise Comparison", hi: "वित्तीय वर्ष वार तुलना" },
  { orig: ">FS<", key: "DASHBOARD2.FS", def: ">FS<", en: ">FS<", hi: ">एफएस<", isRaw: true, rep: ">{{ 'DASHBOARD2.FS' | translate }}<" },
  { orig: ">CC<", key: "DASHBOARD2.CC", def: ">CC<", en: ">CC<", hi: ">सीसी<", isRaw: true, rep: ">{{ 'DASHBOARD2.CC' | translate }}<" },
  
  { orig: "Predictive Trends", key: "DASHBOARD2.PREDICTIVE", def: "Predictive Trends", en: "Predictive Trends", hi: "भविष्य कहनेवाला रुझान" },
  { orig: "Projected Sanctions (Next Quarter)", key: "DASHBOARD2.PROJECTED", def: "Projected Sanctions (Next Quarter)", en: "Projected Sanctions (Next Quarter)", hi: "अनुमानित स्वीकृतियां (अगली तिमाही)" },
  { orig: "AI Generated", key: "DASHBOARD2.AI", def: "AI Generated", en: "AI Generated", hi: "एआई जनित" },

  { orig: "Incomplete Targets", key: "DASHBOARD2.INCOMPLETE", def: "Incomplete Targets", en: "Incomplete Targets", hi: "अधूरे लक्ष्य" },
  { orig: "Schemewise Distribution", key: "DASHBOARD2.SCHEMEWISE_DIST", def: "Schemewise Distribution", en: "Schemewise Distribution", hi: "योजनावार वितरण" },
  
  { orig: "Legislative Assembly Metrics", key: "DASHBOARD2.MLA_METRICS", def: "Legislative Assembly Metrics", en: "Legislative Assembly Metrics", hi: "विधानसभा मेट्रिक्स" },
  
  { orig: ">S.No.<", key: "DASHBOARD2.SNO", def: ">S.No.<", en: ">S.No.<", hi: ">क्र.सं.<", isRaw: true, rep: ">{{ 'DASHBOARD2.SNO' | translate }}<" },
  { orig: ">MLA Name<", key: "DASHBOARD2.MLA_NAME", def: ">MLA Name<", en: ">MLA Name<", hi: ">विधायक का नाम<", isRaw: true, rep: ">{{ 'DASHBOARD2.MLA_NAME' | translate }}<" },
  { orig: ">Assembly<", key: "DASHBOARD2.ASSEMBLY", def: ">Assembly<", en: ">Assembly<", hi: ">विधानसभा<", isRaw: true, rep: ">{{ 'DASHBOARD2.ASSEMBLY' | translate }}<" },
  { orig: ">A.No.<", key: "DASHBOARD2.ANO", def: ">A.No.<", en: ">A.No.<", hi: ">स.क्र.<", isRaw: true, rep: ">{{ 'DASHBOARD2.ANO' | translate }}<" },
  { orig: ">Works App.<", key: "DASHBOARD2.WORKS_APP", def: ">Works App.<", en: ">Works App.<", hi: ">स्वीकृत कार्य<", isRaw: true, rep: ">{{ 'DASHBOARD2.WORKS_APP' | translate }}<" },
  { orig: ">Amt Allotted<", key: "DASHBOARD2.AMT_ALLOTTED", def: ">Amt Allotted<", en: ">Amt Allotted<", hi: ">आवंटित राशि<", isRaw: true, rep: ">{{ 'DASHBOARD2.AMT_ALLOTTED' | translate }}<" },
  { orig: ">Exp Till Pre. Month<", key: "DASHBOARD2.EXP_PREV", def: ">Exp Till Pre. Month<", en: ">Exp Till Pre. Month<", hi: ">पिछले माह तक व्यय<", isRaw: true, rep: ">{{ 'DASHBOARD2.EXP_PREV' | translate }}<" },
  { orig: ">Exp During Month<", key: "DASHBOARD2.EXP_DURING", def: ">Exp During Month<", en: ">Exp During Month<", hi: ">इस माह व्यय<", isRaw: true, rep: ">{{ 'DASHBOARD2.EXP_DURING' | translate }}<" },
];

let d2Html = fs.readFileSync(path.join(__dirname, 'src/app/features/dashboard-2/dashboard-2.component.html'), 'utf8');

d2Replacements.forEach(rep => {
  defaultJson.DASHBOARD2[rep.key.split('.')[1]] = rep.def;
  enJson.DASHBOARD2[rep.key.split('.')[1]] = rep.en;
  hiJson.DASHBOARD2[rep.key.split('.')[1]] = rep.hi;
  
  if (rep.isRaw) {
    d2Html = d2Html.split(rep.orig).join(rep.rep);
  } else {
    d2Html = d2Html.split(rep.orig).join(`{{ '${rep.key}' | translate }}`);
  }
});
fs.writeFileSync(path.join(__dirname, 'src/app/features/dashboard-2/dashboard-2.component.html'), d2Html);

fs.writeFileSync(path.join(i18nPath, 'default.json'), JSON.stringify(defaultJson, null, 2));
fs.writeFileSync(path.join(i18nPath, 'en.json'), JSON.stringify(enJson, null, 2));
fs.writeFileSync(path.join(i18nPath, 'hi.json'), JSON.stringify(hiJson, null, 2));
console.log('Successfully updated HTML and JSON files.');
