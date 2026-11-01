import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Every scene is reversible: the scroll position, rather than a timer, directs it.
export function createMotion(root) {
  const media = gsap.matchMedia();
  const context = gsap.context(() => {
    media.add({
      desktop: '(min-width: 800px) and (min-height: 650px)',
      motion: '(prefers-reduced-motion: no-preference)',
    }, ({conditions}) => {
      if (!conditions.motion) return;
      root.classList.add('motion-enabled');
      const $ = gsap.utils.selector(root);
      const desktop = conditions.desktop;
      if (desktop) root.classList.add('experimental-desktop');

      gsap.fromTo('.scroll-progress span', {scaleX:0}, {scaleX:1,ease:'none',scrollTrigger:{trigger:root,start:'top top',end:'bottom bottom',scrub:true}});
      gsap.timeline({defaults:{ease:'power4.out'}})
        .from('.navigation',{yPercent:-100,duration:.7})
        .from('.hero-eyebrow',{opacity:0,x:-30,duration:.65},.15)
        .from('.hero-line > span',{yPercent:130,rotation:8,stagger:.14,duration:1.2},.25)
        .from('.hero-bottom',{opacity:0,y:30,duration:.8},.7);

      // Calm text retains its reading space between the more demanding scenes.
      gsap.from('.introduction h2',{xPercent:-65,skewX:-15,opacity:0,ease:'power3.out',scrollTrigger:{trigger:'.introduction',start:'top 85%',end:'top 30%',scrub:1}});
      gsap.utils.toArray('.intro-list li').forEach((el,i) => gsap.from(el,{x:i%2 ? 65 : -65,opacity:.15,duration:.7,scrollTrigger:{trigger:el,start:'top 93%',once:true}}));

      if (desktop) {
        // The two lines split apart, and the question becomes larger than its frame.
        const hero = gsap.timeline({scrollTrigger:{trigger:'.hero',start:'top top',end:'+=135%',pin:true,scrub:1,anticipatePin:1}});
        hero.to('.hero-bottom, .hero-eyebrow, .scroll-cue',{opacity:0,y:-45,duration:.2})
          .to('.hero-line:first-child',{xPercent:-50,rotation:-9,scale:1.6,duration:1,ease:'power2.in'},0)
          .to('.hero-line:last-child',{xPercent:28,rotation:7,scale:2.3,duration:1,ease:'power2.in'},0)
          .to('.hero',{clipPath:'inset(0 0 100% 0)',duration:.35},.85);

        const opening = gsap.timeline({scrollTrigger:{trigger:'.effects-opening',start:'top top',end:'+=180%',pin:true,scrub:1,anticipatePin:1}});
        opening.fromTo('.effects-opening .chapter-title',{scale:3.8,xPercent:35},{scale:1,xPercent:0,duration:1,ease:'power2.out'})
          .to('.effects-opening .chapter-title',{yPercent:-155,scale:.85,opacity:.18,duration:.7},1.2)
          .from('.effects-intro h3 .kinetic-word',{yPercent:180,rotationX:-90,stagger:.1,opacity:0,duration:.7},1.3)
          .from('.effects-intro p, .effects-intro .down-arrow',{opacity:0,y:35,duration:.45},2.1)
          .to({}, {duration:.6});

        // Each rule holds still to be read, then the whole viewport travels to the next.
        const cards = $('.effect');
        const rail = gsap.timeline({scrollTrigger:{trigger:'.effect-viewport',start:'top top',end:()=>`+=${innerHeight * 9}`,pin:true,scrub:.85,anticipatePin:1,invalidateOnRefresh:true}});
        cards.forEach((card,i) => {
          const words = card.querySelectorAll('.kinetic-word');
          const echo = card.querySelector('.pressure-echo');
          const start = rail.duration();
          rail.from(words,{yPercent:i%2 ? -130 : 130,rotation:i%2 ? -12 : 12,opacity:0,stagger:.045,duration:.5,ease:'power3.out'},start)
            .from(card.querySelector('.effect-copy'),{opacity:0,y:35,duration:.4},start+.25)
            .fromTo(echo,{xPercent:i%2 ? 25 : -25,scale:1.4},{xPercent:0,scale:1,duration:1.3,ease:'none'},start);
          if(i===0) rail.to(words,{scaleX:.54,scaleY:1.7,transformOrigin:'left bottom',stagger:.05,duration:.65,ease:'power2.inOut'},start+.6);
          if(i===1) rail.to(words,{y:n=>n*17,rotation:n=>n%2 ? -5 : 3,duration:.65},start+.6);
          if(i===2) rail.to(words[words.length-1],{scale:1.55,xPercent:12,y:-15,duration:.65,ease:'power3.in'},start+.6);
          if(i===3) rail.to(words,{skewX:n=>n%2 ? -18 : 18,x:n=>n%2 ? 25 : -25,rotation:n=>n%2 ? 5 : -5,duration:.55},start+.6);
          if(i===4) rail.to(words,{x:n=>n%2 ? 60 : -60,duration:.3},start+.6).to(words,{x:0,duration:.08},start+.95).to(words,{y:n=>n%2 ? 15 : -15,duration:.15},start+1.05).to(words,{y:0,duration:.06},start+1.23);
          if(i===5) rail.to(words,{fontWeight:100,skewX:-10,letterSpacing:'.035em',duration:.55},start+.5).to(words,{fontWeight:900,skewX:0,letterSpacing:'-.035em',duration:.12},start+1.15);
          rail.to({}, {duration:.6},start+1.35);
          if(i<cards.length-1) rail.to('.effect-list',{x:()=>-(i+1)*innerWidth,duration:.8,ease:'power3.inOut'});
        });

        const awareness = gsap.timeline({scrollTrigger:{trigger:'.awareness-opening',start:'top top',end:'+=180%',pin:true,scrub:1,anticipatePin:1}});
        awareness.fromTo('.awareness-opening .chapter-title',{xPercent:-35,scale:2.5},{xPercent:0,scale:1,duration:1})
          .to('.awareness-opening .chapter-title',{yPercent:-125,opacity:.12,duration:.7},1)
          .from('.awareness-question .kinetic-word',{x:n=>(n%3-1)*150,y:n=>(n%2 ? -1 : 1)*170,rotation:n=>(n%2 ? -1 : 1)*35,opacity:0,stagger:.035,duration:1,ease:'power3.out'},1)
          .to({}, {duration:.8});

        const panels = $('.solution');
        const deck = gsap.timeline({scrollTrigger:{trigger:'.solution-deck',start:'top top',end:()=>`+=${innerHeight * 7}`,pin:true,scrub:1,anticipatePin:1,invalidateOnRefresh:true}});
        panels.forEach((panel,i) => {
          const start = i*1.8;
          if(i) {
            deck.from(panel,{yPercent:110,rotation:6,transformOrigin:'bottom left',duration:.8,ease:'power3.inOut'},start)
              .to(panels[i-1],{scale:.88,rotation:-4,yPercent:-8,duration:.8},start);
          }
          deck.from(panel.querySelector('.solution-number'),{xPercent:-70,rotation:-25,opacity:0,duration:.8},start+.15)
            .from(panel.querySelector('h3'),{clipPath:'inset(100% 0 0 0)',y:50,duration:.6},start+.3)
            .to({}, {duration:.7},start+1);
        });

        const finale = gsap.timeline({scrollTrigger:{trigger:'.final-scene',start:'top top',end:'+=200%',pin:true,scrub:1,anticipatePin:1}});
        finale.from('.final-statement>span:first-child',{yPercent:-180,opacity:0,duration:.7})
          .from('.rewrite-char',{x:n=>(n%3-1)*250,y:n=>(n%2 ? -1 : 1)*(250+n*12),rotation:n=>(n%2 ? -1 : 1)*100,scale:n=>n%2 ? 2 : .3,opacity:0,stagger:{each:.05,from:'center'},duration:1.2,ease:'power3.out'},.15)
          .to({}, {duration:.5})
          .fromTo('.final-curtain',{scaleY:0},{scaleY:1,transformOrigin:'bottom',duration:.8,ease:'power3.inOut'})
          .to('.final-statement',{color:'#F5EAEA',scale:1.04,duration:.6},'-=.6')
          .to({}, {duration:.35});
      } else {
        // Touch devices still get expressive typography, without long pinned travel.
        gsap.to('.hero-line:first-child',{xPercent:-22,rotation:-5,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
        gsap.to('.hero-line:last-child',{xPercent:18,rotation:4,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
        gsap.utils.toArray('.chapter-title > .title-base').forEach(el=>gsap.from(el,{xPercent:-35,scale:1.7,scrollTrigger:{trigger:el,start:'top bottom',end:'top 35%',scrub:1}}));
        gsap.utils.toArray('.effect').forEach((el,i)=> {
          gsap.from(el.querySelectorAll('.kinetic-word'),{yPercent:i%2 ? -85 : 85,rotation:i%2 ? -12 : 12,opacity:.1,stagger:.07,duration:.75,scrollTrigger:{trigger:el,start:'top 88%',once:true}});
          gsap.fromTo(el.querySelector('.pressure-echo'),{xPercent:-15},{xPercent:15,scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1}});
        });
        gsap.from('.awareness-question .kinetic-word',{rotation:20,y:45,opacity:.1,stagger:.05,scrollTrigger:{trigger:'.awareness-question',start:'top 90%',end:'bottom 45%',scrub:1}});
        gsap.utils.toArray('.solution').forEach(el=>gsap.from(el.querySelector('.solution-number'),{x:-65,rotation:-35,opacity:.15,duration:.8,scrollTrigger:{trigger:el,start:'top 85%',once:true}}));
        gsap.from('.rewrite-char',{y:n=>n%2 ? 65 : -65,rotation:n=>n%2 ? -35 : 35,opacity:0,stagger:.035,duration:.8,scrollTrigger:{trigger:'.final-statement',start:'top 85%',once:true}});
      }

      gsap.utils.toArray('.reflection-pair').forEach(el=> {
        gsap.from(el.querySelector('blockquote'),{xPercent:20,rotation:-3,clipPath:'inset(0 100% 0 0)',scrollTrigger:{trigger:el,start:'top 90%',end:'top 45%',scrub:1}});
      });
      gsap.from('.checklist h2',{scale:.65,rotation:-5,scrollTrigger:{trigger:'.checklist',start:'top 95%',end:'top 20%',scrub:1}});
      gsap.from('fieldset label',{x:n=>n%2 ? 70 : -70,opacity:0,stagger:.04,duration:.6,scrollTrigger:{trigger:'fieldset',start:'top 85%',once:true}});
      requestAnimationFrame(()=>ScrollTrigger.refresh());
      return () => root.classList.remove('experimental-desktop','motion-enabled');
    });
  },root);
  // Font loading and pin spacers can move a fragment target after initial navigation.
  const frame = requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    if (location.hash) {
      let id;
      try {id = decodeURIComponent(location.hash.slice(1))} catch {return}
      root.querySelector(`[id="${CSS.escape(id)}"]`)?.scrollIntoView({behavior:'instant',block:'start'});
    }
  });
  return () => {cancelAnimationFrame(frame);media.revert();context.revert()};
}
