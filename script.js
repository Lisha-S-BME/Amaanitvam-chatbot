// ============================================
// AMAANITVAM FOUNDATION CHATBOT
// ============================================

const CONFIG = {
    foundationName: 'Amaanitvam Foundation',
    phone: '+91 98999 23266',
    email: 'amaanitvamfoundation@gmail.com',
    website: 'https://www.amaanitvam.org',
    address: 'H.No 269 W.NO2, Mehrauli, Gadaipur, South Delhi - 110030',
    darpanId: 'DL/2025/0817469',
    donationAmounts: ['₹500', '₹1000', '₹2000', '₹5000', 'Any Amount'],
    typingDelay: 800,
};

const NLP = {
    greetings: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings', 'yo', 'sup', 'heya'],
    about: ['who are you', 'what is this', 'about', 'tell me about', 'what do you do', 'your foundation', 'what is foundation', 'about foundation', 'know more', 'what is amaanitvam', 'tell me more', 'your work', 'your mission', 'your vision', 'what you guys do', 'purpose', 'objective'],
    projects: ['project', 'programs', 'initiatives', 'what you do', 'your projects', 'list projects', 'all projects', 'what projects', 'tell projects', 'ongoing projects', 'current projects', 'your work projects'],
    shiksha: ['shiksha', 'education', 'study', 'school', 'teaching', 'learning', 'educate', 'academic', 'student', 'children education', 'education program', 'education project'],
    manthan: ['manthan', 'skill', 'development', 'training', 'vocational', 'skill development', 'skill training', 'professional development', 'career', 'employability'],
    pravah: ['pravah', 'community', 'welfare', 'community development', 'social welfare', 'community program', 'outreach', 'community service', 'social work'],
    donate: ['donate', 'donation', 'contribute', 'give money', 'support financially', 'ways to donate', 'how to donate', 'make donation', 'want to donate', 'donation amount', 'how much', 'donation options', 'financial support', 'give donation', 'contribute money', 'sponsor'],
    volunteer: ['volunteer', 'help', 'join', 'participate', 'contribute time', 'how to volunteer', 'become volunteer', 'volunteering', 'want to volunteer', 'join as volunteer', 'volunteer work', 'volunteer opportunity', 'help out', 'get involved', 'join community', 'how to join', 'become part'],
    contact: ['contact', 'reach', 'get in touch', 'connect', 'contact details', 'how to contact', 'reach you', 'contact info', 'contact information', 'get in contact'],
    phone: ['phone', 'call', 'mobile', 'telephone', 'number', 'phone number', 'contact number', 'mobile number', 'whatsapp', 'dial', 'ring'],
    email: ['email', 'mail', 'gmail', 'email address', 'email id', 'e-mail', 'electronic mail', 'write to'],
    address: ['address', 'location', 'where', 'office', 'visit', 'where are you', 'located', 'place', 'headquarters', 'office address', 'where is', 'direction', 'map'],
    website: ['website', 'site', 'url', 'link', 'web', 'webpage', 'web address', 'online', 'internet', 'www'],
    feedback: ['helpful', 'useful', 'good', 'thanks', 'thank you', 'appreciate', 'great', 'awesome', 'nice'],
    bye: ['bye', 'goodbye', 'see you', 'tata', 'cya', 'farewell', 'catch you later', 'later', 'see ya', 'good night', 'take care', 'have a good day', 'byee', 'byebye'],
    inappropriate: ['salary', 'stipend', 'payment', 'money', 'paid', 'compensation', 'earning', 'income', 'wage', 'how much pay', 'get paid', 'remuneration']
};

let conversationState = {
    waitingFeedback: false,
    lastUserMessage: '',
    messageCount: 0,
    feedbackTimeout: null,
};

function levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i++) track[0][i] = i;
    for (let j = 0; j <= str2.length; j++) track[j][0] = j;
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(track[j][i - 1] + 1, track[j - 1][i] + 1, track[j - 1][i - 1] + indicator);
        }
    }
    return track[str2.length][str1.length];
}

function detectSpellingMistake(word) {
    const allKeywords = Object.values(NLP).flat();
    let bestMatch = null;
    let minDistance = Infinity;
    for (const keyword of allKeywords) {
        const distance = levenshteinDistance(word, keyword);
        if (distance < minDistance && distance <= 2 && word.length > 2) {
            minDistance = distance;
            bestMatch = keyword;
        }
    }
    return bestMatch && minDistance <= 1 ? bestMatch : null;
}

function getAllMatchedIntents(input) {
    const inputLower = input.toLowerCase().trim();
    const matchedIntents = [];
    for (const [intent, keywords] of Object.entries(NLP)) {
        for (const keyword of keywords) {
            if (inputLower.includes(keyword)) {
                matchedIntents.push(intent);
                break;
            }
        }
    }
    return matchedIntents;
}

window.addEventListener('DOMContentLoaded', () => {
    addBotMessage(`
        👋 <strong>Hello! Welcome to Amaanitvam Foundation!</strong><br><br>
        I'm your virtual assistant, here to help you 24/7. You can ask me about:<br><br>
        🏛️ <strong>Our Foundation</strong> - Who we are and what we do<br>
        📘 <strong>Our Projects</strong> - Shiksha, Manthan, Pravah<br>
        ❤️ <strong>Donations</strong> - How to support our cause<br>
        🙋 <strong>Volunteering</strong> - How to get involved<br>
        📞 <strong>Contact Info</strong> - Reach out to us<br><br>
        <em>How can I assist you today? 😊</em>
    `);
    document.getElementById('user-input').focus();
});

function sendMessage() {
    const inputField = document.getElementById('user-input');
    const userMessage = inputField.value.trim();
    if (!userMessage) return;
    
    if (conversationState.feedbackTimeout) {
        clearTimeout(conversationState.feedbackTimeout);
    }
    removeFeedbackContainer();
    
    conversationState.lastUserMessage = userMessage;
    conversationState.messageCount++;
    
    addUserMessage(userMessage);
    inputField.value = '';
    inputField.focus();
    
    if (conversationState.waitingFeedback) {
        handleFeedbackResponse(userMessage.toLowerCase().trim());
        return;
    }
    
    const typingId = showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator(typingId);
        const response = generateResponse(userMessage.toLowerCase().trim());
        addBotMessage(response);
        
        conversationState.feedbackTimeout = setTimeout(() => {
            if (!conversationState.waitingFeedback) {
                showFeedbackButtons();
            }
        }, 500);
    }, CONFIG.typingDelay);
}

function generateResponse(input) {
    const words = input.split(/\s+/);
    const spellingSuggestions = [];
    
    for (const word of words) {
        if (word.length > 3) {
            const suggestion = detectSpellingMistake(word);
            if (suggestion && suggestion !== word) {
                spellingSuggestions.push(suggestion);
            }
        }
    }
    
    let spellingNote = '';
    if (spellingSuggestions.length > 0) {
        const uniqueSuggestions = [...new Set(spellingSuggestions)];
        spellingNote = `<em>💡 Did you mean: <strong>${uniqueSuggestions.join(', ')}</strong>?</em><br><br>`;
    }
    
    const matchedIntents = getAllMatchedIntents(input);
    
    if (input.includes('shiksha')) {
        return spellingNote + generateShikshaResponse();
    }
    
    if (input.includes('manthan')) {
        return spellingNote + generateManthanResponse();
    }
    
    if (input.includes('pravah')) {
        return spellingNote + generatePravahResponse();
    }
    
    if (matchedIntents.includes('bye') || ['bye', 'goodbye', 'byee', 'byebye', 'see you', 'tata', 'farewell', 'good night'].some(w => input.includes(w))) {
        return generateFarewellResponse();
    }
    
    if (matchedIntents.includes('greetings') && matchedIntents.length === 1) {
        return generateGreetingResponse();
    }
    
    if (matchedIntents.includes('inappropriate')) {
        return generateInappropriateResponse();
    }
    
    if (matchedIntents.includes('website') && matchedIntents.length <= 2) {
        return generateWebsiteResponse();
    }
    
    if (matchedIntents.includes('phone') && !matchedIntents.includes('contact')) {
        return generatePhoneResponse();
    }
    
    if (matchedIntents.includes('email') && !matchedIntents.includes('contact')) {
        return generateEmailResponse();
    }
    
    if (matchedIntents.includes('address') || input.includes('where')) {
        return generateAddressResponse();
    }
    
    if (matchedIntents.includes('phone') && matchedIntents.includes('email')) {
        return generateContactResponse();
    }
    
    if (matchedIntents.includes('contact')) {
        return generateContactResponse();
    }
    
    if (matchedIntents.includes('donate')) {
        return spellingNote + generateDonateResponse();
    }
    
    if (matchedIntents.includes('volunteer')) {
        return spellingNote + generateVolunteerResponse();
    }
    
    if (matchedIntents.includes('projects')) {
        return spellingNote + generateProjectsResponse();
    }
    
    if (matchedIntents.includes('about') || input.includes('who are you') || input.includes('what is this') || input.includes('foundation')) {
        return spellingNote + generateAboutResponse();
    }
    
    return generateUnknownResponse(input);
}

function generateGreetingResponse() {
    return `
        👋 <strong>Hello! Welcome to Amaanitvam Foundation!</strong><br><br>
        I'm here to help you 24/7. How can I assist you today?<br><br>
        <em>You can ask me about our foundation, projects, donations, volunteering, or contact details.</em>
    `;
}

function generateAboutResponse() {
    return `
        🏛️ <strong>About Amaanitvam Foundation</strong><br><br>
        We are a dedicated <strong>non-profit organization</strong> committed to transforming lives through meaningful social initiatives.<br><br>
        <strong>Our Mission:</strong><br>
        📚 <strong>Education</strong> - Providing quality education to underprivileged children<br>
        🏥 <strong>Healthcare</strong> - Ensuring access to basic healthcare services<br>
        🍎 <strong>Nutrition</strong> - Fighting malnutrition with proper nutrition programs<br>
        🤝 <strong>Community Welfare</strong> - Building stronger, self-sufficient communities<br><br>
        <strong>DARPAN ID:</strong> ${CONFIG.darpanId}<br><br>
        <a href="${CONFIG.website}/who-we-are/" target="_blank" class="action-btn">Learn More About Us →</a>
    `;
}

function generateProjectsResponse() {
    return `
        📘 <strong>Our Projects & Initiatives</strong><br><br>
        We run three flagship programs:<br><br>
        🎓 <strong>Project Shiksha</strong> - Education support for children<br>
        📚 <strong>Project Manthan</strong> - Skill development for youth & adults<br>
        🌊 <strong>Project Pravah</strong> - Community welfare & outreach<br><br>
        <em>Which project would you like to know more about? Just ask!</em><br><br>
        <a href="${CONFIG.website}/stories/" target="_blank" class="action-btn">View Our Stories →</a>
    `;
}

function generateShikshaResponse() {
    return `
        🎓 <strong>Project Shiksha - Education for All</strong><br><br>
        Our flagship education initiative focused on breaking the cycle of poverty through learning.<br><br>
        <strong>What We Provide:</strong><br>
        📖 Basic reading, writing & comprehension skills<br>
        📐 Academic support across all subjects<br>
        💪 Confidence building & personality development<br>
        🎯 Career guidance & mentoring programs<br>
        📚 Free study materials & resources<br><br>
        <div class="highlight-box">
            <strong>🌟 Impact:</strong> Hundreds of children empowered with quality education and brighter futures.
        </div><br>
        <a href="${CONFIG.website}/who-we-are/" target="_blank" class="action-btn">More About Shiksha →</a>
    `;
}

function generateManthanResponse() {
    return `
        📚 <strong>Project Manthan - Skill Development</strong><br><br>
        Empowering individuals with practical skills for sustainable livelihoods.<br><br>
        <strong>Program Areas:</strong><br>
        💻 <strong>Digital Literacy</strong> - Basic to advanced computer skills<br>
        🎨 <strong>Vocational Training</strong> - Tailoring, crafts, and trades<br>
        📊 <strong>Professional Skills</strong> - Communication, teamwork, leadership<br>
        🤝 <strong>Soft Skills</strong> - Interview preparation, workplace etiquette<br><br>
        <div class="highlight-box">
            <strong>🎯 Goal:</strong> Making every individual employable and self-reliant through skill empowerment.
        </div><br>
        <a href="${CONFIG.website}/stories/" target="_blank" class="action-btn">Learn More →</a>
    `;
}

function generatePravahResponse() {
    return `
        🌊 <strong>Project Pravah - Community Welfare</strong><br><br>
        Creating waves of positive change through community-driven development.<br><br>
        <strong>Our Initiatives:</strong><br>
        🏘️ <strong>Community Development</strong> - Infrastructure & resource access<br>
        🌱 <strong>Environmental Programs</strong> - Cleanliness drives, tree plantation<br>
        👥 <strong>Social Awareness</strong> - Health camps, legal awareness, women empowerment<br>
        💡 <strong>Sustainable Livelihoods</strong> - Self-help groups, micro-enterprises<br><br>
        <div class="highlight-box">
            <strong>🤝 Join Us:</strong> Be part of the movement to build stronger, self-sufficient communities.
        </div><br>
        <a href="${CONFIG.website}/stories/" target="_blank" class="action-btn">Explore Pravah →</a>
    `;
}

function generateDonateResponse() {
    return `
        ❤️ <strong>Support Our Cause - Make a Donation</strong><br><br>
        Your generosity directly transforms lives. Every contribution, big or small, creates impact.<br><br>
        <strong>Donation Options:</strong><br>
        <span class="donation-amount">₹500</span> 
        <span class="donation-amount">₹1,000</span> 
        <span class="donation-amount">₹2,000</span> 
        <span class="donation-amount">₹5,000</span> 
        <span class="donation-amount">Any Amount</span><br><br>
        <strong>Ways to Give:</strong><br>
        💰 <strong>One-time Donation</strong> - Support a specific program<br>
        🔄 <strong>Monthly Giving</strong> - Become a Champion donor with recurring support<br>
        🎁 <strong>Gift Donation</strong> - Honor someone special with a donation in their name<br><br>
        <div class="highlight-box">
            <strong>✅ Benefits:</strong><br>
            • 80G tax exemption certificate<br>
            • 100% funds go to child welfare programs<br>
            • Regular impact updates & reports<br>
            • Complete transparency in fund utilization
        </div><br>
        <a href="${CONFIG.website}/donate/" target="_blank" class="action-btn">❤️ Donate Now</a>
    `;
}

function generateVolunteerResponse() {
    return `
        🙋 <strong>Volunteer With Us - Make a Real Difference</strong><br><br>
        Share your time and skills to create lasting impact in communities.<br><br>
        <strong>Volunteer Opportunities:</strong><br>
        📚 <strong>Teaching & Tutoring</strong> - Help children with studies (no prior experience needed)<br>
        🎪 <strong>Event Organization</strong> - Plan community events & awareness drives<br>
        🎨 <strong>Content & Design</strong> - Create materials, manage social media<br>
        🤝 <strong>On-ground Support</strong> - Field activities & community outreach<br><br>
        <div class="highlight-box">
            <strong>🌟 Volunteer Benefits:</strong><br>
            • Make tangible impact in children's lives<br>
            • Gain valuable hands-on experience<br>
            • Join a passionate community of changemakers<br>
            • Receive volunteer certificate<br>
            • Flexible time commitment
        </div><br>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSfeYkrNqw7eXnbeOVjVbAImPOapukInKOZ05FU3UIDdtv3hXA/viewform" target="_blank" class="action-btn">✋ Apply to Volunteer Now</a>
    `;
}

function generateContactResponse() {
    return `
        📬 <strong>Get in Touch</strong><br><br>
        We'd love to hear from you! Here's how to reach us:<br><br>
        📞 <strong>Phone:</strong> <a href="tel:${CONFIG.phone.replace(/\s/g, '')}">${CONFIG.phone}</a><br>
        📧 <strong>Email:</strong> <a href="mailto:${CONFIG.email}">${CONFIG.email}</a><br>
        📍 <strong>Address:</strong> ${CONFIG.address}<br>
        🏛️ <strong>DARPAN ID:</strong> ${CONFIG.darpanId}<br><br>
        <a href="${CONFIG.website}" target="_blank" class="action-btn">Visit Our Website →</a>
    `;
}

function generatePhoneResponse() {
    return `
        📞 <strong>Contact Number</strong><br><br>
        You can reach us at:<br><br>
        <strong><a href="tel:${CONFIG.phone.replace(/\s/g, '')}">${CONFIG.phone}</a></strong><br><br>
        <em>Feel free to call us during working hours. We're happy to help!</em>
    `;
}

function generateEmailResponse() {
    return `
        📧 <strong>Email Address</strong><br><br>
        Write to us at:<br><br>
        <strong><a href="mailto:${CONFIG.email}">${CONFIG.email}</a></strong><br><br>
        <em>We typically respond within 24 hours. Don't hesitate to reach out!</em>
    `;
}

function generateAddressResponse() {
    return `
        📍 <strong>Our Address</strong><br><br>
        <strong>Amaanitvam Foundation</strong><br>
        ${CONFIG.address}<br><br>
        <a href="https://maps.google.com/?q=${encodeURIComponent(CONFIG.address)}" target="_blank" class="action-btn">📍 View on Google Maps</a>
    `;
}

function generateWebsiteResponse() {
    return `
        🌐 <strong>Our Website</strong><br><br>
        Visit us online:<br><br>
        <strong><a href="${CONFIG.website}" target="_blank">${CONFIG.website}</a></strong><br><br>
        <em>Explore our work, stories, and ways to get involved!</em><br><br>
        <a href="${CONFIG.website}" target="_blank" class="action-btn">🚀 Visit Website</a>
    `;
}

function generateFarewellResponse() {
    return `
        👋 <strong>Thank you for chatting with Amaanitvam Foundation!</strong><br><br>
        We appreciate your interest in our work. Feel free to reach out anytime:<br><br>
        🌐 <a href="${CONFIG.website}" target="_blank">Visit our website</a><br>
        📞 <a href="tel:${CONFIG.phone.replace(/\s/g, '')}">Call us at ${CONFIG.phone}</a><br>
        📧 <a href="mailto:${CONFIG.email}">Email us</a><br><br>
        <em>Wishing you a wonderful day ahead! 😊💕</em>
    `;
}

function generateInappropriateResponse() {
    return `
        🔒 <strong>Information Not Available</strong><br><br>
        I'm sorry, but I cannot disclose information related to salaries, stipends, or compensation details through this chatbot.<br><br>
        For such specific inquiries, please contact us directly:<br><br>
        📞 <a href="tel:${CONFIG.phone.replace(/\s/g, '')}">${CONFIG.phone}</a><br>
        📧 <a href="mailto:${CONFIG.email}">${CONFIG.email}</a><br><br>
        <em>I'm happy to help with any other questions about our foundation, projects, donations, or volunteering!</em>
    `;
}

function generateUnknownResponse(input) {
    return `
        🤔 <strong>I'd Love to Help You Better!</strong><br><br>
        I'm not sure I understood your question about "<em>${escapeHTML(input.length > 50 ? input.substring(0, 50) + '...' : input)}</em>".<br><br>
        <strong>Here's what I can help you with:</strong><br><br>
        🏛️ Information about our foundation<br>
        📘 Details on projects (Shiksha, Manthan, Pravah)<br>
        ❤️ How to donate and support us<br>
        🙋 How to volunteer and get involved<br>
        📞 Contact information<br><br>
        <em>Please rephrase your question, or contact us directly:</em><br>
        📞 <a href="tel:${CONFIG.phone.replace(/\s/g, '')}">${CONFIG.phone}</a><br>
        📧 <a href="mailto:${CONFIG.email}">${CONFIG.email}</a>
    `;
}

function showFeedbackButtons() {
    removeFeedbackContainer();
    const feedbackHTML = `
        <div class="feedback-container" id="feedback-container">
            <p>Was this helpful?</p>
            <div class="feedback-buttons">
                <button class="feedback-btn yes" onclick="submitFeedback('yes')">👍 Yes</button>
                <button class="feedback-btn no" onclick="submitFeedback('no')">👎 No</button>
            </div>
        </div>
    `;
    const chatBox = document.getElementById('chat-box');
    chatBox.insertAdjacentHTML('beforeend', feedbackHTML);
    chatBox.scrollTop = chatBox.scrollHeight;
    conversationState.waitingFeedback = true;
}

function removeFeedbackContainer() {
    const container = document.getElementById('feedback-container');
    if (container) container.remove();
    conversationState.waitingFeedback = false;
}

function submitFeedback(type) {
    removeFeedbackContainer();
    conversationState.waitingFeedback = false;
    if (type === 'yes') {
        addBotMessage('😊 <strong>Wonderful! Glad I could help!</strong> Is there anything else you\'d like to know?');
    } else {
        addBotMessage(`
            🙏 <strong>I apologize for that.</strong><br><br>
            For more specific assistance, please contact our team directly:<br>
            📞 <a href="tel:${CONFIG.phone.replace(/\s/g, '')}">${CONFIG.phone}</a><br>
            📧 <a href="mailto:${CONFIG.email}">${CONFIG.email}</a>
        `);
    }
}

function handleFeedbackResponse(input) {
    conversationState.waitingFeedback = false;
    const positiveResponses = ['yes', 'y', 'yeah', 'sure', 'ok', 'okay', 'yep', 'yup'];
    const negativeResponses = ['no', 'nope', 'nah', 'not really', 'not'];
    if (positiveResponses.includes(input)) {
        addBotMessage('😊 <strong>Great!</strong> What else would you like to know about Amaanitvam Foundation?');
    } else if (negativeResponses.includes(input)) {
        addBotMessage(`
            🙏 <strong>Sorry about that!</strong><br><br>
            For more help, reach us directly:<br>
            📞 <a href="tel:${CONFIG.phone.replace(/\s/g, '')}">${CONFIG.phone}</a><br>
            📧 <a href="mailto:${CONFIG.email}">${CONFIG.email}</a>
        `);
    }
}

function quickAsk(question) {
    document.getElementById('user-input').value = question;
    sendMessage();
}

function addUserMessage(message) {
    const chatBox = document.getElementById('chat-box');
    const messageHTML = `<div class="message user-message"><div class="message-content">${escapeHTML(message)}</div></div>`;
    chatBox.insertAdjacentHTML('beforeend', messageHTML);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addBotMessage(message) {
    const chatBox = document.getElementById('chat-box');
    const messageHTML = `<div class="message bot-message"><div class="message-content">${message}</div></div>`;
    chatBox.insertAdjacentHTML('beforeend', messageHTML);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const typingHTML = `
        <div class="message bot-message" id="${id}">
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
    const chatBox = document.getElementById('chat-box');
    chatBox.insertAdjacentHTML('beforeend', typingHTML);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) indicator.remove();
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('user-input');
    inputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    document.addEventListener('click', function(e) {
        if (e.target !== inputField && !e.target.closest('button') && !e.target.closest('.suggestion-chip') && !e.target.closest('.feedback-btn')) {
            inputField.focus();
        }
    });
});