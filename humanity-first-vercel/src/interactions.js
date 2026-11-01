// Pointer work lives on inner ink layers, independently of the scroll transforms.
export function createInteractions(root) {
  const query = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let teardown = () => {};
  function install() {
    teardown();
    if (!query.matches) return;
    root.classList.add('pointer-enabled');
    const disposers = [];
    const listen = (element,event,handler,options) => {
      element.addEventListener(event,handler,options);
      disposers.push(()=>element.removeEventListener(event,handler,options));
    };
    const set = (el,name,value) => el.style.setProperty(name,value);
    const clamp = (value,max) => Math.max(-max,Math.min(max,value));

    root.querySelectorAll('.magnetic').forEach(el => {
      let bounds;
      listen(el,'pointerenter',()=>{bounds=el.getBoundingClientRect()});
      listen(el,'pointermove',e=> {
        if (!bounds) bounds=el.getBoundingClientRect();
        set(el,'--magnet-x',`${clamp((e.clientX-bounds.left-bounds.width/2)*.22,14)}px`);
        set(el,'--magnet-y',`${clamp((e.clientY-bounds.top-bounds.height/2)*.22,11)}px`);
      });
      listen(el,'pointerleave',()=>{set(el,'--magnet-x','0px');set(el,'--magnet-y','0px');bounds=null});
      disposers.push(()=>{el.style.removeProperty('--magnet-x');el.style.removeProperty('--magnet-y')});
    });

    root.querySelectorAll('.chapter-title').forEach(el=> {
      listen(el,'pointermove',e=> {
        const r=el.getBoundingClientRect();
        set(el,'--lens-x',`${(e.clientX-r.left)/r.width*100}%`);
        set(el,'--lens-y',`${(e.clientY-r.top)/r.height*100}%`);
        set(el,'--lens-radius','145px');
      });
      listen(el,'pointerleave',()=>set(el,'--lens-radius','0px'));
      disposers.push(()=>['--lens-x','--lens-y','--lens-radius'].forEach(name=>el.style.removeProperty(name)));
    });

    root.querySelectorAll('.solution').forEach(el=> {
      listen(el,'pointermove',e=> {
        const r=el.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        set(el,'--tilt-x',`${-y*8}deg`);set(el,'--tilt-y',`${x*10}deg`);
        set(el,'--number-x',`${x*42}px`);set(el,'--number-y',`${y*32}px`);
      });
      const reset=()=>['--tilt-x','--tilt-y','--number-x','--number-y'].forEach(name=>el.style.removeProperty(name));
      listen(el,'pointerleave',reset);disposers.push(reset);
    });

    // Damped springs: no render-loop React state, and no layout reads per frame.
    const fields = [...root.querySelectorAll('.hero h1, .final-statement')].map(el=>({
      el,active:false,dirty:true,mouse:{x:0,y:0},
      glyphs:[...el.querySelectorAll('.type-glyph')].map(ink=>({ink,x:0,y:0,vx:0,vy:0,cx:0,cy:0})),
    }));
    let frame=0;
    let lastTime=0;
    const request = () => {if(!frame) frame=requestAnimationFrame(tick)};
    function tick(time) {
      frame=0;
      const dt=Math.min((time-(lastTime||time-16.67))/16.67,2);
      lastTime=time;
      let moving=false;
      for(const field of fields) {
        if(field.active && field.dirty) {
          // Batch geometry before mutating the ink transforms.
          for(const g of field.glyphs) {
            const r=g.ink.getBoundingClientRect();g.cx=r.left+r.width/2-g.x;g.cy=r.top+r.height/2-g.y;
          }
          field.dirty=false;
        }
        for(const g of field.glyphs) {
          const dx=g.cx-field.mouse.x,dy=g.cy-field.mouse.y;
          const distance=Math.hypot(dx,dy);
          const pressure=field.active ? Math.max(0,1-distance/190)**2 : 0;
          const tx=dx/Math.max(distance,1)*pressure*85;
          const ty=dy/Math.max(distance,1)*pressure*70;
          g.vx=(g.vx+(tx-g.x)*.13*dt)*Math.pow(.73,dt);
          g.vy=(g.vy+(ty-g.y)*.13*dt)*Math.pow(.73,dt);
          g.x+=g.vx*dt;g.y+=g.vy*dt;
          if(Math.abs(tx-g.x)+Math.abs(ty-g.y)+Math.abs(g.vx)+Math.abs(g.vy)>.08) moving=true;
          else {g.x=tx;g.y=ty;g.vx=0;g.vy=0}
          set(g.ink,'--glyph-x',`${g.x.toFixed(2)}px`);
          set(g.ink,'--glyph-y',`${g.y.toFixed(2)}px`);
          set(g.ink,'--glyph-r',`${(g.x*.24).toFixed(2)}deg`);
        }
      }
      if(moving) request();else lastTime=0;
    }
    fields.forEach(field=> {
      listen(field.el,'pointerenter',()=>{field.active=true;field.dirty=true});
      listen(field.el,'pointermove',e=>{field.active=true;field.mouse={x:e.clientX,y:e.clientY};request()});
      listen(field.el,'pointerleave',()=>{field.active=false;request()});
    });
    const orbit=root.querySelector('.pointer-orbit');
    const hideOrbit=()=>orbit.classList.remove('is-visible');
    listen(root,'pointermove',e=> {
      const target=e.target.closest('.hero h1, .chapter-title, .effect h3, .final-statement');
      if (!target) {hideOrbit();return}
      orbit.classList.add('is-visible');
      orbit.style.color=target.closest('.hero, .effects') ? '#F5EAEA' : '#3355E8';
      orbit.style.left=`${e.clientX}px`;orbit.style.top=`${e.clientY}px`;
    });
    listen(root,'pointerleave',hideOrbit);
    listen(window,'scroll',()=> {
      const unsettled=fields.some(f=>f.active || f.glyphs.some(g=>Math.abs(g.x)+Math.abs(g.y)>.01));
      fields.forEach(f=>{f.active=false;f.dirty=true});if(unsettled) request();hideOrbit();
    },{passive:true});
    listen(window,'resize',()=>fields.forEach(f=>{f.dirty=true;f.active=false}));
    teardown=()=> {
      disposers.forEach(dispose=>dispose());cancelAnimationFrame(frame);
      fields.forEach(f=>f.glyphs.forEach(g=>['--glyph-x','--glyph-y','--glyph-r'].forEach(name=>g.ink.style.removeProperty(name))));
      hideOrbit();root.classList.remove('pointer-enabled');
    };
  }
  query.addEventListener('change',install);install();
  return () => {query.removeEventListener('change',install);teardown()};
}
