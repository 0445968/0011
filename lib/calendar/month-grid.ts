export type CalendarMonthCell={date:string;inMonth:boolean};

/** Monday-first month rows, including adjacent dates needed to complete the week. */
export function calendarMonthCells(month:string):CalendarMonthCell[] {
  if(!/^\d{4}-\d{2}$/.test(month))throw new Error('Invalid calendar month.');
  const [year,monthNumber]=month.split('-').map(Number);
  const first=new Date(Date.UTC(year,monthNumber-1,1,12));
  if(first.getUTCFullYear()!==year||first.getUTCMonth()!==monthNumber-1)throw new Error('Invalid calendar month.');
  const days=new Date(Date.UTC(year,monthNumber,0,12)).getUTCDate();
  const leading=(first.getUTCDay()+6)%7;
  const count=Math.ceil((leading+days)/7)*7;
  const start=new Date(Date.UTC(year,monthNumber-1,1-leading,12));
  return Array.from({length:count},(_,index)=>{
    const day=new Date(start);day.setUTCDate(start.getUTCDate()+index);
    const date=day.toISOString().slice(0,10);
    return {date,inMonth:date.slice(0,7)===month};
  });
}
