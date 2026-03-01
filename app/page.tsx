"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toJpeg } from "html-to-image";
import data from "../cohort-data.json";

// --- Icons ---
const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const Award = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
);
const GraduationCap = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
);

// --- Configuration ---
const COHORT_LINKEDIN_GROUP = "https://www.linkedin.com/groups/13356087/";
const TEAM_CONFIG: Record<string, { courses: string[], weeks: number }> = {
  'Teams 1': { courses: ['Org Behavior', 'Leadership', 'Accounting', 'Legal', 'Finance'], weeks: 14 },
  'Module 5': { courses: ['Residency', 'Negotiations', 'Service Ops', 'Sales Strategy', 'Ops Mgmt'], weeks: 12 },
  'Teams 9 and 10': { courses: ['Corp Strategy', 'Innovation', 'Strategic Mgmt', 'Capstone'], weeks: 10 }
};

const getTier = (rank: number) => {
  if (rank === 0) return { label: 'Strategic Partner', color: 'bg-amber-500 text-black shadow-amber-500/40' };
  if (rank === 1) return { label: 'Key Stakeholder', color: 'bg-[#BA0C2F] text-white shadow-red-500/40' };
  if (rank === 2) return { label: 'Core Associate', color: 'bg-zinc-700 text-zinc-100 shadow-zinc-500/40' };
  return { label: 'Peer', color: 'bg-zinc-800 text-zinc-300' };
};

export default function Page() {
  const [selectedId, setSelectedId] = useState("");
  const [meetingHours, setMeetingHours] = useState<Record<string, number>>({});
  const [lateNightHours, setLateNightHours] = useState<Record<string, number>>({});
  const [extraHours, setExtraHours] = useState<Record<string, number>>({});
  const [nzTo, setNzTo] = useState<Record<string, boolean>>({});
  const [nzBack, setNzBack] = useState<Record<string, boolean>>({});
  const shareCardRef = useRef<HTMLDivElement>(null);

  const students = useMemo(() => [...data.students].sort((a, b) => a.name.split(" ").pop()!.localeCompare(b.name.split(" ").pop()!)), []);
  const me = useMemo(() => data.students.find(s => s.id === selectedId), [selectedId]);

  const rankedPeers = useMemo(() => {
    if (!selectedId) return [];
    const myTeams = data.teams.filter(t => t.memberIds.includes(selectedId));
    const peerMap: Record<string, number> = {};
    
    myTeams.forEach(t => {
      const weeks = TEAM_CONFIG[t.term]?.weeks || 12;
      const baseProximityHours = weeks * 1; 
      const totalSessionTime = ((meetingHours[t.id] || 0) * weeks) + (lateNightHours[t.id] || 0) + baseProximityHours;
      t.memberIds.forEach(mId => {
        if (mId !== selectedId) {
          peerMap[mId] = (peerMap[mId] || 0) + totalSessionTime;
        }
      });
    });

    return Object.entries(peerMap).map(([id, hrs]) => {
      const student = data.students.find(s => s.id === id)!;
      const travelHrs = (nzTo[id] ? 13 : 0) + (nzBack[id] ? 13 : 0);
      const finalHours = hrs + (extraHours[id] || 0) + travelHrs;
      return { ...student, totalHours: finalHours };
    }).sort((a, b) => b.totalHours - a.totalHours);
  }, [selectedId, meetingHours, lateNightHours, extraHours, nzTo, nzBack]);

  const networkInsights = useMemo(() => {
    if (rankedPeers.length === 0) return { list: [] };
    const uniqueCompanies = Array.from(new Set(rankedPeers.slice(0, 10).map(p => p.company)));
    return { list: uniqueCompanies.slice(0, 5) };
  }, [rankedPeers]);

  const funStat = useMemo(() => {
    if (!rankedPeers[0]) return null;
    const hours = rankedPeers[0].totalHours;
    const stats = [
      { text: `Harvest ${Math.floor(hours * 12)} rows of Lavender`, sub: "South Island Style." },
      { text: `Eat ${Math.floor(hours * 2.1)} bowls of Gusto`, sub: "...but no snacks." },
      { text: `Enjoy ${Math.floor(hours / 4)} NZ Winery Dinners`, sub: "Pairs well with spreadsheet stress." },
      { text: `Wait for the Terry coffee machine ${Math.floor((hours * 60) / 3.5)} times`, sub: "The longest 3 minutes of the degree." },
      { text: `Endure ${Math.floor(hours / 14.5)} ATL-to-AKL flights`, sub: "Where are my bags?" },
      { text: `Build ${Math.floor(hours / 2.5)} 60-slide PowerPoint decks`, sub: "AI did what?" },
      { text: `Sit in ${Math.floor(hours * 0.8)} hours of ATL Traffic`, sub: "Buckhead commuting reality." },
      { text: `Search for your favorite parking in the Terry Garage ${Math.floor(hours * 1.5)} times`, sub: "Where is my parking badge?" },
      { text: `Wait for the Plane Train at ATL ${Math.floor(hours * 12)} times`, sub: "Please move to the center of the car." },
      { text: `Endure ${Math.floor(hours / 2)} TSA PreCheck lines`, sub: "Still faster than the Coffee Machine." },
      { text: `DoorDash ${Math.floor(hours * 1.1)} Starbucks Coffees`, sub: "Fueled by caffeine and spreadsheets." },
      { text: `Maps ${Math.floor(hours * 4)} Peachtree Road detours`, sub: "Atlanta's favorite pastime." },
      { text: `Read ${Math.floor(hours / 1.2)} HBR Case Studies`, sub: "Executive presence on the go." },
      { text: `Explain your schedule to friends ${Math.floor(hours / 5)} times`, sub: "No, I can't come this weekend." },
      { text: `Watch ${Math.floor(hours / 3.5)} UGA Football games`, sub: "From a Buckhead watch party." },
      { text: `Spot ${Math.floor(hours * 45)} sheep in New Zealand`, sub: "If you made the bus..." }
    ];
    const seed = Math.floor(hours * 10);
    return stats[seed % stats.length];
  }, [rankedPeers]);

  useEffect(() => {
    if (selectedId) {
      setMeetingHours({});
      setLateNightHours({});
    }
  }, [selectedId]);

  const handleDownload = async () => {
    if (!shareCardRef.current) return;
    const dataUrl = await toJpeg(shareCardRef.current, { quality: 1, pixelRatio: 2, backgroundColor: '#09090b', skipFonts: true });
    const link = document.createElement('a');
    link.download = `${me?.name.replace(' ', '_')}_EMBA_Wrapped.jpg`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-[#BA0C2F]/30 pb-20">
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50 h-20 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#BA0C2F] rounded-xl flex items-center justify-center shadow-lg"><GraduationCap className="text-black w-6 h-6" /></div>
            <span className="text-xl font-bold italic tracking-tight uppercase">EMBA Wrapped</span>
          </div>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#BA0C2F] outline-none">
            <option value="">Select Profile</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {me ? (
          <div className="space-y-12">
            <header className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center p-10 bg-zinc-900/40 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative">
                <div className="lg:col-span-2 flex items-center gap-8">
                  <div className="w-32 h-32 rounded-full border-4 border-[#BA0C2F] overflow-hidden bg-zinc-800 shrink-0 shadow-2xl"><img src={`/photos/${selectedId}.png`} className="w-full h-full object-cover" /></div>
                  <div>
                    <h1 className="text-5xl font-extrabold tracking-tighter leading-none mb-4 uppercase text-white">Cheers, <br /><span className="text-[#BA0C2F]">{me.name}</span></h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Terry College of Business</p>
                  </div>
                </div>
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                  <div className="mb-3"><span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Top Network Connections</span></div>
                  <div className="flex flex-wrap gap-2">{networkInsights.list.map(comp => <span key={comp} className="text-[8px] px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg uppercase font-black border border-white/5">{comp}</span>)}</div>
                </div>
              </div>

              <section className="max-w-3xl space-y-4 text-left border-l-2 border-[#BA0C2F] pl-8 py-2">
                <h2 className="text-[#BA0C2F] text-[10px] font-black uppercase tracking-[0.4em]">Strategic Network Audit</h2>
                <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                  While the degree measures academic mastery, <span className="text-white font-bold italic">EMBA Wrapped</span> measures your <span className="text-white font-bold italic">Relational Capital</span>. 
                  Adjust intensity sliders to visualize the shared journey and strategic partnerships that define your UGA Terry experience.
                </p>
              </section>
            </header>

            <section className="space-y-8 pt-4">
              <div className="flex items-center gap-3"><Award className="w-6 h-6 text-[#BA0C2F]" /><h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-400">Team Intensity Settings</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.teams.filter(t => t.memberIds.includes(selectedId)).map(t => (
                  <div key={t.id} className="bg-zinc-900/60 border border-zinc-800 p-8 rounded-3xl space-y-6 shadow-xl">
                    <div className="flex justify-between items-start"><h3 className="text-xl font-bold">{t.name}</h3><span className="bg-[#BA0C2F] text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">{t.term}</span></div>
                    <div className="flex flex-wrap gap-1.5">{TEAM_CONFIG[t.term]?.courses.map(c => <span key={c} className="text-[9px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700 font-bold">{c}</span>)}</div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500"><span>Weekly Meetings</span><span className="text-[#BA0C2F]">{meetingHours[t.id] || 0} hr/wk</span></div>
                        <input type="range" min="0" max="15" value={meetingHours[t.id] || 0} onChange={e => setMeetingHours(prev => ({...prev, [t.id]: Number(e.target.value)}))} className="w-full accent-[#BA0C2F]" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400"><span>Late Night Grinds</span><span className="text-white">{lateNightHours[t.id] || 0} hrs</span></div>
                        <input type="range" min="0" max="50" value={lateNightHours[t.id] || 0} onChange={e => setLateNightHours(prev => ({...prev, [t.id]: Number(e.target.value)}))} className="w-full accent-zinc-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3"><Users className="w-6 h-6 text-[#BA0C2F]" /><h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-400">Shared Journey</h2></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {rankedPeers.slice(0, 12).map((p, idx) => (
                  <motion.div layout key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 pt-12 relative overflow-hidden group">
                    <div className={`absolute top-3 right-3 px-2 py-0.5 text-[9px] font-black uppercase rounded ${getTier(idx).color}`}>{getTier(idx).label}</div>
                    <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#BA0C2F] bg-zinc-800 shrink-0 shadow-md"><img src={`/photos/${p.id}.png`} className="w-full h-full object-cover" /></div><div className="min-w-0"><h3 className="font-bold text-sm truncate pr-14 leading-tight">{p.name}</h3><p className="text-[#BA0C2F] font-black text-2xl">{p.totalHours}h</p></div></div>
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center"><span className="text-[10px] text-zinc-400 font-bold uppercase">Extra Time</span><input type="number" value={extraHours[p.id] || 0} onChange={e => setExtraHours(prev => ({...prev, [p.id]: Number(e.target.value)}))} className="w-10 bg-black border border-zinc-800 rounded px-1 text-xs text-white text-center" /></div>
                      <div className="flex gap-2"><label className="flex items-center gap-1 text-[9px] text-zinc-500"><input type="checkbox" checked={nzTo[p.id] || false} onChange={e => setNzTo(prev => ({...prev, [p.id]: e.target.checked}))} className="accent-[#BA0C2F]" /> To NZ</label><label className="flex items-center gap-1 text-[9px] text-zinc-500"><input type="checkbox" checked={nzBack[p.id] || false} onChange={e => setNzBack(prev => ({...prev, [p.id]: e.target.checked}))} className="accent-[#BA0C2F]" /> Back</label></div>
                      <a href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(p.name + " UGA")}`} target="_blank" className="flex items-center justify-center gap-2 w-full py-2 bg-[#0077b5]/10 text-[#0077b5] text-[9px] font-black uppercase rounded-lg border border-[#0077b5]/30">Connect</a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="py-20 flex flex-col items-center border-t border-white/5">
              <div ref={shareCardRef} className="w-[500px] h-[500px] bg-zinc-950 border-[8px] border-[#BA0C2F] p-8 text-center relative shadow-2xl flex flex-col justify-between items-center overflow-hidden" style={{ fontFamily: 'system-ui, sans-serif' }}>
                <div>
                  <div className="w-16 h-16 rounded-full border-2 border-[#BA0C2F] mx-auto mb-3 overflow-hidden bg-zinc-800 shadow-lg"><img src={`/photos/${selectedId}.png`} className="w-full h-full object-cover" /></div>
                  <h2 className="text-3xl font-black mb-0.5 leading-tight text-white uppercase tracking-tighter">{me.name}</h2>
                  <p className="text-[#BA0C2F] text-[9px] font-black tracking-[0.4em] uppercase mb-4">EMBA '26 Network Wrapped</p>
                </div>
                <div className="w-full space-y-3 text-left">
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] border-b border-white/10 pb-1.5">Top Strategic Partners</p>
                  {rankedPeers.slice(0, 3).map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center">
                      <div><p className="font-bold text-sm leading-none mb-0.5 text-white">#{i+1} {p.name}</p><p className="text-[9px] text-zinc-500">{p.totalHours} Shared Hours</p></div>
                      <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${getTier(i).color}`}>{getTier(i).label}</span>
                    </div>
                  ))}
                </div>
                <div className="w-full mt-4">
                  {funStat && (
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-[#BA0C2F]/20 mb-4">
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-1 leading-none">In this time you could have...</p>
                      <p className="text-white font-bold text-[11px] leading-tight tracking-tight uppercase">{funStat.text}</p>
                      <p className="text-[8px] text-zinc-500 italic mt-1 font-medium">{funStat.sub}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-end text-left border-t border-white/5 pt-3">
                    <div className="flex-1 min-w-0"><p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter mb-1 leading-none">Top Network Companies</p><p className="text-[#BA0C2F] font-black text-[10px] italic truncate pr-4">{networkInsights.list.slice(0, 3).join(", ")}{networkInsights.list.length > 3 ? "..." : ""}</p></div>
                    <p className="text-[9px] text-zinc-800 font-black tracking-[0.3em] uppercase shrink-0">UGA TERRY</p>
                  </div>
                </div>
              </div>
              <button onClick={handleDownload} className="mt-12 px-10 py-4 bg-[#BA0C2F] text-white font-black rounded-full shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-xs">Download My Wrapped</button>
            </section>
          </div>
        ) : (
          <div className="text-center py-40 text-zinc-700 font-black uppercase tracking-widest animate-pulse italic text-sm">Select Profile to Review Your Strategic Journey</div>
        )}
      </main>
    </div>
  );
}