 'use strict';
  new WOW().init();

/** element toggle function **/
const elemToggleFunc = function (elem) { elem.classList.toggle("active"); }
/** header sticky & go to top **/

const header = document.querySelector("[data-header]");
const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {

  if (window.scrollY >= 10) {
    header.classList.add("active");
    goTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    goTopBtn.classList.remove("active");
  }

});



/** navbar toggle **/

const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");
const navbar = document.querySelector("[data-navbar]");

navToggleBtn.addEventListener("click", function () {

  elemToggleFunc(navToggleBtn);
  elemToggleFunc(navbar);
  elemToggleFunc(document.body);

});



/** skills toggle **/

/** skills toggle **/
const toggleBtnBox = document.querySelector("[data-toggle-box]");
const toggleBtns = document.querySelectorAll("[data-toggle-btn]");
const skillsBox = document.querySelector("[data-skills-box]");
const extraSkillsList = document.querySelector(".extra-skills-list"); // New list for extra skills

for (let i = 0; i < toggleBtns.length; i++) {
    toggleBtns[i].addEventListener("click", function () {
        
        // Hide all lists initially
        const skillLists = [skillsBox.querySelector(".skills-list"), skillsBox.querySelector(".tools-list"), extraSkillsList];
        skillLists.forEach(list => list.style.display = "none");
        toggleBtns.forEach(togbtn => togbtn.classList.remove('active'));
        
        toggleBtns[i].classList.add("active"); // Add active class to the clicked button
        // Show the appropriate list based on the button clicked
        if (toggleBtns[i].textContent === "Skills") {
            skillsBox.querySelector(".skills-list").style.display = "flex"; // Show skills
            document.documentElement.style.setProperty('--before-width', '95px');
            document.documentElement.style.setProperty('--before-position', '5px');
        } else if (toggleBtns[i].textContent === "Tools") {
            skillsBox.querySelector(".tools-list").style.display = "flex"; // Show tools
            document.documentElement.style.setProperty('--before-width', '94px');
            document.documentElement.style.setProperty('--before-position', '98px');
        } else if (toggleBtns[i].textContent === "Technics") {
            extraSkillsList.style.display = "flex"; // Show extra skills
            document.documentElement.style.setProperty('--before-width', '115px');
            document.documentElement.style.setProperty('--before-position', '200px');
        }
    });
}



/** dark & light theme toggle **/

const themeToggleBtn = document.querySelector("[data-theme-btn]");

themeToggleBtn.addEventListener("click", function () {

  elemToggleFunc(themeToggleBtn);

  if (themeToggleBtn.classList.contains("active")) {
    document.body.classList.remove("dark_theme");
    document.body.classList.add("light_theme");

    localStorage.setItem("theme", "light_theme");
  } else {
    document.body.classList.add("dark_theme");
    document.body.classList.remove("light_theme");

    localStorage.setItem("theme", "dark_theme");
  }

});

/** check & apply last time selected theme from localStorage **/

if (localStorage.getItem("theme") === "light_theme") {
  themeToggleBtn.classList.add("active");
  document.body.classList.remove("dark_theme");
  document.body.classList.add("light_theme");
} else {
  themeToggleBtn.classList.remove("active");
  document.body.classList.remove("light_theme");
  document.body.classList.add("dark_theme");
} 

// EmailJS integration
var emailjs=function(e){"use strict";class t{constructor(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"Network Error";this.status=e,this.text=t}}const i={origin:"https://api.emailjs.com",blockHeadless:!1,storageProvider:(()=>{if("undefined"!=typeof localStorage)return{get:e=>Promise.resolve(localStorage.getItem(e)),set:(e,t)=>Promise.resolve(localStorage.setItem(e,t)),remove:e=>Promise.resolve(localStorage.removeItem(e))}})()},r=e=>e?"string"==typeof e?{publicKey:e}:"[object Object]"===e.toString()?e:{}:{},o=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"https://api.emailjs.com";if(!e)return;const o=r(e);i.publicKey=o.publicKey,i.blockHeadless=o.blockHeadless,i.storageProvider=o.storageProvider,i.blockList=o.blockList,i.limitRate=o.limitRate,i.origin=o.origin||t},a=async function(e,r){let o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const a=await fetch(i.origin+e,{method:"POST",headers:o,body:r}),s=await a.text(),n=new t(a.status,s);if(a.ok)return n;throw n},s=(e,t,i)=>{if(!e||"string"!=typeof e)throw"The public key is required. Visit https://dashboard.emailjs.com/admin/account";if(!t||"string"!=typeof t)throw"The service ID is required. Visit https://dashboard.emailjs.com/admin";if(!i||"string"!=typeof i)throw"The template ID is required. Visit https://dashboard.emailjs.com/admin/templates"},n=e=>e.webdriver||!e.languages||0===e.languages.length,l=()=>new t(451,"Unavailable For Headless Browser"),c=(e,t)=>{if((e=>!e.list?.length||!e.watchVariable)(e))return!1;((e,t)=>{if(!Array.isArray(e))throw"The BlockList list has to be an array";if("string"!=typeof t)throw"The BlockList watchVariable has to be a string"})(e.list,e.watchVariable);const i=(r=t,o=e.watchVariable,r instanceof FormData?r.get(o):r[o]);var r,o;return"string"==typeof i&&e.list.includes(i)},d=()=>new t(403,"Forbidden"),m=async(e,t,i)=>{if(!t.throttle||!i)return!1;((e,t)=>{if("number"!=typeof e||e<0)throw"The LimitRate throttle has to be a positive number";if(t&&"string"!=typeof t)throw"The LimitRate ID has to be a non-empty string"})(t.throttle,t.id);const r=t.id||e,o=await(async(e,t,i)=>{const r=Number(await i.get(e)||0);return t-Date.now()+r})(r,t.throttle,i);return o>0||(await i.set(r,Date.now().toString()),!1)},h=()=>new t(429,"Too Many Requests"),p=async(e,t,o,p)=>{const u=r(p),b=u.publicKey||i.publicKey,g=u.blockHeadless||i.blockHeadless,f=u.storageProvider||i.storageProvider,w={...i.blockList,...u.blockList},y={...i.limitRate,...u.limitRate};if(g&&n(navigator))return Promise.reject(l());if(s(b,e,t),(e=>{if(e&&"[object Object]"!==e.toString())throw"The template params have to be the object. Visit https://www.emailjs.com/docs/sdk/send/"})(o),o&&c(w,o))return Promise.reject(d());if(await m(location.pathname,y,f))return Promise.reject(h());const v={lib_version:"4.4.1",user_id:b,service_id:e,template_id:t,template_params:o};return a("/api/v1.0/email/send",JSON.stringify(v),{"Content-type":"application/json"})},u=async(e,t,o,p)=>{const u=r(p),b=u.publicKey||i.publicKey,g=u.blockHeadless||i.blockHeadless,f=i.storageProvider||u.storageProvider,w={...i.blockList,...u.blockList},y={...i.limitRate,...u.limitRate};if(g&&n(navigator))return Promise.reject(l());const v=(e=>"string"==typeof e?document.querySelector(e):e)(o);s(b,e,t),(e=>{if(!e||"FORM"!==e.nodeName)throw"The 3rd parameter is expected to be the HTML form element or the style selector of the form"})(v);const j=new FormData(v);return c(w,j)?Promise.reject(d()):await m(location.pathname,y,f)?Promise.reject(h()):(j.append("lib_version","4.4.1"),j.append("service_id",e),j.append("template_id",t),j.append("user_id",b),a("/api/v1.0/email/send-form",j))};var b={init:o,send:p,sendForm:u,EmailJSResponseStatus:t};return e.EmailJSResponseStatus=t,e.default=b,e.init=o,e.send=p,e.sendForm=u,Object.defineProperty(e,"__esModule",{value:!0}),e}({});
(function(){
    emailjs.init({
      publicKey: "1nGRH0eV7iIBRlaA9",
    });
 })();
if (!document.body.innerText.includes("Janakiraman")) {
    window.location.href = "https://jkr-26.github.io/portfolio/";
}
    
// toastr configuration
    $(document).ready(function() {
        toastr.options = {
            'closeButton': true,
            'debug': false,
            'newestOnTop': true,
            'progressBar': false,
            'positionClass': 'toast-top-right',
            'preventDuplicates': false,
            'showDuration': '1000',
            'hideDuration': '1000',
            'timeOut': '5000',
            'extendedTimeOut': '1000',
            'showEasing': 'swing',
            'hideEasing': 'linear',
            'showMethod': 'fadeIn',
            'hideMethod': 'fadeOut',
        }
    });
    document.getElementById("contactFrm").addEventListener("submit", function(event){
        event.preventDefault()

        let name = $('#uname').val().trim();
        let email = $('#email').val().trim();
        let message = $('#message').val().trim();
        let error = '';
        
        if (name === '') {
            error += 'Name is required';
        }

        if (email === '') {
            error += 'Email is required';
        }

        if (message === '') {
            error += 'Message is required';
        }

        if (error !== '') {
            toastr.warning(error)
        } else {
            emailjs.send("service_wtofc5o","template_kmt4ajj",{
                user_email: email,
                user_name: name,
                message: message
            })
            .then((response) => {
                toastr.success('Thankyou for your feedback');
            })
            .catch((error) => {
                toastr.error('Something went wrong!')
            });
            // this.reset();
        }

        // if (!uname === "") {
        //     if(!email == ""){
        //         if(!message == ""){
        //             alert("Thank you for your feedback");
        //             emailjs.send("service_wtofc5o","template_kmt4ajj",{
        //             user_email: email,
        //             user_name: name,
        //             message: message
        //             })
        //             .then((response) => {
        //             toastr.success('Thankyou for your feedback');
        //             })
        //             .catch((error) => {
        //             toastr.error('Something went wrong!')
        //             });
        //         }
        //         else{
        //             toastr.warning('Enter your message')
        //         }
        //     }
        //     else{
        //         toastr.warning('Enter your email')
        //     }
        // } 
        // else {
        //     toastr.warning('Enter your Name')
        // }

    });

    // glimpse carousel
    $(".glimpse-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 2000,
        center: false,
        dots: true,
        loop: true,
        margin: 25,
        nav : false,
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            450:{
                items:2
            },
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });
