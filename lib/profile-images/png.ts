export const MAX_IMAGE_BYTES=2097152;
function crc32(bytes:Uint8Array,start:number,end:number){let crc=0xffffffff;for(let i=start;i<end;i++){crc^=bytes[i];for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
export function validProfilePng(bytes:Uint8Array){
 if(bytes.length<45||bytes.length>MAX_IMAGE_BYTES)return false;
 if(![137,80,78,71,13,10,26,10].every((value,i)=>bytes[i]===value))return false;
 const data=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let offset=8,first=true,hasData=false;
 while(offset+12<=bytes.length){const length=data.getUint32(offset),end=offset+8+length;if(end+4>bytes.length)return false;const type=String.fromCharCode(...Array.from(bytes.slice(offset+4,offset+8)));
 if(crc32(bytes,offset+4,end)!==data.getUint32(end))return false;
 if(first){if(type!=='IHDR'||length!==13)return false;const width=data.getUint32(offset+8),height=data.getUint32(offset+12);if(!width||!height||width>512||height>512||bytes[offset+18]!==0||bytes[offset+19]!==0||bytes[offset+20]>1)return false;first=false;}
 else if(type==='IHDR')return false;
 if(type==='IDAT')hasData=true;if(type==='IEND')return length===0&&hasData&&end+4===bytes.length;offset=end+4;
 }return false;
}
