"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toJpeg } from "html-to-image";
import data from "../cohort-data.json";

// Environment Variable for Password
const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD;

const TEAM_CONFIG: Record<string, { courses: string[], weeks: number }> = {
  'Teams 1': { courses: ['Org Behavior', 'Leadership', 'Accounting'], weeks: 14 },
  'Module 5': { courses: ['Residency', 'Negotiations', 'Service Ops'], weeks: 12 },
  'Teams 9 and 10': { courses: ['Corp Strategy', 'Innovation', 'Capstone'], weeks: 10 }
};

const getTier = (rank: number) => {
  if (rank === 0) return { label: 'Strategic Partner', color: 'bg-amber-500 text-black' };
  if (rank === 1) return { label: 'Key Stakeholder', color: 'bg-red-600 text-white' };
  return { label: 'Core Associate', color: 'bg-zinc-700 text-white' };
};

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [meetingHours, setMeetingHours] = useState<Record<string, number>>({});
  const [studyHours, setStudyHours] = useState<Record<string, number>>({});
  const [extraHours, setExtraHours] = useState<Record<string, number>>({});
  const shareCardRef = useRef<HTMLDivElement>(null);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) setIsAuthenticated(true);
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
        return sum + ((meetingHours[tid] || 0) * weeks) + (studyHours[tid] || 0);
      }, 0);
      return { ...student, totalHours: teamTotal + (extraHours[id] || 0) };
    }).sort((a, b) => b.totalHours - a.totalHours);
  }, [selectedId, meetingHours, studyHours, extraHours]);

  const handleDownload = async () => {
    if (!shareCardRef.current) return;
    const dataUrl = await toJpeg(shareCardRef.current, { quality: 1, pixelRatio: 2, backgroundColor: '#09090b', skipFonts: true });
    const link = document.createElement('a');
    link.download = `${me?.name.replace(' ', '_')}_EMBA_Wrapped.jpg`;
    link.href = dataUrl;
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-zinc-100">
        <form onSubmit={handleAuth} className="w-full max-w-md bg-zinc-900 p-10 rounded-[2.5rem] border border-white/5 text-center">
          <h1 className="text-2xl font-black mb-6 uppercase tracking-widest">Cohort Access</h1>
          <input type="password" placeholder="Enter Password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 mb-4 text-center text-white outline-none focus:ring-2 focus:ring-red-600" />
          <button type="submit" className="w-full bg-red-600 text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs">Unlock Wrapped</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white">
          <option value="">Select Your Profile</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {me && (
          <div className="flex flex-col items-center gap-12">
            <div ref={shareCardRef} className="w-[500px] h-[500px] bg-zinc-950 border-[8px] border-red-600 p-10 flex flex-col justify-between items-center text-center shadow-2xl" style={{ fontFamily: 'sans-serif' }}>
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white">{me.name}</h2>
                <p className="text-red-600 text-xs font-black tracking-[0.4em] uppercase">EMBA '26 Wrapped</p>
              </div>
              <div className="w-full space-y-4 text-left">
                {rankedPeers.slice(0, 3).map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-white">#{i+1} {p.name}</p>
                      <p className="text-[10px] text-zinc-500">{p.totalHours} Shared Hours</p>
                    </div>
                    <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${getTier(i).color}`}>{getTier(i).label}</span>
                  </div>
                ))}
              </div>
              <div className="w-full pt-4 border-t border-white/10 flex justify-between items-end">
                <p className="text-[10px] text-red-600 font-black uppercase">UGA Terry College</p>
                <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">EMBA 2026</p>
              </div>
            </div>
            <button onClick={handleDownload} className="px-12 py-4 bg-red-600 text-white font-black rounded-full uppercase tracking-widest text-sm hover:scale-105 transition-all">Download My EMBA Wrapped</button>
          </div>
        )}
      </div>
    </div>
  );
}