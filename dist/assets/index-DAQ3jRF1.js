var u=Object.defineProperty;var h=(a,t,e)=>t in a?u(a,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):a[t]=e;var o=(a,t,e)=>h(a,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function e(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=e(i);fetch(i.href,s)}})();class c{constructor(t,e){o(this,"currentTimeLeft",25*60);o(this,"workDurationInput",null);o(this,"shortBreakDurationInput",null);o(this,"longBreakDurationInput",null);o(this,"saveSettingsButton",null);o(this,"timerService");this.shadowRoot=t,this.timerService=e}async render(){var t,e,r,i;try{const[s,n]=await Promise.all([this.fetchResource("./UrdTimer.css"),this.fetchResource("./UrdTimer.html")]);this.shadowRoot&&(this.shadowRoot.innerHTML=`<style>${s}</style>${n}`),this.workDurationInput=(t=this.shadowRoot)==null?void 0:t.querySelector("#work-duration"),this.shortBreakDurationInput=(e=this.shadowRoot)==null?void 0:e.querySelector("#short-break-duration"),this.longBreakDurationInput=(r=this.shadowRoot)==null?void 0:r.querySelector("#long-break-duration"),this.saveSettingsButton=(i=this.shadowRoot)==null?void 0:i.querySelector("#save-settings"),this.addSettingsEventListeners()}catch(s){console.error("Error in render:",s)}this.update(25*60,!1)}addSettingsEventListeners(){var t;(t=this.saveSettingsButton)==null||t.addEventListener("click",()=>{const e=this.validateInput(this.workDurationInput,25),r=this.validateInput(this.shortBreakDurationInput,5),i=this.validateInput(this.longBreakDurationInput,15);this.updateSettings(e,r,i)})}updateSettings(t,e,r){this.timerService.updateSettings(t,e,r)}validateInput(t,e){if(!t)return e;const r=parseInt(t.value,10),i=parseInt(t.min,10),s=parseInt(t.max,10);return isNaN(r)?e:Math.max(i,Math.min(s,r))}addButtonListeners(t,e){var s,n;const r=(s=this.shadowRoot)==null?void 0:s.querySelector("#start-stop"),i=(n=this.shadowRoot)==null?void 0:n.querySelector("#reset");r&&i?(r.addEventListener("click",t),i.addEventListener("click",e)):console.error("Buttons not found in the shadow DOM")}update(t,e){this.currentTimeLeft=t,this.updateDisplay(t),this.updateStartStopButton(e)}updateDisplay(t){var r;const e=(r=this.shadowRoot)==null?void 0:r.querySelector("#time-display");e&&(e.textContent=this.formatTime(t))}updateStartStopButton(t){var r;const e=(r=this.shadowRoot)==null?void 0:r.querySelector("#start-stop");e&&(t?e.textContent="Pause":e.textContent=this.currentTimeLeft===this.timerService.getWorkDuration()?"Start":"Resume")}formatTime(t){const e=Math.floor(t/60),r=t%60;return`${e.toString().padStart(2,"0")}:${r.toString().padStart(2,"0")}`}async fetchResource(t){const e=await fetch(new URL(t,import.meta.url));if(!e.ok)throw new Error(`Failed to fetch ${t}: ${e.statusText}`);return e.text()}}class d{constructor(){o(this,"timer",null);o(this,"timeLeft",25*60);o(this,"isWorking",!0);o(this,"isRunning",!1);o(this,"observers",[]);o(this,"workDuration",25*60);o(this,"shortBreakDuration",5*60);o(this,"longBreakDuration",15*60)}addObserver(t){this.observers.push(t)}removeObserver(t){const e=this.observers.indexOf(t);e>-1&&this.observers.splice(e,1)}notifyObservers(){for(const t of this.observers)t.update(this.timeLeft,this.isRunning)}updateSettings(t,e,r){this.workDuration=t*60,this.shortBreakDuration=e*60,this.longBreakDuration=r*60,this.saveSettings(),this.reset()}saveSettings(){localStorage.setItem("urdTimerSettings",JSON.stringify({workDuration:this.workDuration/60,shortBreakDuration:this.shortBreakDuration/60,longBreakDuration:this.longBreakDuration/60}))}loadSettings(){const t=localStorage.getItem("urdTimerSettings");if(t){const e=JSON.parse(t);this.workDuration=e.workDuration*60,this.shortBreakDuration=e.shortBreakDuration*60,this.longBreakDuration=e.longBreakDuration*60}this.reset()}reset(){this.timeLeft=this.workDuration,this.isWorking=!0,this.pause(),this.notifyObservers()}toggle(){this.isRunning?this.pause():this.start()}start(){this.isRunning||(this.timer=window.setInterval(()=>{this.timeLeft--,this.timeLeft<=0&&this.switchMode(),this.notifyObservers()},1e3),this.isRunning=!0)}pause(){this.timer&&(window.clearInterval(this.timer),this.timer=null),this.isRunning=!1}getWorkDuration(){return this.workDuration}switchMode(){this.isWorking=!this.isWorking,this.timeLeft=this.isWorking?25*60:5*60,this.notifyObservers(),this.notifyUser()}notifyUser(){Notification.permission==="granted"&&new Notification(this.isWorking?"Dags att arbeta!":"Dags för en paus!")}}class l extends HTMLElement{constructor(){super();o(this,"urdTimerService");o(this,"urdUIService");this.attachShadow({mode:"open"}),this.urdTimerService=new d,this.urdUIService=new c(this.shadowRoot,this.urdTimerService),this.urdTimerService.addObserver(this.urdUIService)}async connectedCallback(){try{await this.urdUIService.render(),this.urdTimerService.loadSettings(),this.addEventListeners()}catch(e){console.error("Error in connectedCallback:",e)}}addEventListeners(){var r;this.urdUIService.addButtonListeners(()=>this.urdTimerService.toggle(),()=>this.urdTimerService.reset());const e=(r=this.shadowRoot)==null?void 0:r.querySelector("#save-settings");e==null||e.addEventListener("click",()=>{const i=this.getInputValue("#work-duration",25),s=this.getInputValue("#short-break-duration",5),n=this.getInputValue("#long-break-duration",15);this.urdTimerService.updateSettings(i,s,n)})}getInputValue(e,r){var s;const i=(s=this.shadowRoot)==null?void 0:s.querySelector(e);return i&&parseInt(i.value,10)||r}}customElements.get("urd-timer")||customElements.define("urd-timer",l);console.log("Urd Timekeeper initialized");
