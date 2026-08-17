/* =========================================================
   SELLBY — i18n.js
   Multi-language System
   Languages: English / Telugu / Hindi
   ========================================================= */

const translations = {

    /* =====================================================
       ENGLISH
       ===================================================== */

    en: {

        // Shared
        app_name: "SELLBY",
        back: "Go Back",
        sell: "Sell",
        loading: "Loading...",
        price_symbol: "₹",
        location_placeholder: "City, Area or Landmark",
        desc_placeholder: "Describe your item details...",
        publish: "Publish",
        uploading: "Uploading...",
        success: "Success!",
        failed: "Failed to publish. Please check your connection.",
        publish_success: "✅ Ad Published Successfully!",
        identity_required: "Please fill all required fields and add at least one photo.",
        login_first: "Please login first.",
        untitled_ad: "Untitled Ad",
        save: "Save",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete",
        remove: "Remove",

        // Navigation
        home: "Home",
        saved: "Saved",
        chat: "Chat",
        profile: "Profile",
        logout: "Logout",
        settings: "Settings",
        my_ads: "My Ads",
        my_chats: "My Chats",

        // Home
        hero_title: "India's Premium Marketplace",
        hero_subtitle: "Buy and Sell anything with ease.",
        browse_categories: "Browse Categories",
        latest_ads: "Latest Ads",
        search_placeholder: "Search anything...",
        phone_placeholder: "Enter mobile number",
        no_ads_yet: "No ads published yet.",
        view_all: "View All",

        // Categories
        cat_properties: "Properties",
        cat_mobiles: "Mobiles",
        cat_cars: "Cars",
        cat_bikes: "Bikes",
        cat_electronics: "Electronics",
        cat_furniture: "Furniture",
        cat_others: "Others",

        // Empty States
        no_properties: "No Properties Found",
        no_mobiles: "No Mobiles Found",
        no_cars: "No Cars Found",
        no_bikes: "No Bikes Found",
        no_electronics: "No Electronics Found",
        no_furniture: "No Furniture Found",
        no_others: "No Other Ads Found",
        empty_desc: "be the first to post in this category!",

        // Ad Details
        ad_details_title: "Ad Details",
        chat_with_seller: "💬 Chat with Seller",
        description: "Description",
        location: "Location",
        category: "Category",
        seller_info: "Seller Information",
        post_date: "Posted on",

        // Post Ad
        post_ad_title: "What are you selling?",
        post_ad_subtitle: "Choose a category to continue",

        // Chat
        type_message: "Type your message...",
        send: "Send",
        online: "Online",
        record_voice: "Record Voice",
        recording: "Recording:",
        send_voice: "Send Voice 🎵",
        voice_note: "🎵 Voice Note",

        // Settings
        settings_title: "Settings",
        settings_subtitle: "Preferences & Account",
        edit_profile: "Edit Profile",
        profile_photo: "Profile Photo",
        language: "Language",
        preferences: "Preferences",
        notifications: "Notifications",
        privacy_policy: "Privacy Policy",
        terms_conditions: "Terms & Conditions",
        support: "Support",
        help_support: "Help & Support",
        help_title: "Help & Support",
        help_subtitle: "How can we help you?",

        help_content: [
            {
                h: "🛒 How to buy?",
                p: "Browse categories, find what you like, and chat with the seller to negotiate and buy."
            },
            {
                h: "📢 How to sell?",
                p: "Click the 'Sell' button, choose a category, add photos and details, and publish."
            },
            {
                h: "🔒 Safety Tips",
                p: "Always meet in public places for transactions and never share your password or sensitive info."
            }
        ],

        safety_report: "Safety & Report",

        policy_title: "Privacy Policy",

        policy_text:
            "At SELLBY, we take your privacy seriously. We only collect necessary information to provide our services and ensure a safe trading environment. Your data is protected and never sold to third parties.",

        terms_title: "Terms & Conditions",

        terms_text:
            "By using SELLBY, you agree to our terms. You must provide accurate information, not post prohibited items, and treat other users with respect. We reserve the right to remove any content that violates our policies.",

        safety_title: "Safety & Report",

        safety_text:
            "Your safety is our top priority. If you encounter any suspicious activity or inappropriate content, please report it immediately. We will investigate and take necessary action.",

        report_btn: "Report Suspicious Activity",

        about_sellby: "About SELLBY",

        about_title: "About Us",

        about_text:
            "SELLBY is India's premium local marketplace. Our mission is to make buying and selling as easy as a conversation. With our innovative voice-to-text posting, you can list your items in seconds.",

        // Localization
        lang_en: "English",
        lang_te: "తెలుగు",
        lang_hi: "हिन्दी",
        select_lang: "Select Language",

        // Post Categories
        post_property: "Post Property",
        post_mobile: "Post Mobile",
        post_car: "Post Car",
        post_bike: "Post Bike",
        post_electronics: "Post Electronics",
        post_furniture: "Post Furniture",
        post_others: "Post Others",

        voice_posting: "Voice Posting",

        desc_prop: "House, Apartment, Land",
        desc_mobile: "Phone, Tablet, Accessories",
        desc_car: "Sedan, SUV, Hatchback",
        desc_bike: "Motorcycle, Scooters",
        desc_electronics: "Laptop, TV, Camera",
        desc_furniture: "Sofa, Bed, Table",
        desc_voice: "Sell faster by speaking",
        desc_others: "Fashion, Books, Sports",

        speak_instantly: "Speak and create your ad instantly",
        tap_mic: "Tap the microphone",
        speak_clearly: "Speak clearly in Telugu, English or Hindi.",
        start_recording: "🎤 Start Recording",
        stop_recording: "⏹️ Stop Recording",
        ad_details_voice: "Ad Details (Spoken Description)",
        continue_to_post: "Continue to Post",

        // Form Fields
        title: "Title",
        price: "Price",
        brand: "Brand",
        model: "Model",
        condition: "Condition",
        storage: "Storage",
        ram: "RAM",
        year: "Year",
        kms: "KMs Driven",
        quantity: "Quantity",
        material: "Material",
        color: "Color",
        property_type: "Property Type",
        area: "Area (sq.ft)",
        add_photos: "Add Photos",
        upload_hint: "Upload up to 10 images.",
        select_condition: "Select Condition",
        select_type: "Select Type",
        new: "New",
        used: "Used",
        like_new: "Like New",
        good: "Good",
        post_hint: "Fill the details below",
        manual: "Manual",
        automatic: "Automatic",
        petrol: "Petrol",
        diesel: "Diesel",
        cng: "CNG",
        electric: "Electric",
        hybrid: "Hybrid",
        apartment: "Apartment",
        independent_house: "Independent House",
        plot_land: "Plot / Land",
        villa: "Villa",
        commercial: "Office / Commercial",
        pg_hostel: "PG / Hostel",
        warranty: "Warranty",
        available: "Available",
        expired: "Expired",
        no_warranty: "No Warranty",
        status: "Status",
        sold: "Sold",
        delete_confirm: "Are you sure you want to delete this ad?",
        full_name: "Full Name",
        email_address: "Email Address",
        phone_number: "Phone Number",
        save_changes: "Save Changes",
        take_photo: "Take Photo",
        choose_gallery: "Gallery",

        // Auth
        login: "Login",
        register: "Register",
        email: "Email",
        password: "Password",
        forgot_password: "Forgot Password?",
        no_account: "Don't have an account?",
        have_account: "Already have an account?",
        login_or_register: "Login or Register",
        enter_mobile: "Enter your mobile number to receive a verification code via SMS.",
        continue: "Continue",
        enter_code: "Enter verification code",
        code_sent: "Code sent to",
        verify_code: "Verify Code",
        change_number: "Change number",
        resend_otp: "Resend OTP",
        mobile_login_active: "Mobile Login Active",
        mobile_login_desc:
            "SELLBY now uses instant Mobile Number + OTP verification! Password resets are no longer needed.",
        continue_to_login: "Continue to Mobile Login"
    },


    /* =====================================================
       TELUGU
       ===================================================== */

    te: {

        // Shared
        app_name: "SELLBY",
        back: "వెనుకకు",
        sell: "అమ్మండి",
        loading: "లోడ్ అవుతోంది...",
        price_symbol: "₹",
        location_placeholder: "నగరం, ప్రాంతం లేదా ల్యాండ్‌మార్క్",
        desc_placeholder: "మీ వస్తువు వివరాలను వివరించండి...",
        publish: "ప్రచురించు",
        uploading: "అప్‌లోడ్ అవుతోంది...",
        success: "విజయం!",
        failed: "ప్రచురించడం విఫలమైంది. దయచేసి మీ కనెక్షన్‌ని తనిఖీ చేయండి.",
        publish_success: "✅ ప్రకటన విజయవంతంగా ప్రచురించబడింది!",
        identity_required: "దయచేసి అన్ని అవసరమైన ఫీల్డ్లను పూరించండి మరియు కనీసం ఒక ఫోటోను జోడించండి.",
        login_first: "దయచేసి మొదట లాగిన్ అవ్వండి.",
        untitled_ad: "పేరు లేని ప్రకటన",
        save: "సేవ్ చేయండి",
        cancel: "రద్దు చేయండి",
        edit: "ఎడిట్",
        delete: "తొలగించు",
        remove: "తొలగించు",

        // Navigation
        home: "హోమ్",
        saved: "సేవ్ చేసినవి",
        chat: "చాట్",
        profile: "ప్రొఫైల్",
        logout: "లాగ్ అవుట్",
        settings: "సెట్టింగులు",
        my_ads: "నా ప్రకటనలు",
        my_chats: "నా చాట్లు",

        // Home
        hero_title: "భారతదేశపు ప్రీమియం మార్కెట్‌ప్లేస్",
        hero_subtitle: "దేన్నైనా సులభంగా కొనండి మరియు అమ్మండి.",
        browse_categories: "వర్గాలను బ్రౌజ్ చేయండి",
        latest_ads: "తాజా ప్రకటనలు",
        search_placeholder: "ఏదైనా వెతకండి...",
        phone_placeholder: "మొబైల్ నంబర్‌ను నమోదు చేయండి",
        no_ads_yet: "ఇంకా ప్రకటనలు ప్రచురించబడలేదు.",
        view_all: "అన్నీ చూడండి",

        // Categories
        cat_properties: "ప్రాపర్టీస్",
        cat_mobiles: "మొబైల్స్",
        cat_cars: "కార్స్",
        cat_bikes: "బైక్స్",
        cat_electronics: "ఎలక్ట్రానిక్స్",
        cat_furniture: "ఫర్నిచర్",
        cat_others: "ఇతరాలు",

        // Empty States
        no_properties: "ప్రాపర్టీస్ ఏవీ కనుగొనబడలేదు",
        no_mobiles: "మొబైల్స్ ఏవీ కనుగొనబడలేదు",
        no_cars: "కార్లు ఏవీ కనుగొనబడలేదు",
        no_bikes: "బైక్‌లు ఏవీ కనుగొనబడలేదు",
        no_electronics: "ఎలక్ట్రానిక్స్ ఏవీ కనుగొనబడలేదు",
        no_furniture: "ఫర్నిచర్ ఏవీ కనుగొనబడలేదు",
        no_others: "ఇతర ప్రకటనలు ఏవీ కనుగొనబడలేదు",
        empty_desc: "ఈ వర్గంలో మొదటగా పోస్ట్ చేయండి!",

        // Ad Details
        ad_details_title: "ప్రకటన వివరాలు",
        chat_with_seller: "💬 అమ్మకందారునితో చాట్ చేయండి",
        description: "వివరణ",
        location: "ప్రాంతం",
        category: "వర్గం",
        seller_info: "అమ్మకందారుని సమాచారం",
        post_date: "పోస్ట్ చేసిన తేదీ",

        // Post Ad
        post_ad_title: "మీరు ఏమి అమ్ముతున్నారు?",
        post_ad_subtitle: "కొనసాగించడానికి ఒక వర్గాన్ని ఎంచుకోండి",

        // Chat
        type_message: "సందేశాన్ని టైప్ చేయండి...",
        send: "పంపండి",
        online: "ఆన్‌లైన్",
        record_voice: "వాయిస్ రికార్డ్ చేయండి",
        recording: "రికార్డింగ్:",
        send_voice: "వాయిస్ పంపండి 🎵",
        voice_note: "🎵 వాయిస్ నోట్",

        // Settings
        settings_title: "సెట్టింగులు",
        settings_subtitle: "ప్రాధాన్యతలు & ఖాతా",
        edit_profile: "ప్రొఫైల్ ఎడిట్ చేయండి",
        profile_photo: "ప్రొఫైల్ ఫోటో",
        language: "భాష",
        preferences: "ప్రాధాన్యతలు",
        notifications: "నోటిఫికేషన్లు",
        privacy_policy: "గోప్యతా విధానం",
        terms_conditions: "నియమ నిబంధనలు",
        support: "మద్దతు",
        help_support: "సహాయం & మద్దతు",
        help_title: "సహాయం & మద్దతు",
        help_subtitle: "మేము మీకు ఎలా సహాయం చేయగలము?",

        help_content: [
            {
                h: "🛒 ఎలా కొనాలి?",
                p: "వర్గాలను బ్రౌజ్ చేయండి, మీకు నచ్చినదాన్ని కనుగొనండి మరియు ధర గురించి చర్చించడానికి మరియు కొనడానికి అమ్మకందారునితో చాట్ చేయండి."
            },
            {
                h: "📢 ఎలా అమ్మాలి?",
                p: "'అమ్మండి' బటన్ క్లిక్ చేయండి, ఒక వర్గాన్ని ఎంచుకోండి, ఫోటోలు మరియు వివరాలను జోడించి, ప్రచురించండి."
            },
            {
                h: "🔒 భద్రతా చిట్కాలు",
                p: "లావాదేవీల కోసం ఎల్లప్పుడూ బహిరంగ ప్రదేశాలలో కలవండి మరియు మీ పాస్‌వర్డ్ లేదా సున్నితమైన సమాచారాన్ని ఎప్పుడూ పంచుకోవద్దు."
            }
        ],

        safety_report: "భద్రత & నివేదిక",

        policy_title: "గోప్యతా విధానం",

        policy_text:
            "SELLBY వద్ద, మేము మీ గోప్యతను తీవ్రంగా పరిగణిస్తాము. మా సేవలను అందించడానికి మరియు సురక్షితమైన వ్యాపార వాతావరణాన్ని నిర్ధారించడానికి మేము అవసరమైన సమాచారాన్ని మాత్రమే సేకరిస్తాము. మీ డేటా సురక్షితంగా ఉంటుంది మరియు ఎప్పుడూ మూడవ పక్షాలకు విక్రయించబడదు.",

        terms_title: "నియమ నిబంధనలు",

        terms_text:
            "SELLBYని ఉపయోగించడం ద్వారా, మీరు మా నిబంధనలకు అంగీకరిస్తున్నారు. మీరు ఖచ్చితమైన సమాచారాన్ని అందించాలి, నిషేధించబడిన వస్తువులను పోస్ట్ చేయకూడదు మరియు ఇతర వినియోగదారులను గౌరవంగా చూడాలి. మా విధానాలను ఉల్లంఘించే ఏదైనా కంటెంట్‌ను తొలగించే హక్కు మాకు ఉంది.",

        safety_title: "భద్రత & నివేదిక",

        safety_text:
            "మీ భద్రత మా మొదటి ప్రాధాన్యత. మీరు ఏదైనా అనుమానాస్పద కార్యకలాపాన్ని లేదా అనుచితమైన కంటెంట్‌ను చూసినట్లయితే, దయచేసి వెంటనే నివేదించండి. మేము విచారణ చేసి అవసరమైన చర్య తీసుకుంటాము.",

        report_btn: "అనుమానాస్పద కార్యాచరణను నివేదించండి",

        about_sellby: "SELLBY గురించి",

        about_title: "మా గురించి",

        about_text:
            "SELLBY భారతదేశపు ప్రీమియం స్థానిక మార్కెట్‌ప్లేస్. కొనడం మరియు అమ్మడం ఒక సంభాషణ అంత సులభం చేయడమే మా లక్ష్యం. మా వినూత్న వాయిస్-టు-టెక్స్ట్ పోస్టింగ్‌తో, మీరు మీ వస్తువులను సెకన్లలో లిస్ట్ చేయవచ్చు.",

        // Localization
        lang_en: "English",
        lang_te: "తెలుగు",
        lang_hi: "हिन्दी",
        select_lang: "భాషను ఎంచుకోండి",

        // Post Categories
        post_property: "ఆస్తిని పోస్ట్ చేయండి",
        post_mobile: "మొబైల్‌ను పోస్ట్ చేయండి",
        post_car: "కారును పోస్ట్ చేయండి",
        post_bike: "బైక్‌ను పోస్ట్ చేయండి",
        post_electronics: "ఎలక్ట్రానిక్స్‌ను పోస్ట్ చేయండి",
        post_furniture: "ఫర్నిచర్‌ను పోస్ట్ చేయండి",
        post_others: "ఇతరాలను పోస్ట్ చేయండి",

        voice_posting: "వాయిస్ పోస్టింగ్",

        desc_prop: "ఇల్లు, అపార్ట్మెంట్, స్థలం",
        desc_mobile: "ఫోన్, టాబ్లెట్, యాక్సెసరీస్",
        desc_car: "సెడాన్, ఎస్‌యూవీ, హ్యాచ్‌బ్యాక్",
        desc_bike: "మోటార్ సైకిల్, స్కూటర్లు",
        desc_electronics: "ల్యాప్‌టాప్, టీవీ, కెమెరా",
        desc_furniture: "సోఫా, బెడ్, టేబుల్",
        desc_voice: "మాట్లాడటం ద్వారా వేగంగా అమ్మండి",
        desc_others: "ఫ్యాషన్, పుస్తకాలు, క్రీడలు",

        speak_instantly: "మాట్లాడండి మరియు మీ ప్రకటనను తక్షణమే సృష్టించండి",
        tap_mic: "మైక్రోఫోన్‌ను నొక్కండి",
        speak_clearly: "తెలుగు, ఇంగ్లీష్ లేదా హిందీలో స్పష్టంగా మాట్లాడండి.",
        start_recording: "🎤 రికార్డింగ్ ప్రారంభించండి",
        stop_recording: "⏹️ రికార్డింగ్ ఆపండి",
        ad_details_voice: "ప్రకటన వివరాలు (మాట్లాడిన వివరణ)",
        continue_to_post: "పోస్ట్ చేయడానికి కొనసాగండి",

        // Form Fields
        title: "శీర్షిక",
        price: "ధర",
        brand: "బ్రాండ్",
        model: "మోడల్",
        condition: "పరిస్థితి",
        storage: "స్టోరేజ్",
        ram: "ర్యామ్",
        year: "సంవత్సరం",
        kms: "కిమీ తిరిగినవి",
        quantity: "పరిమాణం",
        material: "మెటీరియల్",
        color: "రంగు",
        property_type: "ఆస్తి రకం",
        area: "విస్తీర్ణం (sq.ft)",
        add_photos: "ఫోటోలను జోడించండి",
        upload_hint: "గరిష్టంగా 10 చిత్రాలను అప్‌లోడ్ చేయండి.",
        select_condition: "పరిస్థితిని ఎంచుకోండి",
        select_type: "రకాన్ని ఎంచుకోండి",
        new: "కొత్తది",
        used: "వాడినది",
        like_new: "కొత్తదానిలా ఉంది",
        good: "బాగుంది",
        post_hint: "దిగువ వివరాలను పూరించండి",
        manual: "మాన్యువల్",
        automatic: "ఆటోమేటిక్",
        petrol: "పెట్రోల్",
        diesel: "డీజిల్",
        cng: "సిఎన్‌జి",
        electric: "ఎలక్ట్రిక్",
        hybrid: "హైబ్రిడ్",
        apartment: "అపార్ట్మెంట్",
        independent_house: "ఇండిపెండెంట్ హౌస్",
        plot_land: "ప్లాట్ / ల్యాండ్",
        villa: "విల్లా",
        commercial: "ఆఫీస్ / కమర్షియల్",
        pg_hostel: "PG / హాస్టల్",
        warranty: "వారంటీ",
        available: "అందుబాటులో ఉంది",
        expired: "గడువు ముగిసింది",
        no_warranty: "వారంటీ లేదు",
        status: "స్థితి",
        sold: "అమ్మబడింది",
        delete_confirm: "మీరు ఖచ్చితంగా ఈ ప్రకటనను తొలగించాలనుకుంటున్నారా?",
        full_name: "పూర్తి పేరు",
        email_address: "ఈమెయిల్ చిరునామా",
        phone_number: "ఫోన్ నంబర్",
        save_changes: "మార్పులను సేవ్ చేయండి",
        take_photo: "ఫోటో తీయండి",
        choose_gallery: "గ్యాలరీ",

        // Auth
        login: "లాగిన్",
        register: "రిజిస్టర్",
        email: "ఈమెయిల్",
        password: "పాస్వర్డ్",
        forgot_password: "పాస్వర్డ్ మరిచిపోయారా?",
        no_account: "ఖాతా లేదా?",
        have_account: "ముందే ఖాతా ఉందా?",
        login_or_register: "లాగిన్ లేదా రిజిస్టర్",
        enter_mobile: "SMS ద్వారా ధృవీకరణ కోడ్‌ను స్వీకరించడానికి మీ మొబైల్ నంబర్‌ను నమోదు చేయండి.",
        continue: "కొనసాగించండి",
        enter_code: "ధృవీకరణ కోడ్‌ను నమోదు చేయండి",
        code_sent: "కోడ్ పంపబడింది",
        verify_code: "కోడ్‌ను ధృవీకరించండి",
        change_number: "నంబర్‌ను మార్చండి",
        resend_otp: "OTPని మళ్లీ పంపండి",
        mobile_login_active: "మొబైల్ లాగిన్ యాక్టివ్‌గా ఉంది",
        mobile_login_desc:
            "SELLBY ఇప్పుడు తక్షణ మొబైల్ నంబర్ + OTP ధృవీకరణను ఉపయోగిస్తుంది! పాస్‌వర్డ్ రీసెట్‌లు ఇకపై అవసరం లేదు.",
        continue_to_login: "మొబైల్ లాగిన్‌కి కొనసాగండి"
    },


    /* =====================================================
       HINDI
       ===================================================== */

    hi: {

        // Shared
        app_name: "SELLBY",
        back: "पीछे",
        sell: "बेचें",
        loading: "लोड हो रहा है...",
        price_symbol: "₹",
        location_placeholder: "शहर, क्षेत्र या लैंडमार्क",
        desc_placeholder: "अपने आइटम का विवरण लिखें...",
        publish: "प्रकाशित करें",
        uploading: "अपलोड हो रहा है...",
        success: "सफल!",
        failed: "प्रकाशित करने में विफल। कृपया अपना कनेक्शन जांचें।",
        publish_success: "✅ विज्ञापन सफलतापूर्वक प्रकाशित हुआ!",
        identity_required: "कृपया सभी आवश्यक फ़ील्ड भरें और कम से कम एक फ़ोटो जोड़ें।",
        login_first: "कृपया पहले लॉगिन करें।",
        untitled_ad: "बिना नाम का विज्ञापन",
        save: "सहेजें",
        cancel: "रद्द करें",
        edit: "संपादित करें",
        delete: "हटाएं",
        remove: "हटाएं",

        // Navigation
        home: "होम",
        saved: "सहेजा गया",
        chat: "चैट",
        profile: "प्रोफ़ाइल",
        logout: "लॉग आउट",
        settings: "सेटिंग्स",
        my_ads: "मेरे विज्ञापन",
        my_chats: "मेरी चैट",

        // Home
        hero_title: "भारत का प्रीमियम मार्केटप्लेस",
        hero_subtitle: "आसानी से कुछ भी खरीदें और बेचें।",
        browse_categories: "श्रेणियां ब्राउज़ करें",
        latest_ads: "नवीनतम विज्ञापन",
        search_placeholder: "कुछ भी खोजें...",
        phone_placeholder: "मोबाइल नंबर दर्ज करें",
        no_ads_yet: "अभी तक कोई विज्ञापन प्रकाशित नहीं हुआ है।",
        view_all: "सभी देखें",

        // Categories
        cat_properties: "प्रॉपर्टीज",
        cat_mobiles: "मोबाइल",
        cat_cars: "कार",
        cat_bikes: "बाइक",
        cat_electronics: "इलेक्ट्रॉनिक्स",
        cat_furniture: "फर्नीचर",
        cat_others: "अन्य",

        // Empty States
        no_properties: "कोई प्रॉपर्टी नहीं मिली",
        no_mobiles: "कोई मोबाइल नहीं मिला",
        no_cars: "कोई कार नहीं मिली",
        no_bikes: "कोई बाइक नहीं मिली",
        no_electronics: "कोई इलेक्ट्रॉनिक्स नहीं मिला",
        no_furniture: "कोई फर्नीचर नहीं मिला",
        no_others: "कोई अन्य विज्ञापन नहीं मिला",
        empty_desc: "इस श्रेणी में पोस्ट करने वाले पहले व्यक्ति बनें!",

        // Ad Details
        ad_details_title: "विज्ञापन विवरण",
        chat_with_seller: "💬 विक्रेता से चैट करें",
        description: "विवरण",
        location: "स्थान",
        category: "श्रेणी",
        seller_info: "विक्रेता की जानकारी",
        post_date: "पोस्ट करने की तारीख",

        // Post Ad
        post_ad_title: "आप क्या बेच रहे हैं?",
        post_ad_subtitle: "जारी रखने के लिए एक श्रेणी चुनें",

        // Chat
        type_message: "अपना संदेश लिखें...",
        send: "भेजें",
        online: "ऑनलाइन",
        record_voice: "आवाज रिकॉर्ड करें",
        recording: "रिकॉर्डिंग:",
        send_voice: "आवाज भेजें 🎵",
        voice_note: "🎵 वॉयस नोट",

        // Settings
        settings_title: "सेटिंग्स",
        settings_subtitle: "प्राथमिकताएं और खाता",
        edit_profile: "प्रोफ़ाइल संपादित करें",
        profile_photo: "प्रोफ़ाइल फ़ोटो",
        language: "भाषा",
        preferences: "प्राथमिकताएं",
        notifications: "नोटिफिकेशन",
        privacy_policy: "गोपनीयता नीति",
        terms_conditions: "नियम और शर्तें",
        support: "समर्थन",
        help_support: "सहायता और समर्थन",
        help_title: "सहायता और समर्थन",
        help_subtitle: "हम आपकी क्या मदद कर सकते हैं?",

        help_content: [
            {
                h: "🛒 कैसे खरीदें?",
                p: "श्रेणियां ब्राउज़ करें, जो आपको पसंद हो उसे खोजें और मोलभाव करने और खरीदने के लिए विक्रेता के साथ चैट करें।"
            },
            {
                h: "📢 कैसे बेचें?",
                p: "'बेचें' बटन पर क्लिक करें, एक श्रेणी चुनें, फोटो और विवरण जोड़ें और प्रकाशित करें।"
            },
            {
                h: "🔒 सुरक्षा टिप्स",
                p: "लेन-देन के लिए हमेशा सार्वजनिक स्थानों पर मिलें और अपना पासवर्ड या संवेदनशील जानकारी कभी साझा न करें।"
            }
        ],

        safety_report: "सुरक्षा और रिपोर्ट",

        policy_title: "गोपनीयता नीति",

        policy_text:
            "SELLBY में, हम आपकी गोपनीयता को गंभीरता से लेते हैं। हम केवल अपनी सेवाएं प्रदान करने और एक सुरक्षित व्यापारिक वातावरण सुनिश्चित करने के लिए आवश्यक जानकारी एकत्र करते हैं। आपका डेटा सुरक्षित है और कभी भी तीसरे पक्ष को नहीं बेचा जाता है।",

        terms_title: "नियम और शर्तें",

        terms_text:
            "SELLBY का उपयोग करके, आप हमारी शर्तों से सहमत होते हैं। आपको सटीक जानकारी प्रदान करनी चाहिए, प्रतिबंधित वस्तुओं को पोस्ट नहीं करना चाहिए, और अन्य उपयोगकर्ताओं के साथ सम्मानपूर्वक व्यवहार करना चाहिए। हमारे पास ऐसी किसी भी सामग्री को हटाने का अधिकार है जो हमारी नीतियों का उल्लंघन करती है।",

        safety_title: "सुरक्षा और रिपोर्ट",

        safety_text:
            "आपकी सुरक्षा हमारी सर्वोच्च प्राथमिकता है। यदि आप किसी भी संदिग्ध गतिविधि या अनुचित सामग्री का सामना करते हैं, तो कृपया तुरंत इसकी रिपोर्ट करें। हम जांच करेंगे और आवश्यक कार्रवाई करेंगे।",

        report_btn: "संदिग्ध गतिविधि की रिपोर्ट करें",

        about_sellby: "SELLBY के बारे में",

        about_title: "हमारे बारे में",

        about_text:
            "SELLBY भारत का प्रीमियम स्थानीय मार्केटप्लेस है। हमारा मिशन खरीदना और बेचना एक बातचीत जितना आसान बनाना है। हमारे अभिनव वॉयस-टू-टेक्स्ट पोस्टिंग के साथ, आप सेकंडों में अपने आइटम सूचीबद्ध कर सकते हैं।",

        // Localization
        lang_en: "English",
        lang_te: "తెలుగు",
        lang_hi: "हिन्दी",
        select_lang: "भाषा चुनें",

        // Post Categories
        post_property: "प्रॉपर्टी पोस्ट करें",
        post_mobile: "मोबाइल पोस्ट करें",
        post_car: "कार पोस्ट करें",
        post_bike: "बाइक पोस्ट करें",
        post_electronics: "इलेक्ट्रॉनिक्स पोस्ट करें",
        post_furniture: "फर्नीचर पोस्ट करें",
        post_others: "अन्य पोस्ट करें",

        voice_posting: "वॉइस पोस्टिंग",

        desc_prop: "घर, अपार्टमेंट, भूमि",
        desc_mobile: "फोन, टैबलेट, सहायक उपकरण",
        desc_car: "सेडान, एसयूवी, हैचबैक",
        desc_bike: "मोटरसाइकिल, स्कूटर",
        desc_electronics: "लैपटॉप, टीवी, कैमरा",
        desc_furniture: "सोफा, बेड, टेबल",
        desc_voice: "बोलकर तेजी से बेचें",
        desc_others: "फैशन, किताबें, खेल",

        speak_instantly: "बोलें और अपना विज्ञापन तुरंत बनाएं",
        tap_mic: "माइक्रोफ़ोन पर टैप करें",
        speak_clearly: "तेलुगु, अंग्रेजी या हिंदी में स्पष्ट बोलें।",
        start_recording: "🎤 रिकॉर्डिंग शुरू करें",
        stop_recording: "⏹️ रिकॉर्डिंग बंद करें",
        ad_details_voice: "विज्ञापन विवरण (बोला गया विवरण)",
        continue_to_post: "पोस्ट करने के लिए जारी रखें",

        // Form Fields
        title: "शीर्षक",
        price: "कीमत",
        brand: "ब्रांड",
        model: "मॉडल",
        condition: "स्थिति",
        storage: "स्टोरेज",
        ram: "रैम",
        year: "वर्ष",
        kms: "किमी चली हुई",
        quantity: "मात्रा",
        material: "सामग्री",
        color: "रंग",
        property_type: "प्रॉपर्टी का प्रकार",
        area: "क्षेत्रफल (sq.ft)",
        add_photos: "फ़ोटो जोड़ें",
        upload_hint: "अधिकतम 10 चित्र अपलोड करें।",
        select_condition: "स्थिति चुनें",
        select_type: "प्रकार चुनें",
        new: "नया",
        used: "पुराना",
        like_new: "नए जैसा",
        good: "अच्छा",
        post_hint: "नीचे विवरण भरें",
        manual: "मैनुअल",
        automatic: "ऑटोमैटिक",
        petrol: "पेट्रोल",
        diesel: "डीजल",
        cng: "सीएनजी",
        electric: "इलेक्ट्रिक",
        hybrid: "हाइब्रिड",
        apartment: "अपार्टमेंट",
        independent_house: "स्वतंत्र घर",
        plot_land: "प्लॉट / भूमि",
        villa: "विला",
        commercial: "कार्यालय / वाणिज्यिक",
        pg_hostel: "पीजी / हॉस्टल",
        warranty: "वारंटी",
        available: "उपलब्ध",
        expired: "समाप्त",
        no_warranty: "कोई वारंटी नहीं",
        status: "स्थिति",
        sold: "बिक गया",
        delete_confirm: "क्या आप वाकई इस विज्ञापन को हटाना चाहते हैं?",
        full_name: "पूरा नाम",
        email_address: "ईमेल पता",
        phone_number: "फ़ोन नंबर",
        save_changes: "परिवर्तन सहेजें",
        take_photo: "फोटो लें",
        choose_gallery: "गैलरी",

        // Auth
        login: "लॉगिन",
        register: "रजिस्टर",
        email: "ईमेल",
        password: "पासवर्ड",
        forgot_password: "पासवर्ड भूल गए?",
        no_account: "खाता नहीं है?",
        have_account: "पहले से खाता है?",
        login_or_register: "लॉगिन या रजिस्टर",
        enter_mobile: "SMS के माध्यम से सत्यापन कोड प्राप्त करने के लिए अपना मोबाइल नंबर दर्ज करें।",
        continue: "जारी रखें",
        enter_code: "सत्यापन कोड दर्ज करें",
        code_sent: "कोड भेजा गया",
        verify_code: "कोड सत्यापित करें",
        change_number: "नंबर बदलें",
        resend_otp: "OTP पुन: भेजें",
        mobile_login_active: "मोबाइल लॉगिन सक्रिय",
        mobile_login_desc:
            "SELLBY अब तत्काल मोबाइल नंबर + OTP सत्यापन का उपयोग करता है! पासवर्ड रीसेट की अब आवश्यकता नहीं है।",
        continue_to_login: "मोबाइल लॉगिन पर जारी रखें"
    }
};


/* =========================================================
   LANGUAGE HELPERS
   ========================================================= */

const SUPPORTED_LANGUAGES = ["en", "te", "hi"];

const DEFAULT_LANGUAGE = "en";

const STORAGE_KEY = "sellby_lang";


/* =========================================================
   GET CURRENT LANGUAGE
   ========================================================= */

export function getLanguage() {

    const savedLanguage = localStorage.getItem(STORAGE_KEY);

    if (SUPPORTED_LANGUAGES.includes(savedLanguage)) {
        return savedLanguage;
    }

    return DEFAULT_LANGUAGE;
}


/* =========================================================
   SET LANGUAGE
   ========================================================= */

export function setLanguage(lang) {

    if (!SUPPORTED_LANGUAGES.includes(lang)) {
        console.warn(`Unsupported language: ${lang}`);
        return false;
    }

    localStorage.setItem(STORAGE_KEY, lang);

    return true;
}


/* =========================================================
   TRANSLATION FUNCTION
   ========================================================= */

export function t(key) {

    const lang = getLanguage();

    const currentTranslations =
        translations[lang] || translations[DEFAULT_LANGUAGE];

    if (currentTranslations[key] !== undefined) {
        return currentTranslations[key];
    }

    if (translations[DEFAULT_LANGUAGE][key] !== undefined) {
        return translations[DEFAULT_LANGUAGE][key];
    }

    return key;
}


/* =========================================================
   GET ALL TRANSLATIONS
   ========================================================= */

export function getTranslations() {

    const lang = getLanguage();

    return translations[lang] || translations[DEFAULT_LANGUAGE];
}


/* =========================================================
   APPLY TRANSLATIONS
   ========================================================= */

export function initTranslations() {

    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach(element => {

        const key = element.getAttribute("data-i18n");

        if (!key) {
            return;
        }

        const value = t(key);

        /*
         * Input / Textarea:
         * Use translation as placeholder.
         */
        if (
            element.tagName === "INPUT" ||
            element.tagName === "TEXTAREA"
        ) {

            element.placeholder = value;

        } else {

            element.textContent = value;

        }
    });


    /* =====================================================
       PLACEHOLDER TRANSLATIONS
       ===================================================== */

    const placeholderElements =
        document.querySelectorAll("[data-i18n-placeholder]");

    placeholderElements.forEach(element => {

        const key =
            element.getAttribute("data-i18n-placeholder");

        if (!key) {
            return;
        }

        element.placeholder = t(key);
    });


    /* =====================================================
       VALUE TRANSLATIONS
       ===================================================== */

    const valueElements =
        document.querySelectorAll("[data-i18n-value]");

    valueElements.forEach(element => {

        const key =
            element.getAttribute("data-i18n-value");

        if (!key) {
            return;
        }

        element.value = t(key);
    });


    /* =====================================================
       DOCUMENT TITLE
       ===================================================== */

    const titleElement = document.querySelector("title[data-i18n]");

    if (titleElement) {

        const titleKey =
            titleElement.getAttribute("data-i18n");

        document.title = t(titleKey);
    }


    /* =====================================================
       HTML LANG ATTRIBUTE
       ===================================================== */

    document.documentElement.lang = getLanguage();
}


/* =========================================================
   AUTO INITIALIZATION
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initTranslations,
        { once: true }
    );

} else {

    initTranslations();

}


/* =========================================================
   END SELLBY i18n.js
   ========================================================= */
