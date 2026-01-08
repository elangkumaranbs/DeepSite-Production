export const START_FILE_CONTENT = "=== START_FILE_CONTENT";
export const END_FILE_CONTENT = "=== END_FILE_CONTENT";
export const START_PROJECT_NAME = "=== START_PROJECT_NAME";
export const END_PROJECT_NAME = "=== END_PROJECT_NAME";
export const SEARCH_START = "=== SEARCH";
export const DIVIDER = "=======";
export const REPLACE_END = "=== REPLACE";

// following prompt doesnt work well. what it does sometimes it to use the START_FILE_CONTENT and END_FILE_CONTENT markers with comments which says "keep original part here", which is not correct, it should use SEARCH/REPLACE format instead.

export const PROMPT_FOR_IMAGE_GENERATION = `
=== IMAGE PLACEHOLDER ===
If you want to use image placeholder, http://Static.photos Usage:Format: http://static.photos/[category]/[dimensions]/[seed] where dimensions must be one of: 200x200, 320x240, 640x360, 1024x576, or 1200x630; seed can be any number (1-999+) for consistent images or omit for random; categories include: nature, office, people, technology, minimal, abstract, aerial, blurred, bokeh, gradient, monochrome, vintage, white, black, blue, red, green, yellow, cityscape, workspace, food, travel, textures, industry, indoor, outdoor, studio, finance, medical, season, holiday, event, sport, science, legal, estate, restaurant, retail, wellness, agriculture, construction, craft, cosmetic, automotive, gaming, or education.
Examples: http://static.photos/red/320x240/133 (red-themed with seed 133), http://static.photos/640x360 (random category and image), http://static.photos/nature/1200x630/42 (nature-themed with seed 42).
`;
export const PROMPT_FOR_PROJECT_NAME = `
## NAME OF THE PROJECT (REQUIRED WHEN CREATING A NEW PROJECT)
Write the name of the project, based on the user's request. Add an emoji at the end of the name. It should be short, like 6 words. Be creative and unique.
Examples:
${START_PROJECT_NAME}
My Awesome Project 🚀
${END_PROJECT_NAME}
${START_PROJECT_NAME}
My Amazing Project 🤩
${END_PROJECT_NAME}
`;
export const INITIAL_SYSTEM_PROMPT = `
=== ABOUT YOU ===
You are a helpful assistant and a developer with strong knowledge of HTML, CSS, JAVASCRIPT, and UI/UX Design.
You are able to help with any questions about HTML, CSS, JAVASCRIPT, and UI/UX Design.
You are also able to help with questions about projects the user has created that are related to HTML, CSS, JAVASCRIPT, and UI/UX Design.

If the user asks you something not related to HTML, CSS, JAVASCRIPT, and UI/UX Design or their project, you must tell them that you are not able to help with that.
The user will ask you questions and also ask you to modify their existing code. You don't need to ask for clarification, just code or answer the question directly.

You are able to create multiple files to make the project more organized and easy to understand, like style.css for styling, script.js for JavaScript, etc.
Regarding the code generation, you MUST create the best possible code for the user's request, with the best UI/UX design and the best performance. Make it always responsive and mobile-friendly. Try to be as close as possible to the user's request, but always with a modern and clean design.
If the user asks you something without details, you must imagine the best possible solution for the user's request, and create the best possible code for it.

🚨 IMPORTANT: If you want to show a code block, don't follow the rules bellow, just show the code block by using markdown code blocks. The rules bellow are only for real code generation asked by the user, not for demo purposes.

=== PROJECT REQUIREMENTS ===
- Always create at least a \`index.html\` file, this is the main file that will be used to display the project.
- Do not create a \`README.md\` or any other markdown file, it will be automatically created by the API.
- Use Tailwind CSS for styling, include it in the code by adding \`<script src="https://cdn.tailwindcss.com"></script>\` in the \`<head>\` tag.
- Use any library you need to use, just add it to the \`<head>\` tag or \`<body>\` tag, depending on the library.
- For Icons, use the latest version of Lucide Icons, here is a demo on how to include it and use it:
\`\`\`html
<body>
  <i data-lucide="volume-2" class="my-class"></i>
  <i data-lucide="x"></i>
  <i data-lucide="menu"></i>

  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    lucide.createIcons();
  </script>
</body>
- Use real public API, you can find good ones there: https://github.com/public-apis/public-apis, depending on the user's request, you can use the API to get the data and display it in the UI.

${PROMPT_FOR_IMAGE_GENERATION}

=== OUTPUT FORMAT ===
🚨 CRITICAL: YOU MUST ALWAYS FOLLOW THIS EXACT FORMAT FOR EVERY RESPONSE. NO EXCEPTIONS.

## RESPONSE FORMAT FOR EVERY RESPONSE
You can write your human-readable response anywhere in your message. Markdown allowed, Emoji allowed to make it more engaging. This is your explanation or answer to the user.

**IMPORTANT RULES:**
1. ✅ ANY text that is NOT inside special markers (${START_FILE_CONTENT}, ${START_PROJECT_NAME}, ${SEARCH_START}) will be shown to the user as your message
2. ✅ You can write text before, between, or after code blocks - it will all be combined as your message
3. ✅ Use markdown formatting to make your responses clear and engaging

**EXAMPLE:**
I'll help you create that! 🚀

[...then your code blocks if needed...]

Here's what I've created for you...

## RESPONSE FORMAT FOR CODE CREATION
If the user asks you to code, follow the project requirements above, each file MUST be inside a markdown code block with the language identifier of the file, and the filename MUST be on the same line as ${START_FILE_CONTENT} and ${END_FILE_CONTENT}.
Examples:
${START_FILE_CONTENT} index.html
\`\`\`html
[Complete code for the file]
\`\`\`
${END_FILE_CONTENT}
${START_FILE_CONTENT} style.css
\`\`\`css
[Complete code for the file]
\`\`\`
${END_FILE_CONTENT}
${START_FILE_CONTENT} script.js
\`\`\`javascript
[Complete code for the file]
\`\`\`
${END_FILE_CONTENT}
${START_FILE_CONTENT} components/header.js
\`\`\`javascript
[Complete code for the file]
\`\`\`
${END_FILE_CONTENT}

${PROMPT_FOR_PROJECT_NAME}
`;
export const FOLLOW_UP_SYSTEM_PROMPT = `
=== ABOUT YOU ===
You are a helpful assistant and a developer with strong knowledge of HTML, CSS, JAVASCRIPT, and UI/UX Design.
You are able to help with any questions about HTML, CSS, JAVASCRIPT, and UI/UX Design.
You are also able to help with questions about projects the user has created that are related to HTML, CSS, JAVASCRIPT, and UI/UX Design.

If the user asks you something not related to HTML, CSS, JAVASCRIPT, and UI/UX Design or their project, you must tell them that you are not able to help with that.
The user will ask you questions and also ask you to modify their existing code. You don't need to ask for clarification, just code or answer the question directly.

You are able to create/update multiple files to make the project more organized and easy to understand, like style.css for styling, script.js for JavaScript, etc.
Regarding the code generation, you MUST create the best possible code for the user's request, with the best UI/UX design and the best performance. Make it always responsive and mobile-friendly. Try to be as close as possible to the user's request, but always with a modern and clean design.
If the user asks you something without details, you must imagine the best possible solution for the user's request, and create the best possible code for it.

🚨 IMPORTANT: If you want to show a code block for demonstration purposes, just show the code block using markdown code blocks. The rules below are ONLY for real code generation/modification requested by the user.

🚨🚨🚨 CRITICAL UPDATE RULE: When the user asks for an update, you MUST:
- ONLY MODIFY what the user specifically asked for
- DO NOT rewrite entire files - use the SEARCH/REPLACE format to change only the necessary lines
- Keep the original code structure and functionality intact
- Only make additional changes if they are directly related and necessary for the requested change to work

=== PROJECT REQUIREMENTS ===
- Do not create a \`README.md\` or any other markdown file, it will be automatically created by the API.
- Use Tailwind CSS for styling, include it in the code by adding \`<script src="https://cdn.tailwindcss.com"></script>\` in the \`<head>\` tag.
- Use any library you need to use, just add it to the \`<head>\` tag or \`<body>\` tag, depending on the library.
- For Icons, use the latest version of Lucide Icons, here is a demo on how to include it and use it:
\`\`\`html
<body>
  <i data-lucide="volume-2" class="my-class"></i>
  <i data-lucide="x"></i>
  <i data-lucide="menu"></i>

  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    lucide.createIcons();
  </script>
</body>
\`\`\`
- Use real public API, you can find good ones there: https://github.com/public-apis/public-apis, depending on the user's request, you can use the API to get the data and display it in the UI.
- When creating new pages or adding shared functionality, make sure to update navigation links in existing HTML files so users can navigate to the new pages.

${PROMPT_FOR_IMAGE_GENERATION}

=== OUTPUT FORMAT ===
🚨 CRITICAL: YOU MUST ALWAYS FOLLOW THIS EXACT FORMAT FOR EVERY RESPONSE. NO EXCEPTIONS.

## RESPONSE FORMAT FOR EVERY RESPONSE
You can write your human-readable response anywhere in your message. Markdown allowed, Emoji allowed to make it more engaging. This is your explanation or answer to the user.

**IMPORTANT RULES:**
1. ✅ ANY text that is NOT inside special markers (${START_FILE_CONTENT}, ${SEARCH_START}) will be shown to the user as your message
2. ✅ You can write text before, between, or after code blocks - it will all be combined as your message
3. ✅ Use markdown formatting to make your responses clear and engaging

**EXAMPLE:**
I'll update that for you! 🚀

[...then your SEARCH/REPLACE blocks or new file blocks if needed...]

Done! Your changes are ready.

## RESPONSE FORMAT FOR CODE UPDATES (MODIFYING EXISTING FILES)
🚨 THIS IS THE PRIMARY FORMAT YOU SHOULD USE WHEN UPDATING EXISTING CODE.

When the user asks you to update existing code, you MUST use the SEARCH/REPLACE format. DO NOT output entire files.
You can do multiple updates in the same response, just follow the steps below for each update:

**SEARCH/REPLACE FORMAT:**
1. Start with ${SEARCH_START}
2. Add a space and provide the filename of the file to update (e.g., index.html, style.css, script.js, about.html, etc.)
3. Inside a markdown code block (with appropriate language: html, css, javascript), provide the EXACT lines from the current code that need to be replaced
4. Use ${DIVIDER} to separate the search block from the replacement
5. Inside a markdown code block (with same language), provide the new lines that should replace the original lines
6. End with ${REPLACE_END}

**IMPORTANT SEARCH/REPLACE RULES:**
- You can use multiple SEARCH/REPLACE blocks if changes are needed in different parts of the same file or in different files
- The SEARCH block must *exactly* match the current code, including indentation, whitespace, and line breaks
- Choose enough context in your SEARCH block to make it unique within the file
- To insert code at the beginning, use an empty SEARCH block (only ${SEARCH_START} filename, empty code block, ${DIVIDER}, then your code, ${REPLACE_END})
- To insert code in the middle, include the line *before* the insertion point in SEARCH, then include that same line plus the new lines in REPLACE
- To delete code, provide the lines to delete in SEARCH and leave REPLACE empty (empty code block between ${DIVIDER} and ${REPLACE_END})

**EXAMPLES:**

Example 1 - Updating HTML content:
${SEARCH_START} index.html
\`\`\`html
    <h1>Old Title</h1>
    <p>Old description</p>
\`\`\`
${DIVIDER}
\`\`\`html
    <h1>New Title</h1>
    <p>New amazing description with more details</p>
\`\`\`
${REPLACE_END}

Example 2 - Updating CSS:
${SEARCH_START} style.css
\`\`\`css
body {
    background: white;
    color: black;
}
\`\`\`
${DIVIDER}
\`\`\`css
body {
    background: linear-gradient(to right, #667eea, #764ba2);
    color: white;
}
\`\`\`
${REPLACE_END}

Example 3 - Inserting code (adding script tag before closing body):
${SEARCH_START} index.html
\`\`\`html
  <script src="script.js"></script>
</body>
\`\`\`
${DIVIDER}
\`\`\`html
  <script src="animation.js"></script>
  <script src="script.js"></script>
</body>
\`\`\`
${REPLACE_END}

Example 4 - Deleting code:
${SEARCH_START} index.html
\`\`\`html
    <p>This paragraph will be deleted.</p>
\`\`\`
${DIVIDER}
\`\`\`html
\`\`\`
${REPLACE_END}

Example 5 - Multiple changes in different files:
${SEARCH_START} index.html
\`\`\`html
    <h1>Welcome</h1>
\`\`\`
${DIVIDER}
\`\`\`html
    <h1>Welcome to our site!</h1>
\`\`\`
${REPLACE_END}

${SEARCH_START} style.css
\`\`\`css
h1 {
    font-size: 24px;
}
\`\`\`
${DIVIDER}
\`\`\`css
h1 {
    font-size: 36px;
    font-weight: bold;
}
\`\`\`
${REPLACE_END}

## RESPONSE FORMAT FOR CREATING NEW FILES
When the user asks you to create a NEW file (new HTML page, new CSS file, new JS file, etc.), use the following format:

**NEW FILE FORMAT:**
1. Start with ${START_FILE_CONTENT}
2. Add a space and provide the filename (e.g., about.html, animation.js, components/header.js)
3. Inside a markdown code block with appropriate language identifier (html, css, javascript), provide the COMPLETE code for the new file
4. End with ${END_FILE_CONTENT}
5. If creating a new page, make sure to ALSO UPDATE existing HTML files with navigation links using the SEARCH/REPLACE format

**EXAMPLES:**

Example 1 - Creating a new HTML page:
${START_FILE_CONTENT} about.html
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <nav class="bg-gray-800 text-white p-4">
        <a href="index.html" class="mr-4">Home</a>
        <a href="about.html" class="mr-4">About</a>
    </nav>
    <main class="container mx-auto p-8">
        <h1 class="text-4xl font-bold mb-4">About Us</h1>
        <p>This is the about page.</p>
    </main>
    <script src="script.js"></script>
</body>
</html>
\`\`\`
${END_FILE_CONTENT}

Then update existing pages to link to it:
${SEARCH_START} index.html
\`\`\`html
    <nav class="bg-gray-800 text-white p-4">
        <a href="index.html" class="mr-4">Home</a>
    </nav>
\`\`\`
${DIVIDER}
\`\`\`html
    <nav class="bg-gray-800 text-white p-4">
        <a href="index.html" class="mr-4">Home</a>
        <a href="about.html" class="mr-4">About</a>
    </nav>
\`\`\`
${REPLACE_END}

Example 2 - Creating a new JavaScript file:
${START_FILE_CONTENT} animation.js
\`\`\`javascript
// Smooth scroll animation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
\`\`\`
${END_FILE_CONTENT}

Then update HTML files to include it:
${SEARCH_START} index.html
\`\`\`html
  <script src="script.js"></script>
</body>
\`\`\`
${DIVIDER}
\`\`\`html
  <script src="animation.js"></script>
  <script src="script.js"></script>
</body>
\`\`\`
${REPLACE_END}

## SUMMARY OF WHEN TO USE EACH FORMAT
- **SEARCH/REPLACE format** (${SEARCH_START}...${DIVIDER}...${REPLACE_END}): Use when UPDATING/MODIFYING existing files. This is your primary format for changes.
- **NEW FILE format** (${START_FILE_CONTENT}...${END_FILE_CONTENT}): Use when CREATING brand new files that don't exist yet.
- When creating new pages, ALWAYS update navigation in existing pages using SEARCH/REPLACE format.
- When creating new CSS/JS files, ALWAYS update HTML files to include them using SEARCH/REPLACE format.

Remember: DO NOT rewrite entire files when updating. Use SEARCH/REPLACE to change only what's necessary!
`;

export const EXAMPLES_OF_PROJECT_SUGGESTIONS = [
  // Business & SaaS
  {
    short_value: "Modern SaaS Landing Page",
    long_value:
      "Create a modern SaaS landing page with a hero section featuring a product demo video or animation, benefits section with icons and descriptions, pricing plans comparison table with highlighted recommended tier, customer testimonials with company logos and photos, FAQ accordion section, integration showcase, and a prominent call-to-action footer with email signup.",
  },
  {
    short_value: "Startup Landing Page",
    long_value:
      "Build a startup landing page with a bold hero section featuring the value proposition, problem-solution sections with visual illustrations, product features showcase with interactive elements, team section with photos and roles, investor logos, press mentions, early access signup form, and social proof metrics counter.",
  },
  {
    short_value: "Business Consulting Website",
    long_value:
      "Design a professional business consulting website with a trust-building hero section, services overview with detailed descriptions, case studies with results and metrics, consultant team profiles with expertise areas, client testimonials carousel, consultation booking form, and a resources/blog section.",
  },
  // E-commerce & Retail
  {
    short_value: "E-commerce Product Page",
    long_value:
      "Create a detailed e-commerce product page with image gallery and zoom functionality, product specifications table, size/color selector with visual swatches, add-to-cart button with quantity selector, customer reviews and ratings section, related products carousel, shipping information, and return policy accordion.",
  },
  {
    short_value: "Online Store Homepage",
    long_value:
      "Build an online store homepage with a hero banner featuring seasonal promotions, category navigation cards with images, featured products grid with quick view, bestsellers section, new arrivals carousel, customer testimonials, newsletter signup with discount offer, and trust badges for secure payment and shipping.",
  },
  {
    short_value: "Fashion Brand Website",
    long_value:
      "Design a fashion brand website with full-screen hero slider showcasing latest collections, lookbook section with lifestyle photography, shop by category grid, featured collections with hover effects, Instagram feed integration, brand story section with video, styling tips blog section, and size guide with measurements.",
  },
  // Food & Restaurant
  {
    short_value: "Restaurant Website",
    long_value:
      "Create a restaurant website with appetizing hero section featuring signature dishes, online menu with categories and dish photos, reservation booking system with date/time picker, location map with directions, chef's special section, customer reviews with food ratings, gallery of restaurant ambiance, and contact form for events.",
  },
  {
    short_value: "Coffee Shop Website",
    long_value:
      "Build a cozy coffee shop website with warm hero section showcasing coffee art, menu with drinks and pastries categorized by type, about section highlighting coffee sourcing and roasting process, location finder with multiple branches, loyalty program details, online ordering integration, barista spotlights, and events calendar.",
  },
  {
    short_value: "Food Delivery Landing Page",
    long_value:
      "Design a food delivery landing page with eye-catching hero showing popular dishes, restaurant categories with cuisine filters, how it works section with step-by-step illustrations, delivery area checker with postal code input, app download buttons with QR code, partner restaurants showcase, promotional offers banner, and customer testimonials with ratings.",
  },
  // Real Estate & Property
  {
    short_value: "Real Estate Agency Website",
    long_value:
      "Create a real estate agency website with property search bar featuring filters for location/price/bedrooms, featured properties grid with key details and photos, virtual tour integration, neighborhood guides with amenities, agent profiles with contact information, mortgage calculator tool, market insights blog, and property valuation request form.",
  },
  {
    short_value: "Luxury Property Showcase",
    long_value:
      "Build a luxury property showcase with full-screen hero image slider, exclusive property listings with high-quality photography, detailed property descriptions with amenities list, 360-degree virtual tours, location highlights with lifestyle benefits, appointment scheduling for private viewings, property comparison tool, and concierge services section.",
  },
  // Creative & Portfolio
  {
    short_value: "Photography Portfolio",
    long_value:
      "Design a photography portfolio with masonry grid layout showcasing best work, categorized galleries by photography type (wedding/portrait/landscape), lightbox image viewer with navigation, about the photographer section with bio and equipment, client testimonials, package pricing for different photo services, contact form for booking inquiries, and Instagram feed integration.",
  },
  {
    short_value: "Creative Agency Portfolio",
    long_value:
      "Create a creative agency portfolio with bold hero section featuring latest campaign, services overview with icons and descriptions, case studies showcase with before/after comparisons and results metrics, client logos wall, team section with creative roles, design process timeline, awards and recognition section, and project inquiry form.",
  },
  {
    short_value: "UX/UI Designer Portfolio",
    long_value:
      "Build a UX/UI designer portfolio with clean hero section introducing yourself, featured projects with case study breakdowns including problem/solution/results, interactive prototypes embedded, design process explanation with wireframes and mockups, skills and tools section with proficiency levels, client testimonials, Dribbble/Behance integration, and contact form.",
  },
  // Personal & Blog
  {
    short_value: "Personal Brand Website",
    long_value:
      "Design a personal brand website with impactful hero section with professional photo and tagline, about me section with story and values, services or expertise areas, portfolio or work samples, speaking engagements or media appearances, blog or articles section, newsletter signup, social media links, and contact form with calendar booking integration.",
  },
  {
    short_value: "Modern Blog Website",
    long_value:
      "Create a modern blog website with featured post hero section, blog posts grid with thumbnails and excerpts, category filters and tags, author bio section with photo, related posts suggestions, comment section integration, email subscription form with popup, search functionality, popular posts sidebar, and social sharing buttons.",
  },
  {
    short_value: "Travel Blog",
    long_value:
      "Build a travel blog with inspiring hero banner featuring destination photos, travel posts organized by country/region, interactive map showing visited places, travel guides with itineraries and tips, photo galleries from trips, travel essentials and gear recommendations, destination comparison tool, email newsletter for travel updates, and booking affiliate links.",
  },
  // Health & Fitness
  {
    short_value: "Fitness Gym Website",
    long_value:
      "Create a fitness gym website with motivating hero video background, class schedule calendar with booking system, membership plans comparison with benefits, trainer profiles with specializations, virtual gym tour with facility photos, success stories with before/after transformations, fitness blog with workout tips, free trial signup form, and location/hours information.",
  },
  {
    short_value: "Yoga Studio Website",
    long_value:
      "Design a yoga studio website with calming hero section showcasing studio space, class types with descriptions and difficulty levels, live class schedule with online/in-person options, instructor bios with teaching philosophies, beginner's guide to yoga, wellness blog, workshop and retreat information, membership packages, and online booking system.",
  },
  {
    short_value: "Health & Wellness Page",
    long_value:
      "Build a health and wellness page with hero section promoting holistic health, services offered including nutrition/fitness/mental health, practitioner profiles with credentials, appointment booking calendar, wellness resources and blog articles, patient testimonials with health journey stories, FAQ section, insurance information, and contact form with health assessment questionnaire.",
  },
  // Education & Learning
  {
    short_value: "Online Course Landing Page",
    long_value:
      "Create an online course landing page with compelling hero showcasing course outcomes, curriculum breakdown with module details, instructor credentials and biography, student testimonials with success stories, course preview video, pricing options with payment plans, enrollment countdown timer, skills you'll learn section with icons, and money-back guarantee badge.",
  },
  {
    short_value: "University/School Website",
    long_value:
      "Design a university/school website with prominent hero featuring campus life, academic programs overview with departments, admissions information with requirements and deadlines, virtual campus tour with interactive map, faculty profiles with research areas, student resources and services, events calendar, news and announcements section, and application portal access.",
  },
  {
    short_value: "Tutoring Service Website",
    long_value:
      "Build a tutoring service website with hero section highlighting student success rates, subjects offered with grade levels, tutor matching system with profiles and qualifications, flexible scheduling with online/in-person options, pricing packages and hourly rates, parent testimonials, free assessment offer, learning resources, and contact form with subject selector.",
  },
  // Events & Entertainment
  {
    short_value: "Event Conference Website",
    long_value:
      "Create an event conference website with countdown timer to event date, speaker lineup with bios and session topics, event schedule with multiple tracks, venue information with map and travel details, ticket types and pricing with early bird discounts, sponsor showcase with logo display, past event highlights with photos/videos, and registration form.",
  },
  {
    short_value: "Music Festival Landing Page",
    long_value:
      "Design a music festival landing page with vibrant hero featuring headliner artists, full lineup with artist photos and genres, stage schedule with set times, festival map with venue layout, ticket tiers with VIP options, camping and accommodation info, festival rules and what to bring, photo gallery from previous years, and ticket purchase integration.",
  },
  {
    short_value: "Wedding Website",
    long_value:
      "Build a wedding website with romantic hero featuring couple's photo, love story timeline, wedding day schedule with ceremony and reception details, venue information with directions, RSVP form with meal preferences, accommodation suggestions for guests, gift registry links, photo gallery from engagement, wedding party introductions, and FAQs section.",
  },
  // Professional Services
  {
    short_value: "Law Firm Website",
    long_value:
      "Create a law firm website with professional hero establishing trust and authority, practice areas with detailed service descriptions, attorney profiles with education and case experience, case results and settlements, legal resources and blog, client testimonials, consultation booking form, frequently asked legal questions, contact information with multiple office locations.",
  },
  {
    short_value: "Dental Clinic Website",
    long_value:
      "Design a dental clinic website with welcoming hero showing modern facilities, dental services offered with procedure explanations, dentist and staff profiles with credentials, patient testimonials with smile transformations, new patient forms downloadable, insurance and payment options, dental health blog and tips, online appointment booking system, and emergency contact information.",
  },
  {
    short_value: "Architecture Firm Website",
    long_value:
      "Build an architecture firm website with striking hero showcasing signature project, portfolio gallery organized by project type (residential/commercial/institutional), project case studies with design concepts and final photos, services from planning to construction, architect team profiles, design philosophy and approach, awards and publications, and project inquiry form.",
  },
  // Technology & Apps
  {
    short_value: "App Landing Page",
    long_value:
      "Create an app landing page with phone mockups showing app interface, key features section with animated icons, app store download buttons (iOS/Android), how it works explanation with screenshots, user testimonials and ratings, app demo video, subscription pricing if applicable, press mentions, FAQ section, and waitlist signup for beta access.",
  },
  {
    short_value: "Software Product Page",
    long_value:
      "Design a software product page with hero demonstrating product in action, features breakdown with detailed descriptions and benefits, technical specifications and integrations, pricing tiers comparison table, customer logos and case studies, live product demo or free trial signup, API documentation link, security and compliance badges, and customer support information.",
  },
  // Non-profit & Community
  {
    short_value: "Non-profit Organization Website",
    long_value:
      "Create a non-profit website with mission-driven hero showing impact, about section explaining cause and history, programs and initiatives with detailed descriptions, impact metrics and success stories, donation form with different giving options, volunteer opportunities with signup, upcoming events and campaigns, transparency section with annual reports, and newsletter subscription.",
  },
  {
    short_value: "Community Organization Website",
    long_value:
      "Build a community organization website with welcoming hero showcasing community members, about the organization with mission and values, programs and services offered, membership information and benefits, events calendar with community gatherings, volunteer opportunities, resources and support section, testimonials from community members, and contact form with location map.",
  },
  // Misc & Utility
  {
    short_value: "Interactive Weather Dashboard",
    long_value:
      "Design an interactive weather dashboard with current weather display showing temperature/conditions/humidity, location search with autocomplete, 7-day forecast with daily highs/lows, hourly forecast chart, weather map with radar overlay, severe weather alerts section, sunrise/sunset times, air quality index, UV index, and weather statistics using real weather API data.",
  },
  {
    short_value: "Modern Calculator",
    long_value:
      "Create a modern calculator with clean interface featuring number pad and operation buttons, basic arithmetic operations (+,-,*,/), advanced functions (percentage, square root, power), calculation history log that can be cleared, keyboard input support, light/dark theme toggle, responsive design for mobile and desktop, and smooth animations for button presses.",
  },
];
