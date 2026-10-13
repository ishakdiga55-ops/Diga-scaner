import { describe, it, expect } from 'vitest';

function pHex(txt){
  if(!txt)return [];
  const cleaned=txt.replace(/[^0-9A-Fa-f]/g,' ');
  const parts=cleaned.trim().split(/\s+/);
  const bytes=[];
  for(const x of parts){
    if(x.length===2)bytes.push(parseInt(x,16));
    else if(x.length>2&&x.length%2===0)
      for(let j=0;j<x.length;j+=2)bytes.push(parseInt(x.substr(j,2),16));
  }
  return bytes;
}

function dtcFromPairs(b){
  const o=[];
  for(let k=0;k+1<b.length;k+=2){
    const a=b[k],c=b[k+1];
    if(!a&&!c)continue;
    o.push(['P','C','B','U'][a>>6]+((a>>4)&3).toString(16)+(a&15).toString(16)+(c>>4).toString(16)+(c&15).toString(16));
  }
  return o;
}

function pRPM(r){
  const b=pHex(r);
  for(let i=0;i<b.length-3;i++)
    if(b[i]===0x41&&b[i+1]===0x0C)
      return Math.round(((b[i+2]*256)+b[i+3])/4);
  return null;
}

function pSpeed(r){
  const b=pHex(r);
  for(let i=0;i<b.length-2;i++)
    if(b[i]===0x41&&b[i+1]===0x0D)return b[i+2];
  return null;
}

function pCool(r){
  const b=pHex(r);
  for(let i=0;i<b.length-2;i++)
    if(b[i]===0x41&&b[i+1]===0x05)return b[i+2]-40;
  return null;
}

describe('pHex', () => {
  it('basic bytes', () => {
    expect(pHex('41 0C 1A F8')).toEqual([0x41,0x0C,0x1A,0xF8]);
  });
  it('lowercase', () => {
    expect(pHex('41 0c 1a f8')).toEqual([0x41,0x0C,0x1A,0xF8]);
  });
  it('no spaces', () => {
    expect(pHex('410C1AF8')).toEqual([0x41,0x0C,0x1A,0xF8]);
  });
  it('empty', () => {
    expect(pHex('')).toEqual([]);
  });
});

describe('dtcFromPairs', () => {
  it('P0300', () => {
    expect(dtcFromPairs([0x03,0x00])).toEqual(['P0300']);
  });
  it('P0171', () => {
    expect(dtcFromPairs([0x01,0x71])).toEqual(['P0171']);
  });
  it('U0100', () => {
    expect(dtcFromPairs([0xC1,0x00])).toEqual(['U0100']);
  });
  it('C0035', () => {
    expect(dtcFromPairs([0x40,0x35])).toEqual(['C0035']);
  });
  it('multiple', () => {
    expect(dtcFromPairs([0x03,0x00,0x01,0x71])).toEqual(['P0300','P0171']);
  });
  it('empty', () => {
    expect(dtcFromPairs([])).toEqual([]);
  });
});

describe('pRPM', () => {
  it('0 RPM', () => {
    expect(pRPM('41 0C 00 00')).toBe(0);
  });
  it('1000 RPM', () => {
    expect(pRPM('41 0C 0F A0')).toBe(1000);
  });
  it('invalid', () => {
    expect(pRPM('NO DATA')).toBe(null);
  });
});

describe('pSpeed', () => {
  it('0 km/h', () => {
    expect(pSpeed('41 0D 00')).toBe(0);
  });
  it('60 km/h', () => {
    expect(pSpeed('41 0D 3C')).toBe(60);
  });
  it('invalid', () => {
    expect(pSpeed('NO DATA')).toBe(null);
  });
});

describe('pCool', () => {
  it('90°C', () => {
    expect(pCool('41 05 82')).toBe(90);
  });
  it('-40°C', () => {
    expect(pCool('41 05 00')).toBe(-40);
  });
  it('invalid', () => {
    expect(pCool('NO DATA')).toBe(null);
  });
});
