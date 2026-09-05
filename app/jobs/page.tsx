import Link from "next/link";

const jobs=[
{title:"Performance Marketing Specialist",company:"شركة تقنية",location:"القاهرة، مصر",type:"Full-time",field:"Marketing"},
{title:"Account Manager",company:"شركة خدمات رقمية",location:"الرياض، السعودية",type:"Full-time",field:"Sales"},
{title:"Senior Graphic Designer",company:"وكالة إبداعية",location:"دبي، الإمارات",type:"Full-time",field:"Design"},
{title:"Frontend Developer",company:"منتج SaaS",location:"Remote",type:"Remote",field:"Technology"},
{title:"Customer Success Specialist",company:"شركة برمجيات",location:"القاهرة، مصر",type:"Hybrid",field:"Customer Success"},
{title:"Business Development Executive",company:"شركة نمو",location:"الدوحة، قطر",type:"Full-time",field:"Sales"},
];
export default function Jobs(){return <main><nav className="nav shell"><Link href="/" className="brand"><span className="brandDot"/>Jobalak</Link><span className="navBadge">Jobs</span></nav><section className="pageHero shell"><span className="sectionKicker">فرص مختارة</span><h1>اكتشف شكل الفرص اللي بندور عليها.</h1><p>الصفحة دي بتعرض نموذج للوظائف حسب المنطقة والتخصص. المطابقة الفعلية بتكون مخصصة حسب الـCV والدول اللي تختارها.</p></section><div className="jobsToolbar shell"><span>مصر</span><span>الخليج</span><span>Remote</span><span>Marketing</span><span>Sales</span><span>Technology</span></div><section className="jobsGrid shell">{jobs.map((job)=><article className="jobCard" key={job.title}><span className="sectionKicker">{job.field}</span><h2>{job.title}</h2><p>{job.company}</p><div className="jobMeta"><span>{job.location}</span><span>{job.type}</span></div><p>مثال توضيحي لشكل الفرص التي يمكن أن تظهر في نتائج Jobalak.</p></article>)}</section></main>}
