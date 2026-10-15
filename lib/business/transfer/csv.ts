// RFC 4180 quoting, bounded inputs, and spreadsheet formula-safe exports.
export function parseCsv(text:string):string[][]{
 if(new TextEncoder().encode(text).length>500000)throw new Error('CSV must be smaller than 500 KB.');
 text=text.replace(/^\uFEFF/,'');const rows:string[][]=[];let row:string[]=[],cell='',quoted=false,closed=false;
 function field(){row.push(cell);cell='';closed=false;}function finish(){field();if(row.some(v=>v!==''))rows.push(row);row=[];if(rows.length>101)throw new Error('Import at most 100 records at once.');}
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;}else if(c===','){field();}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;finish();}else if(c==='"'){if(cell||closed)throw new Error('Invalid CSV quoting.');quoted=true;}else{if(closed)throw new Error('Unexpected text after a quoted field.');cell+=c;}if(cell.length>16000||row.length>60)throw new Error('CSV field or column limit exceeded.');}
 if(quoted)throw new Error('Unclosed CSV quote.');if(cell||row.length||closed)finish();if(!rows.length)throw new Error('CSV is empty.');if(rows[0].some(h=>!h.trim())||new Set(rows[0]).size!==rows[0].length)throw new Error('Headers must be nonempty and unique.');if(rows.some(r=>r.length!==rows[0].length))throw new Error('Every row must have the same number of columns.');return rows;
}
export function writeCsv(rows:unknown[][]){return '\uFEFF'+rows.map(row=>row.map(value=>{let text=String(value??'');if(/^[\s]*[=+\-@]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}).join(',')).join('\r\n')+'\r\n';}
