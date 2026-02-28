"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toJpeg } from "html-to-image";
import data from "../cohort-data.json";

// --- Icons ---
const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const Award = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
  </svg>
);

const GraduationCap = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

// --- Configuration ---
const ACCESS_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || "Athens2026"; 
const COHORT_LINKEDIN_GROUP = "https://www.linkedin.com/groups/13356087/";

const TEAM_CONFIG: Record<string, { courses: string[], weeks: number, presentations: number }> = {
  'Teams 1': { courses: ['Org Behavior', 'Leadership', 'Accounting', 'Legal', 'Finance'], weeks: 14, presentations: 4 },
  'Module 5': { courses: ['Residency', 'Negotiations', 'Service Ops', 'Sales Strategy', 'Ops Mgmt'], weeks: 12, presentations: 3 },
  'Teams 9 and 10': { courses: ['Corp Strategy', 'Innovation', 'Strategic Mgmt', 'Capstone'], weeks: 10, presentations: 5 }
};

const getTier = (rank: number) => {
  if (rank === 0) return { label: 'Strategic Partner', color: 'bg-amber-500 text-black shadow-amber-500/40' };
  if (rank === 1) return { label: 'Key Stakeholder', color: 'bg-[#BA0C2F] text-white shadow-red-500/40' };
  if (rank === 2) return { label: 'Core Associate', color: 'bg-zinc-700 text-zinc-100 shadow-zinc-500/40' };
  return { label: 'Peer', color: 'bg-zinc-800 text-zinc-300' };
};

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedId, setSelectedId] = useState("");
  
  const [meetingHours, setMeetingHours] = useState<Record<string, number>>({});
  const [studyHours, setStudyHours] = useState<Record<string, number>>({});
  const [lateNightHours, setLateNightHours] = useState<Record<string, number>>({});
  const [extraHours, setExtraHours] = useState<Record<string, number>>({});
  const [nzTo, setNzTo] = useState<Record<string, boolean>>({});
  const [nzBack, setNzBack] = useState<Record<string, boolean>>({});
  const shareCardRef = useRef<HTMLDivElement>(null);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ACCESS_PASSWORD) setIsAuthenticated(true);
  };

  const students = useMemo(() => 
    [...data.students].sort((a, b) => a.name.split(" ").pop()!.localeCompare(b.name.split(" ").pop()!))
  , []);

  const me = useMemo(() => data.students.find(s => s.id === selectedId), [selectedId]);

  const rankedPeers = useMemo(() => {
    if (!selectedId) return [];
    const teams = data.teams.filter(t => t.memberIds.includes(selectedId));
    const peerMap: Record<string, string[]> = {};
    teams.forEach(t => t.memberIds.forEach(mId => {
      if (mId !== selectedId) {
        if (!peerMap[mId]) peerMap[mId] = [];
        peerMap[mId].push(t.id);
      }
    }));

    return Object.entries(peerMap).map(([id, tIds]) => {
      const student = data.students.find(s => s.id === id)!;
      const teamTotal = tIds.reduce((sum, tid) => {
        const team = data.teams.find(t => t.id === tid);
        const weeks = TEAM_CONFIG[team?.term || ""]?.weeks || 1;
        const weekly = (meetingHours[tid] || 0) * weeks;
        const perTeamTotal = (studyHours[tid] || 0) + (lateNightHours[tid] || 0);
        return sum + weekly + perTeamTotal;
      }, 0);
      const total = teamTotal + (extraHours[id] || 0) + (nzTo[id] ? 13 : 0) + (nzBack[id] ? 13 : 0);
      return { ...student, totalHours: total };
    }).sort((a, b) => b.totalHours - a.totalHours);
  }, [selectedId, meetingHours, studyHours, lateNightHours, extraHours, nzTo, nzBack]);

  const networkInsights = useMemo(() => {
    if (rankedPeers.length === 0) return { percent: 0, list: [] };
    const uniqueCompanies = Array.from(new Set(rankedPeers.slice(0, 10).map(p => p.company)));
    return {
      percent: Math.min(Math.round((uniqueCompanies.length / 8) * 100), 100),
      list: uniqueCompanies.slice(0, 5)
    };
  }, [rankedPeers]);

  const funStat = useMemo(() => {
    if (!rankedPeers[0]) return null;
    const hours = rankedPeers[0].totalHours;
    const stats = [
      { text: `Harvest ${Math.floor(hours * 12)} rows of Lavender`, sub: "South Island style." },
      { text: `Eat ${Math.floor(hours * 2.1)} Bowls of Gusto`, sub: "Term 3 lunch of champions." },
      { text: `Enjoy ${Math.floor(hours / 4)} NZ Winery Dinners`, sub: "Capstone fuel." },
      { text: `Wait for the Terry coffee machine ${Math.floor((hours * 60) / 3.5)} times`, sub: "Longest 3.5 mins ever." },
      { text: `Eat ${Math.floor(hours / 0.75)} Bucket Shop lunches`, sub: "Athens survival 101." },
      { text: `Watch ${Math.floor(hours / 3.5)} UGA Football games`, sub: "Go Dawgs!" }
    ];
    const seed = selectedId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return stats[seed % stats.length];
  }, [rankedPeers, selectedId]);

  useEffect(() => {
    if (isAuthenticated && data.teams.length > 0) {
      const myT = data.teams.filter(t => t.memberIds.includes(selectedId));
      const init = (state: any, setState: any, val: number) => {
        const next = { ...state };
        let changed = false;
        myT.forEach(t => { if (next[t.id] === undefined) { next[t.id] = val; changed = true; } });
        if (changed) setState(next);
      };
      init(meetingHours, setMeetingHours, 2);
      init(studyHours, setStudyHours, 10);
      init(lateNightHours, setLateNightHours, 15);
    }
  }, [isAuthenticated, selectedId]);

  const handleDownload = async () => {
    if (!shareCardRef.current) return;
    try {
      const dataUrl = await toJpeg(shareCardRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        backgroundColor: '#09090b',
        skipFonts: true
      });
      const link = document.createElement('a');
      link.download = `${me?.name.replace(' ', '_')}_EMBA_Wrapped.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error(err); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-zinc-100 font-sans">
        <div className="w-full max-w-md bg-zinc-900 border border-white/5 p-10 rounded-[2.5rem] text-center shadow-2xl">
          <div className="w-16 h-16 bg-[#BA0C2F] rounded-2xl flex items-center justify-center mx-auto mb-6"><GraduationCap className="text-black w-10 h-10" /></div>
          <h1 className="text-2xl font-black mb-2 uppercase tracking-tighter">Cohort Access</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="password" placeholder="Password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-center text-white outline-none focus:ring-2 focus:ring-[#BA0C2F]" />
            <button type="submit" className="w-full bg-[#BA0C2F] text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs">Unlock Wrapped</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-[#BA0C2F]/30 pb-20">
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50 h-20 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#BA0C2F] rounded-xl flex items-center justify-center"><GraduationCap className="text-black w-6 h-6" /></div>
            <span className="text-xl font-bold italic tracking-tight">EMBA Wrapped '26</span>
          </div>
          <div className="flex items-center gap-4">
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#BA0C2F] outline-none">
              <option value="">Select Profile</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {me ? (
          <div className="space-y-16">
            <header className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center p-10 bg-zinc-900/40 rounded-[2.5rem] border border-white/5 relative shadow-2xl overflow-hidden">
              <div className="lg:col-span-2 flex items-center gap-8">
                <div className="w-32 h-32 rounded-full border-4 border-[#BA0C2F] overflow-hidden bg-zinc-800 shrink-0"><img src={`/photos/${selectedId}.png`} className="w-full h-full object-cover" /></div>
                <div><h1 className="text-5xl font-extrabold tracking-tighter leading-none mb-4 uppercase">Cheers, <br /><span className="text-[#BA0C2F]">{me.name}</span></h1><p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Terry College of Business</p></div>
              </div>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-end mb-2"><span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Network Reach</span><span className="text-[#BA0C2F] font-black text-2xl">{networkInsights.percent}%</span></div>
                <div className="flex flex-wrap gap-1 mb-4">{networkInsights.list.map(comp => <span key={comp} className="text-[8px] px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md uppercase font-black">{comp}</span>)}</div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${networkInsights.percent}%` }} className="h-full bg-[#BA0C2F]" /></div>
              </div>
            </header>

            <section className="space-y-8">
              <div className="flex items-center gap-3"><Award className="w-6 h-6 text-[#BA0C2F]" /><h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-400">Team Intensity</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.teams.filter(t => t.memberIds.includes(selectedId)).map(t => {
                  const config = TEAM_CONFIG[t.term];
                  const totalHrs = ((meetingHours[t.id] || 0) * (config?.weeks || 1)) + (studyHours[t.id] || 0) + (lateNightHours[t.id] || 0);
                  return (
                    <div key={t.id} className="bg-zinc-900/60 border border-zinc-800 p-8 rounded-3xl space-y-6 shadow-xl">
                      <div className="flex justify-between items-start"><h3 className="text-xl font-bold">{t.name}</h3><span className="bg-[#BA0C2F] text-white text-[10px] px-2 py-0.5 rounded font-black">{totalHrs} Total Hrs</span></div>
                      <div className="space-y-5 pt-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500"><span>Weekly Meetings</span><span className="text-[#BA0C2F]">{meetingHours[t.id] || 0} hr/wk</span></div>
                          <input type="range" min="0" max="15" step="1" value={meetingHours[t.id] || 0} onChange={e => setMeetingHours(prev => ({...prev, [t.id]: Number(e.target.value)}))} className="w-full accent-[#BA0C2F] cursor-pointer" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400"><span>Study (Total)</span><span className="text-white">{studyHours[t.id] || 0} hrs</span></div>
                          <input type="range" min="0" max="100" step="5" value={studyHours[t.id] || 0} onChange={e => setStudyHours(prev => ({...prev, [t.id]: Number(e.target.value)}))} className="w-full accent-zinc-500 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3"><Users className="w-6 h-6 text-[#BA0C2F]" /><h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-400">Shared Journey</h2></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {rankedPeers.map((p, idx) => (
                  <motion.div layout key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 pt-12 relative overflow-hidden">
                    <div className={`absolute top-3 right-3 px-2 py-0.5 text-[9px] font-black uppercase rounded ${getTier(idx).color}`}>{getTier(idx).label}</div>
                    <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#BA0C2F] bg-zinc-800"><img src={`/photos/${p.id}.png`} className="w-full h-full object-cover" /></div><div className="min-w-0"><h3 className="font-bold text-sm truncate pr-14 leading-tight">{p.name}</h3><p className="text-[#BA0C2F] font-black text-2xl">{p.totalHours}h</p></div></div>
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center"><span className="text-[10px] text-zinc-400 font-bold uppercase">Extra Time</span><input type="number" value={extraHours[p.id] || 0} onChange={e => setExtraHours(prev => ({...prev, [p.id]: Number(e.target.value)}))} className="w-10 bg-black border border-zinc-800 rounded px-1 text-center py-0.5 text-xs text-white" /></div>
                      <div className="flex gap-2"><label className="flex items-center gap-1.5 cursor-pointer text-[9px] text-zinc-500"><input type="checkbox" checked={nzTo[p.id] || false} onChange={e => setNzTo(prev => ({...prev, [p.id]: e.target.checked}))} className="accent-[#BA0C2F]" /> To NZ</label><label className="flex items-center gap-1.5 cursor-pointer text-[9px] text-zinc-500"><input type="checkbox" checked={nzBack[p.id] || false} onChange={e => setNzBack(prev => ({...prev, [p.id]: e.target.checked}))} className="accent-[#BA0C2F]" /> Back</label></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="py-20 flex flex-col items-center border-t border-white/5">
              <div ref={shareCardRef} className="w-[500px] h-[500px] bg-zinc-950 border-[8px] border-[#BA0C2F] p-10 text-center relative shadow-2xl flex flex-col justify-between items-center" style={{ fontFamily: 'system-ui, sans-serif' }}>
                <div>
                  <div className="w-20 h-20 rounded-full border-2 border-[#BA0C2F] mx-auto mb-4 overflow-hidden bg-zinc-800"><img src={`/photos/${selectedId}.png`} className="w-full h-full object-cover" /></div>
                  <h2 className="text-3xl font-black mb-1 leading-tight text-white uppercase tracking-tighter">{me.name}</h2>
                  <p className="text-[#BA0C2F] text-[10px] font-black tracking-[0.4em] uppercase mb-8">EMBA '26 Network Wrapped</p>
                </div>
                <div className="w-full space-y-4 text-left">
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2">Top Strategic Partners</p>
                  {rankedPeers.slice(0, 3).map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center">
                      <div><p className="font-bold text-sm leading-none mb-1 text-white">#{i+1} {p.name}</p><p className="text-[10px] text-zinc-500">{p.totalHours} Shared Hours</p></div>
                      <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${getTier(i).color}`}>{getTier(i).label}</span>
                    </div>
                  ))}
                </div>
                <div className="w-full">
                  {funStat && <div className="bg-zinc-900/50 p-4 rounded-xl border border-[#BA0C2F]/20 mb-6"><p className="text-white font-bold text-xs leading-tight tracking-tight uppercase">{funStat.text}</p><p className="text-[9px] text-zinc-500 italic mt-1 font-medium">{funStat.sub}</p></div>}
                  <div className="flex justify-between items-end text-left border-t border-white/5 pt-4"><div><p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter mb-1">Network Reach</p><p className="text-[#BA0C2F] font-black text-xs italic">{networkInsights.list[0]}, {networkInsights.list[1]}...</p></div><p className="text-[9px] text-zinc-800 font-black tracking-[0.3em] uppercase">UGA TERRY</p></div>
                </div>
              </div>
              <button onClick={handleDownload} className="mt-12 px-10 py-4 bg-[#BA0C2F] text-white font-black rounded-full shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-xs">DOWNLOAD MY EMBA WRAPPED</button>
            </section>
          </div>
        ) : (
          <div className="text-center py-32 text-zinc-500 uppercase font-black tracking-[0.2em]">Select your profile to begin</div>
        )}
      </main>
    </div>
  );
}