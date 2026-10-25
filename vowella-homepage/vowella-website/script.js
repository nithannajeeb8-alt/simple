(()=>{
const flow=document.getElementById('flow');if(!flow)return;
const items=[...flow.children],n=items.length,half=Math.floor(n/2);
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const dots=[...document.querySelectorAll('#dots b')];let active=0,prev=items.map((_,i)=>i),timer;
function place(){
  items.forEach((el,i)=>{
    let d=((i-active)%n+n+half)%n-half;
    const a=Math.abs(d),jump=Math.abs(d-prev[i])>half;prev[i]=d;
    if(jump){el.style.transition='none';requestAnimationFrame(()=>requestAnimationFrame(()=>el.style.transition=''))}
    const s=d===0?1:Math.max(.7,.84-a*.1);
    const x=d===0?0:Math.sign(d)*(33+(a-1)*13);
    el.style.transform=`translate3d(calc(-50% + ${x}cqw),-50%,${d===0?0:-14*a-8}cqw) rotateY(${-Math.sign(d)*Math.min(a,1)*40}deg) scale(${s})`;
    el.style.zIndex=10-a;el.style.opacity=a>2?0:1;el.style.filter=d===0?'none':'brightness(.92)';
    el.setAttribute('aria-hidden',d!==0);
    if(d===0)dots.forEach((q,k)=>q.classList.toggle('on',k===i));
  });
}
const go=k=>{active=((k%n)+n)%n;place()};
const start=()=>{if(reduce)return;clearInterval(timer);timer=setInterval(()=>go(active+1),2600)};
items.forEach((el,i)=>el.addEventListener('click',()=>{go(i);start()}));
let x0=null;
flow.addEventListener('pointerdown',e=>{x0=e.clientX;clearInterval(timer)});
flow.addEventListener('pointerup',e=>{if(x0!==null&&Math.abs(e.clientX-x0)>30)go(active+(e.clientX<x0?1:-1));x0=null;start()});
flow.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(active+1);if(e.key==='ArrowLeft')go(active-1)});
document.addEventListener('visibilitychange',()=>document.hidden?clearInterval(timer):start());
place();start();
})();
