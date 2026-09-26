import { useId } from 'react';
import { outline, points } from './indiaGeometry';

export default function IndiaGlobe() {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="india-globe" viewBox="0 0 290 290" role="img" aria-label="Glowing India map">
      <defs>
        <radialGradient id={id+'sphere'}><stop stopColor="#352051" /><stop offset=".8" stopColor="#100d20" /><stop offset="1" stopColor="#6636a3" /></radialGradient>
        <linearGradient id={id+'fade'} x2="0" y2="1"><stop stopColor="#d7b6ff" stopOpacity=".15" /><stop offset=".5" stopColor="#ad70ff" /><stop offset="1" stopColor="#6c37a9" stopOpacity=".2" /></linearGradient>
        <pattern id={id+'dots'} width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".8" fill="#e8ccff" /></pattern>
        <filter id={id+'glow'} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" /></filter>
        <clipPath id={id+'india'}><path d={outline} /></clipPath>
      </defs>
      <circle cx="145" cy="145" r="140" fill={`url(#${id}sphere)`} stroke="#9e63e1" strokeWidth="2" />
      <g fill="none" stroke="#b87afa" opacity=".15"><ellipse cx="145" cy="145" rx="75" ry="131" /><ellipse cx="145" cy="145" rx="120" ry="131" /><ellipse cx="145" cy="145" rx="131" ry="48" /><ellipse cx="145" cy="145" rx="131" ry="94" /></g>
      <path d={outline} fill={`url(#${id}fade)`} stroke="#b681ec" strokeWidth="1.2" />
      <path d={outline} fill={`url(#${id}dots)`} opacity=".55" />
      <g clipPath={`url(#${id}india)`} stroke="#bf8cff" strokeWidth=".7" opacity=".55">{points.map(([x,y],i) => <path key={i} d={`M${x} ${y} L${points[(i+3)%points.length].join(' ')} L${points[(i+5)%points.length].join(' ')}`} fill="none" />)}</g>
      {points.map(([cx,cy],i) => <g key={i} className="map-node" style={{ animationDelay: `${i * -.3}s` }}><circle cx={cx} cy={cy} r="5" fill="#c291ff" filter={`url(#${id}glow)`} /><circle cx={cx} cy={cy} r="1.8" fill="#fff1ff" /></g>)}
      <circle cx="145" cy="145" r="133" fill="none" stroke="#d1abff" strokeOpacity=".5" />
      <g className="globe-orbit" fill="#fff3ff">
        <circle cx="145" cy="10" r="3" />
        <circle cx="276" cy="177" r="2" />
        <circle cx="60" cy="250" r="2.7" />
        <circle cx="21" cy="92" r="1.8" />
      </g>
    </svg>
  );
}
