// Animated Chemparts "CP" logo intro — faithful to the brand logo-intro design.
// Pure SVG + CSS keyframes, loops seamlessly (stage fade hides the restart).
// Used ONLY on the sign-in page; the rest of the site uses the static logo.svg.

const CSS = `
@keyframes cpStage{0%{opacity:0}7%{opacity:1}90%{opacity:1}100%{opacity:0}}
@keyframes cpSqL{0%,6%{opacity:0;transform:translateY(9px) scale(.9)}19%{opacity:1;transform:none}100%{opacity:1;transform:none}}
@keyframes cpSqR{0%,11%{opacity:0;transform:translateY(9px) scale(.9)}24%{opacity:1;transform:none}100%{opacity:1;transform:none}}
@keyframes cpLetC{0%,16%{opacity:0;transform:translateY(92px)}31%{opacity:1;transform:translateY(0)}100%{opacity:1;transform:translateY(0)}}
@keyframes cpLetP{0%,20%{opacity:0;transform:translateY(92px)}35%{opacity:1;transform:translateY(0)}100%{opacity:1;transform:translateY(0)}}
@keyframes cpDrop{0%,22%{opacity:0;transform:translateY(-74px)}31%{opacity:1;transform:translateY(7px)}35%{transform:translateY(0)}100%{opacity:1;transform:translateY(0)}}
@keyframes cpBase{0%,34%{transform:scaleX(0)}49%{transform:scaleX(1)}100%{transform:scaleX(1)}}
@keyframes cpScan{0%,34%{opacity:0;transform:translateX(0)}37%{opacity:1}48%{opacity:1;transform:translateX(206px)}52%{opacity:0;transform:translateX(206px)}100%{opacity:0}}
@keyframes cpSweep{0%,52%{opacity:0;transform:translateX(-46px)}57%{opacity:1}74%{opacity:1}80%{opacity:0;transform:translateX(232px)}100%{opacity:0;transform:translateX(232px)}}
@keyframes cpTick{0%,40%{opacity:0}54%{opacity:1}100%{opacity:1}}
@keyframes cpWord{0%,42%{opacity:0;transform:translateY(11px)}55%{opacity:1;transform:translateY(0)}100%{opacity:1;transform:translateY(0)}}
@media (prefers-reduced-motion: reduce){
  .cp-logo,.cp-logo *{animation:none !important;opacity:1 !important;transform:none !important}
}
`

const MARKUP = `
<div class="cp-logo" style="--cp-dur:7s;--cp-surface:#1273BE;--cp-ink:#FFFFFF;--cp-accent:#38A9F0;--cp-tick:rgba(18,115,190,0.28);--cp-word:#0A2540;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:'Space Grotesk','Geist',system-ui,sans-serif;animation:cpStage var(--cp-dur) ease-in-out infinite both">
  <svg viewBox="0 0 220 128" style="width:158px;height:auto;overflow:visible;display:block" aria-label="Chemparts">
    <defs>
      <clipPath id="cpL"><rect x="7" y="2" width="100" height="100" rx="4" ry="4"></rect></clipPath>
      <clipPath id="cpR"><rect x="113" y="2" width="100" height="100" rx="4" ry="4"></rect></clipPath>
      <linearGradient id="cpSweepGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" style="stop-color:var(--cp-accent);stop-opacity:0"></stop>
        <stop offset="0.5" style="stop-color:var(--cp-accent);stop-opacity:0.5"></stop>
        <stop offset="1" style="stop-color:var(--cp-accent);stop-opacity:0"></stop>
      </linearGradient>
    </defs>
    <rect x="7" y="2" width="100" height="100" rx="4" ry="4" fill="var(--cp-surface)" style="transform-box:fill-box;transform-origin:center;animation:cpSqL var(--cp-dur) cubic-bezier(.2,.9,.2,1) infinite both"></rect>
    <g clip-path="url(#cpL)">
      <text x="57" y="58" text-anchor="middle" dominant-baseline="central" fill="var(--cp-ink)" style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:82px;transform-box:fill-box;animation:cpLetC var(--cp-dur) cubic-bezier(.2,.9,.2,1) infinite both">C</text>
    </g>
    <rect x="113" y="2" width="100" height="100" rx="4" ry="4" fill="var(--cp-surface)" style="transform-box:fill-box;transform-origin:center;animation:cpSqR var(--cp-dur) cubic-bezier(.2,.9,.2,1) infinite both"></rect>
    <g clip-path="url(#cpR)">
      <text x="158" y="58" text-anchor="middle" dominant-baseline="central" fill="var(--cp-ink)" style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:82px;transform-box:fill-box;animation:cpLetP var(--cp-dur) cubic-bezier(.2,.9,.2,1) infinite both">P</text>
    </g>
    <circle cx="163" cy="20" r="6.5" fill="var(--cp-accent)" style="transform-box:fill-box;animation:cpDrop var(--cp-dur) cubic-bezier(.3,1.4,.5,1) infinite both"></circle>
    <rect x="7" y="107" width="206" height="2.5" fill="var(--cp-surface)" style="transform-box:fill-box;transform-origin:left center;animation:cpBase var(--cp-dur) cubic-bezier(.65,0,.35,1) infinite both"></rect>
    <circle cx="7" cy="108.2" r="3.2" fill="var(--cp-accent)" style="transform-box:fill-box;animation:cpScan var(--cp-dur) cubic-bezier(.65,0,.35,1) infinite both"></circle>
    <line x1="7" y1="115" x2="213" y2="115" stroke="var(--cp-tick)" stroke-width="6" stroke-dasharray="1.5 18.1" style="animation:cpTick var(--cp-dur) ease-out infinite both"></line>
    <g clip-path="url(#cpL)">
      <rect x="-46" y="0" width="46" height="104" fill="url(#cpSweepGrad)" style="transform-box:view-box;animation:cpSweep var(--cp-dur) ease-in-out infinite both"></rect>
    </g>
    <g clip-path="url(#cpR)">
      <rect x="-46" y="0" width="46" height="104" fill="url(#cpSweepGrad)" style="transform-box:view-box;animation:cpSweep var(--cp-dur) ease-in-out infinite both"></rect>
    </g>
  </svg>
  <div style="font-weight:700;font-size:18px;letter-spacing:0.34em;padding-left:0.34em;color:var(--cp-word)">CHEMPARTS</div>
</div>
`

export default function AnimatedLogo() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <span dangerouslySetInnerHTML={{ __html: MARKUP }} />
    </>
  )
}
