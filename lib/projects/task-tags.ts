export const taskTagColors={
  gray:{label:'Gray',className:'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'},
  blue:{label:'Blue',className:'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'},
  purple:{label:'Purple',className:'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200'},
  green:{label:'Green',className:'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'},
  yellow:{label:'Yellow',className:'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'},
  orange:{label:'Orange',className:'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200'},
  red:{label:'Red',className:'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'},
  pink:{label:'Pink',className:'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200'},
  cyan:{label:'Cyan',className:'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200'},
} as const;
export type TaskTagColor=keyof typeof taskTagColors;
export type ProjectTaskTag={tag_key:string;label:string;color:TaskTagColor};
