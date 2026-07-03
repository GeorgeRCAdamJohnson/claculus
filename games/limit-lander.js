// Limit Lander - Limits Game
const LimitLander = {
    name: 'limit-lander', engine: null, canvas: null, ctx: null,
    currentQuestion: null, inputValue: 0, difficulty: 'easy',
    questionCount: 0, approachAnim: 0, showingAnswer: false,
    functions: {
        easy: [
            { fn: x => (x*x-4)/(x-2), limitAt: 2, limitValue: 4, label: 'lim (x²-4)/(x-2)', sublabel: 'x→2', concept: 'limit_removable' },
            { fn: x => (x*x-1)/(x-1), limitAt: 1, limitValue: 2, label: 'lim (x²-1)/(x-1)', sublabel: 'x→1', concept: 'limit_removable' },
            { fn: x => (x*x-9)/(x-3), limitAt: 3, limitValue: 6, label: 'lim (x²-9)/(x-3)', sublabel: 'x→3', concept: 'limit_removable' },
            { fn: x => (x-2)*(x+3)/(x-2), limitAt: 2, limitValue: 5, label: 'lim (x-2)(x+3)/(x-2)', sublabel: 'x→2', concept: 'limit_removable' },
            { fn: x => (x*x-2*x)/(x-2), limitAt: 2, limitValue: 2, label: 'lim (x²-2x)/(x-2)', sublabel: 'x→2', concept: 'limit_removable' },
        ],
        medium: [
            { fn: x => x===0?1:Math.sin(x)/x, limitAt: 0, limitValue: 1, label: 'lim sin(x)/x', sublabel: 'x→0', concept: 'limit_indeterminate' },
            { fn: x => (Math.exp(x)-1)/(x===0?1:x), limitAt: 0, limitValue: 1, label: 'lim (eˣ-1)/x', sublabel: 'x→0', concept: 'limit_indeterminate' },
            { fn: x => (x*x*x-8)/(x-2), limitAt: 2, limitValue: 12, label: 'lim (x³-8)/(x-2)', sublabel: 'x→2', concept: 'limit_removable' },
            { fn: x => (x*x+x-6)/(x-2), limitAt: 2, limitValue: 5, label: 'lim (x²+x-6)/(x-2)', sublabel: 'x→2', concept: 'limit_removable' },
        ],
        hard: [
            { fn: x => (1-Math.cos(x))/(x*x===0?1:x*x), limitAt: 0, limitValue: 0.5, label: 'lim (1-cos x)/x²', sublabel: 'x→0', concept: 'limit_indeterminate' },
            { fn: x => (Math.sqrt(x+4)-2)/(x===0?0.001:x), limitAt: 0, limitValue: 0.25, label: 'lim (√(x+4)-2)/x', sublabel: 'x→0', concept: 'limit_indeterminate' },
            { fn: x => (x*x-4)/(x*x-5*x+6), limitAt: 2, limitValue: -4, label: 'lim (x²-4)/(x²-5x+6)', sublabel: 'x→2', concept: 'limit_removable' },
            { fn: x => Math.tan(x)/(x===0?1:x), limitAt: 0, limitValue: 1, label: 'lim tan(x)/x', sublabel: 'x→0', concept: 'limit_indeterminate' },
        ]
    },
    init(canvas, ctx, engine) {
        this.canvas=canvas; this.ctx=ctx; this.engine=engine;
        this.questionCount=0; this.showingAnswer=false; this.setupControls();
    },
    setupControls() {
        document.getElementById('game-controls').innerHTML = `
            <div class="inline-instruction">🎯 What y-value does the function approach at the pink hole?</div>
            <div class="limit-input-row">
                <button class="limit-adjust-btn" id="limit-minus">−</button>
                <input type="number" class="limit-input" id="limit-input" value="0" step="0.5">
                <button class="limit-adjust-btn" id="limit-plus">+</button>
                <button class="submit-btn" id="limit-submit">Submit ▶</button>
            </div>
            <div class="answer-reveal hidden" id="limit-answer"></div>`;
        const input=document.getElementById('limit-input');
        input.addEventListener('input',()=>{this.inputValue=parseFloat(input.value)||0;});
        document.getElementById('limit-minus').addEventListener('click',()=>{this.inputValue=Math.round((this.inputValue-0.5)*10)/10;input.value=this.inputValue;});
        document.getElementById('limit-plus').addEventListener('click',()=>{this.inputValue=Math.round((this.inputValue+0.5)*10)/10;input.value=this.inputValue;});
        document.getElementById('limit-submit').addEventListener('click',()=>this.submit());
        document.addEventListener('keydown',this._keyHandler=(e)=>{if(e.key==='Enter'&&this.engine.state==='playing')this.submit();});
    },
    generateQuestion() {
        this.questionCount++; this.showingAnswer=false;
        const a=document.getElementById('limit-answer'); if(a)a.classList.add('hidden');
        if(window.app&&window.app.assessment){const e=30-this.engine.timer,ac=this.engine.total>0?this.engine.correct/this.engine.total:0.5;this.difficulty=window.app.assessment.selectDifficulty(ac,e);}
        else{this.difficulty=this.questionCount<=2?'easy':this.questionCount<=4?'medium':'hard';}
        this.currentQuestion=this.functions[this.difficulty][Math.floor(Math.random()*this.functions[this.difficulty].length)];
        this.approachAnim=0;this.inputValue=0;
        const input=document.getElementById('limit-input');if(input)input.value='0';
        document.getElementById('game-instruction').textContent=`${this.currentQuestion.label}, ${this.currentQuestion.sublabel}`;
    },
    submit() {
        if(!this.currentQuestion||this.engine.state!=='playing'||this.showingAnswer)return;
        const actual=this.currentQuestion.limitValue,est=this.inputValue;
        const err=Math.abs(est-actual),maxE=Math.max(Math.abs(actual)*0.5,2);
        const acc=Math.max(0,1-err/maxE),ok=acc>=0.35;
        this.showingAnswer=true;
        const el=document.getElementById('limit-answer');
        el.innerHTML=ok?`✓ Limit = <strong>${actual.toFixed(2)}</strong> (you: ${est.toFixed(1)})`:`✗ Limit = <strong>${actual.toFixed(2)}</strong> (you: ${est.toFixed(1)})`;
        el.className=`answer-reveal ${ok?'answer-correct':'answer-wrong'}`;
        this.engine.submitAnswer({correct:ok,accuracy:acc,concept:this.currentQuestion.concept});
    },
    update(dt){this.approachAnim+=dt*0.8;},

    render(ctx,w,h) {
        if(!this.currentQuestion)return;
        const q=this.currentQuestion,pad=50,gH=h-pad*2-80,gW=w-pad*2;
        const lx=q.limitAt,xMin=lx-4,xMax=lx+4;
        let yMin=-2,yMax=6;
        [-3,-2,-1,-0.5,0.5,1,2,3].forEach(d=>{const y=q.fn(lx+d);if(isFinite(y)){if(y<yMin)yMin=y-1;if(y>yMax)yMax=y+1;}});
        yMin=Math.max(yMin,-10);yMax=Math.min(yMax,10);
        const sx=x=>pad+(x-xMin)/(xMax-xMin)*gW, sy=y=>pad+(1-(y-yMin)/(yMax-yMin))*gH;
        // Grid
        ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=1;
        for(let x=Math.ceil(xMin);x<=xMax;x++){ctx.beginPath();ctx.moveTo(sx(x),pad);ctx.lineTo(sx(x),pad+gH);ctx.stroke();}
        for(let y=Math.ceil(yMin);y<=yMax;y++){ctx.beginPath();ctx.moveTo(pad,sy(y));ctx.lineTo(pad+gW,sy(y));ctx.stroke();}
        ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(pad,sy(0));ctx.lineTo(pad+gW,sy(0));ctx.stroke();
        ctx.beginPath();ctx.moveTo(sx(0),pad);ctx.lineTo(sx(0),pad+gH);ctx.stroke();
        // Curve
        ctx.save();ctx.shadowColor='rgba(0,229,204,0.4)';ctx.shadowBlur=10;ctx.strokeStyle='#00e5cc';ctx.lineWidth=3;ctx.beginPath();
        let f=true;for(let px=0;px<=gW;px+=2){const x=xMin+(px/gW)*(xMax-xMin);if(Math.abs(x-lx)<0.08){f=true;continue;}const y=q.fn(x);if(!isFinite(y)||y<yMin-2||y>yMax+2){f=true;continue;}if(f){ctx.moveTo(sx(x),sy(y));f=false;}else ctx.lineTo(sx(x),sy(y));}
        ctx.stroke();ctx.restore();
        // Hole
        const hX=sx(lx),hY=sy(q.limitValue);
        ctx.strokeStyle='#ff6b9d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(hX,hY,10,0,Math.PI*2);ctx.stroke();
        const pulse=1+Math.sin(Date.now()/400)*0.3;
        ctx.strokeStyle='rgba(255,107,157,0.3)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(hX,hY,10*pulse+5,0,Math.PI*2);ctx.stroke();
        // Approach arrows
        const t=Math.min(this.approachAnim,3)/3,ap=0.5*(1-t)+0.02;
        const lX=lx-ap,rX=lx+ap,lY=q.fn(lX),rY=q.fn(rX);
        if(isFinite(lY)&&isFinite(rY)){
            ctx.save();const ls=sx(lX),lt=sy(lY),rs=sx(rX),rt=sy(rY);
            ctx.fillStyle='rgba(124,92,231,0.9)';ctx.beginPath();ctx.arc(ls,lt,6,0,Math.PI*2);ctx.fill();
            ctx.strokeStyle='rgba(124,92,231,0.7)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ls+9,lt);ctx.lineTo(ls+18,lt);ctx.stroke();
            ctx.fillStyle='rgba(255,217,61,0.9)';ctx.beginPath();ctx.arc(rs,rt,6,0,Math.PI*2);ctx.fill();
            ctx.strokeStyle='rgba(255,217,61,0.7)';ctx.beginPath();ctx.moveTo(rs-9,rt);ctx.lineTo(rs-18,rt);ctx.stroke();
            ctx.font='bold 11px "SF Mono",monospace';
            ctx.fillStyle='rgba(124,92,231,1)';ctx.fillText(`→${lY.toFixed(2)}`,ls-50,lt-12);
            ctx.fillStyle='rgba(255,217,61,1)';ctx.fillText(`${rY.toFixed(2)}←`,rs+5,rt-12);
            ctx.restore();
        }
        // Instruction on canvas
        ctx.fillStyle='rgba(255,255,255,0.85)';ctx.font='bold 14px sans-serif';ctx.textAlign='center';
        ctx.fillText('What y-value does the curve approach at the pink circle?',w/2,pad-10);ctx.textAlign='left';
        // Labels
        ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='14px "SF Mono",monospace';ctx.fillText(q.label,pad+5,pad+gH+35);
        ctx.fillStyle='rgba(255,107,157,0.8)';ctx.font='bold 12px "SF Mono",monospace';ctx.fillText(q.sublabel,pad+5,pad+gH+52);
        ctx.fillStyle='#ff6b9d';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText('?',hX,hY-16);ctx.textAlign='left';
    },
    cleanup(){document.removeEventListener('keydown',this._keyHandler);document.getElementById('game-controls').innerHTML='';}
};

    render(ctx,w,h) {
        if(!this.currentQuestion)return;
        const q=this.currentQuestion,p=50,gH=h-p*2-80,gW=w-p*2,lx=q.limitAt;
        const xMin=lx-4,xMax=lx+4;let yMin=-2,yMax=6;
        [-3,-2,-1,-0.5,0.5,1,2,3].forEach(d=>{const y=q.fn(lx+d);if(isFinite(y)){if(y<yMin)yMin=y-1;if(y>yMax)yMax=y+1;}});
        yMin=Math.max(yMin,-10);yMax=Math.min(yMax,10);
        const sx=x=>p+(x-xMin)/(xMax-xMin)*gW, sy=y=>p+(1-(y-yMin)/(yMax-yMin))*gH;
        // Grid
        ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=1;
        for(let x=Math.ceil(xMin);x<=xMax;x++){ctx.beginPath();ctx.moveTo(sx(x),p);ctx.lineTo(sx(x),p+gH);ctx.stroke();}
        for(let y=Math.ceil(yMin);y<=yMax;y++){ctx.beginPath();ctx.moveTo(p,sy(y));ctx.lineTo(p+gW,sy(y));ctx.stroke();}
        ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(p,sy(0));ctx.lineTo(p+gW,sy(0));ctx.stroke();
        ctx.beginPath();ctx.moveTo(sx(0),p);ctx.lineTo(sx(0),p+gH);ctx.stroke();
        // Curve with gap
        ctx.save();ctx.shadowColor='rgba(0,229,204,0.4)';ctx.shadowBlur=10;ctx.strokeStyle='#00e5cc';ctx.lineWidth=3;ctx.beginPath();
        let f=true;for(let px=0;px<=gW;px+=2){const x=xMin+(px/gW)*(xMax-xMin);if(Math.abs(x-lx)<0.08){f=true;continue;}const y=q.fn(x);if(!isFinite(y)||y<yMin-2||y>yMax+2){f=true;continue;}if(f){ctx.moveTo(sx(x),sy(y));f=false;}else ctx.lineTo(sx(x),sy(y));}
        ctx.stroke();ctx.restore();
        // Hole (pink circle)
        const hX=sx(lx),hY=sy(q.limitValue);
        ctx.strokeStyle='#ff6b9d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(hX,hY,10,0,Math.PI*2);ctx.stroke();
        const pulse=1+Math.sin(Date.now()/400)*0.3;
        ctx.strokeStyle='rgba(255,107,157,0.3)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(hX,hY,10*pulse+5,0,Math.PI*2);ctx.stroke();
        // Approach arrows
        const t=Math.min(this.approachAnim,3)/3,ap=0.5*(1-t)+0.02;
        const lX=lx-ap,rX=lx+ap,lY=q.fn(lX),rY=q.fn(rX);
        if(isFinite(lY)&&isFinite(rY)){
            ctx.save();const ls=sx(lX),lt=sy(lY),rs=sx(rX),rt=sy(rY);
            ctx.fillStyle='rgba(124,92,231,0.9)';ctx.beginPath();ctx.arc(ls,lt,6,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='rgba(255,217,61,0.9)';ctx.beginPath();ctx.arc(rs,rt,6,0,Math.PI*2);ctx.fill();
            ctx.font='bold 11px "SF Mono",monospace';
            ctx.fillStyle='rgba(124,92,231,1)';ctx.fillText(`→${lY.toFixed(2)}`,ls-50,lt-14);
            ctx.fillStyle='rgba(255,217,61,1)';ctx.fillText(`${rY.toFixed(2)}←`,rs+5,rt-14);
            ctx.restore();
        }
        // On-canvas instruction
        ctx.fillStyle='rgba(255,255,255,0.85)';ctx.font='bold 13px sans-serif';ctx.textAlign='center';
        ctx.fillText('What y-value does the curve approach at the pink ○?',w/2,p-10);ctx.textAlign='left';
        // Labels
        ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='13px "SF Mono",monospace';ctx.fillText(q.label,p+5,p+gH+35);
        ctx.fillStyle='rgba(255,107,157,0.8)';ctx.font='bold 12px "SF Mono",monospace';ctx.fillText(q.sublabel,p+5,p+gH+52);
        ctx.fillStyle='#ff6b9d';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText('?',hX,hY-16);ctx.textAlign='left';
    },
    cleanup(){document.removeEventListener('keydown',this._keyHandler);document.getElementById('game-controls').innerHTML='';}
};
