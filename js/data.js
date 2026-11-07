const CATEGORIES = ["Website","Application"];

/* Works shown by default (before the visitor filters / searches).
   Each entry matches a project's "media" id or its "title". */
const FEATURED = ["https://svuniversity.ac.in/","https://svahs.ac.in/","https://thavamfertility.com/","https://medcare.svmedcitycom/","https://convocation.svuniversity.ac.in/","https://svmch.ac.in/"];

/* How many extra works are revealed each time "Tampilkan karya lainnya" is pressed */
const PAGE_SIZE = 9;

const PROJECTS = [
  {
    "type": "website",
    "title": "Sri Venkateswaraa University Website",
    "description": "It is a website for Sri Venkateswaraa University, which is a private university located in redhills, Tamilnadu, India. The website provides information about the university's academic programs, faculty, research, and campus life and its affiliated colleges.",
    "media": "https://svuniversity.ac.in/",
    "role": "Web Developer",
    "year": "2024",
    "category": "Website",
    "image": "assets/img/svu.png"
  },
  {
    "type": "website",
    "title": "SV Medcity",
    "description": "It is a website for SV Medcity, which is a multi-specialty hospital located in redhills, Tamilnadu, India. The website provides information about the hospital's services, doctors, facilities, mandatory documentation and patient care information.",
    "media": "https://svmedcity.com/",
    "role": "Web Developer",
    "year": "2024",
    "category": "Website",
    "image": "assets/img/svmedcity.png"
  },
  {
    "type": "website",
    "title": "Sri Venkateswaraa Nursing College Website",
    "description": "It is a website for Sri Venkateswaraa Nursing College, which is a private nursing college located in redhills, Tamilnadu, India. The website provides information about the college's academic programs, faculty, research, and campus life.",
    "media": "https://svnursing.ac.in/",
    "role": "Team Lead & Web Developer",
    "year": "2024",
    "category": "Website",
    "image": "assets/img/svnc.png"
  },
  {
    "type": "website",
    "title": "Sri Venkateswaraa College of Physiotherapy Website",
    "description": "It is a website for Sri Venkateswaraa College of Physiotherapy, which is a private college located in redhills, Tamilnadu, India. The website provides information about the college's academic programs, faculty, research, and campus life.",
    "media": "https://svphysio.ac.in/",
    "role": "Team Lead & Web Developer",
    "year": "2024",
    "category": "Website",
    "image": "assets/img/bpt.png"
  },
  {
    "type": "application",
    "title": "JANS Admission Management System",
    "description": "It is a web application for JANS Admission Management System. The application provides information about the admission process, student registration, and course management.",
    "media": "https://jans.svnursing.ac.in/",
    "role": "Team Lead & Web Developer",
    "year": "2025",
    "category": "Application",
    "image": "assets/img/jans.png"
  },
  {
    "type": "application",
    "title": "Leads HR Careers Management System",
    "description": "A web application for managing HR careers and opportunities.",
    "media": "https://leads.svnursing.ac.in/",
    "role": "Team Lead & Web Developer",
    "year": "2025",
    "category": "Application",
    "image": "assets/img/leads.png"
  },
  {
    "type": "website",
    "title": "Sri Venkateswaraa College of AHS Website",
    "description": "It is a website for Sri Venkateswaraa College of Allied Health Sciences, which is a private college located in redhills, Tamilnadu, India. The website provides information about the college's academic programs, faculty, research, and campus life.",
    "media": "https://svahs.ac.in/",
    "role": "Team Lead & Web Developer",
    "year": "2026",
    "category": "Website",
    "image": "assets/img/ahs.png"
  },
  {
    "type": "website",
    "title": "Thavam Fertility Center Website",
    "description": "It is a website for Thavam Fertility Center, which is a private clinic located in Chennai, Tamilnadu, India. The website provides information about the clinic's services, doctors, and patient resources.",
    "media": "https://thavamfertility.com/",
    "role": "Team Lead & Web Developer",
    "year": "2026",
    "category": "Website",
    "image": "assets/img/thavam.png"
  },
  {
    "type": "application",
    "title": "Medcare Patient Management System",
    "description": "It is a web application for managing patient information and appointments from both svmedcity hospital and thavam fertility center at Medcare.",
    "media": "https://medcare.svmedcitycom/",
    "role": "Team Lead & Web Developer",
    "year": "2026",
    "category": "Application",
    "image": "assets/img/medcare.png"
  },
  {
    "type": "application",
    "title": "Convocation Management System",
    "description": "It is a web application for managing convocation details and participant information for overall Sri Venkateswaraa University.",
    "media": "https://convocation.svuniversity.ac.in/",
    "role": "Team Lead & Web Developer",
    "year": "2026",
    "category": "Application",
    "image": "assets/img/csvu.png"
  },
  {
    "type": "website",
    "title": "Sri Venkateswaraa College of Pharmacy Website",
    "description": "It is a website for Sri Venkateswaraa College of Pharmacy, which is a private college located in redhills, Tamilnadu, India. The website provides information about the college's academic programs, faculty, research, and campus life.",
    "media": "https://svpharmacy.ac.in/",
    "role": "Team Lead & Web Developer",
    "year": "2026",
    "category": "Website",
    "image": "assets/img/pharma.png"
  },
  {
    "type": "website",
    "title": "Sri Venkateswaraa Medical College Website",
    "description": "It is a website for Sri Venkateswaraa Medical College, which is a private college located in redhills, Tamilnadu, India. The website provides information about the college's academic programs, faculty, research, and campus life.",
    "media": "https://svmch.ac.in/",
    "role": "Team Lead & Web Developer",
    "year": "2026",
    "category": "Website",
    "image": "assets/img/mbbs.png"
  },
  {
    "type": "application",
    "title": "AzzistPoint Website Management System",
    "description": "It is a internal web application for managing website content and updates for overall Sri Venkateswaraa University and Hospital, It also has Ticketing system, Inventory management system, and other internal tools for managing the university and hospital.",
    "media": "#",
    "role": "Team Lead & Web Developer",
    "year": "2026",
    "category": "Application",
    "image": "assets/img/az.png"
  }
];

/* Logos in the "Been part of the bigger picture" strip.
   Files live in Asset/svg/brand/  */
const BRANDS = [
  { file: "html5.png", name: "HTML" },
  { file: "css3.png", name: "CSS" },
  { file: "javascript.png", name: "JavaScript" },
  { file: "tailwind.png", name: "Tailwind CSS" },
  { file: "sass.png", name: "SASS" },
  { file: "bootstrap.png", name: "Bootstrap" },
  { file: "jquery.png", name: "JQuery" },
  { file: "ajax.png", name: "AJAX" },
  { file: "php.png", name: "PHP" },
  { file: "sql.png", name: "SQL" },
  { file: "gsap.png", name: "GSAP" },
  { file: "python.png", name: "Python" },
  { file: "nodejs.png", name: "Nodejs" },
  { file: "react.png", name: "React" },
  { file: "vue.png", name: "VUE" },
  { file: "mongo.png", name: "MONGO DB" },
  { file: "command.png", name: "Command Prompt" },
  { file: "digitalmarketing.png", name: "Digital Marketing" },
  { file: "figma.png", name: "Figma" },
  { file: "dns.png", name: "DNS Configuration" },
  { file: "git.png", name: "Git" },
  { file: "hosting.png", name: "Web Hosting" },
  { file: "npm.png", name: "NPM" },
  { file: "pycharm.png", name: "PyCharm" },
  { file: "ssl.png", name: "SSL/TLS" },
  { file: "vs-code.png", name: "VS Code" },
  { file: "webflow.png", name: "Webflow" },
  { file: "webserver.png", name: "Web Server" },
  { file: "wix.png", name: "Wix" },
  { file: "wordpress.png", name: "WordPress" }
];
