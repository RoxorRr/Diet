import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  Calendar,
  Search,
  CheckCircle,
  FileText,
  X,
  TrendingDown,
  TrendingUp,
  Award,
  Edit2,
  Ruler,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { UserProfile, WeightEntry, WeightUnit } from '../types';
import { formatWeight, kgToLbs, lbsToKg, calculateBMI, cmToFeetInches } from '../utils/nutrition';
import { getTodayDateString } from '../utils/storage';

interface WeightTrackerViewProps {
  userProfile: UserProfile;
  weightEntries: WeightEntry[];
  onAddWeightEntry: (entry: WeightEntry) => void;
  onDeleteWeightEntry: (id: string) => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onOpenProfile?: () => void;
}

export const WeightTrackerView: React.FC<WeightTrackerViewProps> = ({
  userProfile,
  weightEntries,
  onAddWeightEntry,
  onDeleteWeightEntry,
  onUpdateProfile,
  onOpenProfile,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditStartHeightModal, setShowEditStartHeightModal] = useState(false);

  const [inputDate, setInputDate] = useState(getTodayDateString());
  const [inputWeight, setInputWeight] = useState<string>('');
  const [inputNotes, setInputNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Start Weight & Height Edit Modal States
  const unit = userProfile.unit;
  const [editStartWeightVal, setEditStartWeightVal] = useState<string>(
    unit === 'lbs' ? kgToLbs(userProfile.startWeightKg).toString() : userProfile.startWeightKg.toString()
  );
  const [editHeightCmVal, setEditHeightCmVal] = useState<number>(userProfile.heightCm);

  const sortedEntries = [...weightEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const latestEntry = sortedEntries[sortedEntries.length - 1];
  const currentKg = latestEntry ? latestEntry.weightKg : userProfile.currentWeightKg;
  const startKg = userProfile.startWeightKg;
  const targetKg = userProfile.targetWeightKg;

  const totalDiffKg = currentKg - startKg;

  const handleSaveStartWeightAndHeight = (e: React.FormEvent) => {
    e.preventDefault();
    const rawStart = parseFloat(editStartWeightVal);
    if (isNaN(rawStart) || rawStart <= 0) return;

    const startKgNew = unit === 'lbs' ? lbsToKg(rawStart) : rawStart;
    const heightCmNew = editHeightCmVal > 0 ? editHeightCmVal : userProfile.heightCm;

    if (onUpdateProfile) {
      onUpdateProfile({
        ...userProfile,
        startWeightKg: startKgNew,
        heightCm: heightCmNew,
      });
    }

    setShowEditStartHeightModal(false);
  };
  const targetDiffKg = targetKg - currentKg;

  // Chart data in active unit
  const chartData = sortedEntries.map((e) => ({
    id: e.id,
    date: e.date,
    displayDate: e.date.substring(5),
    weight: unit === 'lbs' ? kgToLbs(e.weightKg) : e.weightKg,
    rawKg: e.weightKg,
  }));

  const targetDisplayVal = unit === 'lbs' ? kgToLbs(targetKg) : targetKg;

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputWeight);
    if (isNaN(val) || val <= 0) return;

    const kgVal = unit === 'lbs' ? lbsToKg(val) : val;

    onAddWeightEntry({
      id: `w_${Date.now()}`,
      date: inputDate,
      weightKg: kgVal,
      notes: inputNotes.trim() || undefined,
    });

    setShowAddModal(false);
    setInputWeight('');
    setInputNotes('');
  };

  // Filter entries for table
  const filteredEntries = sortedEntries
    .filter(
      (e) =>
        e.date.includes(searchTerm) ||
        (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .reverse(); // most recent first

  const bmiInfo = calculateBMI(currentKg, userProfile.heightCm);

  return (
    <div className="space-y-8 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#FFFFFF] p-8 border border-[#1A1A1A]/10 shadow-sm">
        <div>
          <div className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">CHRONOLOGICAL RECORD</div>
          <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#1A1A1A] mt-1">
            Daily Weight Archive
          </h2>
          <p className="text-xs font-serif text-[#1A1A1A]/60 mt-1">
            Record morning weigh-ins to trace progress towards target of {formatWeight(targetKg, unit)}.
          </p>
        </div>

        <button
          onClick={() => {
            setInputWeight(
              latestEntry
                ? (unit === 'lbs' ? kgToLbs(latestEntry.weightKg) : latestEntry.weightKg).toString()
                : ''
            );
            setShowAddModal(true);
          }}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black font-sans text-xs uppercase tracking-widest font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Weight Entry</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
        {/* Start Weight with Quick Edit */}
        <div className="bg-[#FFFFFF] p-5 border border-[#1A1A1A]/10 shadow-sm relative group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/50">Start Weight</span>
            <button
              onClick={() => {
                setEditStartWeightVal(unit === 'lbs' ? kgToLbs(userProfile.startWeightKg).toString() : userProfile.startWeightKg.toString());
                setEditHeightCmVal(userProfile.heightCm);
                setShowEditStartHeightModal(true);
              }}
              className="p-1 text-[#1A1A1A]/40 hover:text-[#1A1A1A] hover:bg-[#F8F5F2] border border-transparent hover:border-[#1A1A1A]/20 transition"
              title="Edit Start Weight & Height"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-serif font-light text-[#1A1A1A] mt-1">
            {formatWeight(startKg, unit)}
          </div>
          <button
            onClick={() => {
              setEditStartWeightVal(unit === 'lbs' ? kgToLbs(userProfile.startWeightKg).toString() : userProfile.startWeightKg.toString());
              setEditHeightCmVal(userProfile.heightCm);
              setShowEditStartHeightModal(true);
            }}
            className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 hover:text-[#1A1A1A] underline mt-1 block"
          >
            Edit Start Weight
          </button>
        </div>

        {/* Height with Quick Edit */}
        <div className="bg-[#FFFFFF] p-5 border border-[#1A1A1A]/10 shadow-sm relative group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/50">Height</span>
            <button
              onClick={() => {
                setEditStartWeightVal(unit === 'lbs' ? kgToLbs(userProfile.startWeightKg).toString() : userProfile.startWeightKg.toString());
                setEditHeightCmVal(userProfile.heightCm);
                setShowEditStartHeightModal(true);
              }}
              className="p-1 text-[#1A1A1A]/40 hover:text-[#1A1A1A] hover:bg-[#F8F5F2] border border-transparent hover:border-[#1A1A1A]/20 transition"
              title="Edit Height"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-serif font-light text-[#1A1A1A] mt-1">
            {userProfile.heightCm} <span className="text-xs font-sans font-normal text-[#1A1A1A]/50">cm</span>
          </div>
          <div className="text-[10px] font-serif italic text-[#1A1A1A]/60 mt-1 flex items-center justify-between">
            <span>{cmToFeetInches(userProfile.heightCm)}</span>
            <button
              onClick={() => {
                setEditStartWeightVal(unit === 'lbs' ? kgToLbs(userProfile.startWeightKg).toString() : userProfile.startWeightKg.toString());
                setEditHeightCmVal(userProfile.heightCm);
                setShowEditStartHeightModal(true);
              }}
              className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/50 hover:text-[#1A1A1A] underline"
            >
              Edit Height
            </button>
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 border border-[#1A1A1A]/10 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/50">Current Weight</div>
          <div className="text-2xl font-serif font-light text-emerald-800 mt-1">
            {formatWeight(currentKg, unit)}
          </div>
          <div className="text-[10px] text-[#1A1A1A]/50 font-sans mt-1">
            Target: {formatWeight(targetKg, unit)}
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 border border-[#1A1A1A]/10 shadow-sm">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/50">Total Net Delta</div>
          <div className="text-2xl font-serif font-light text-[#1A1A1A] mt-1 flex items-center gap-1">
            {totalDiffKg <= 0 ? <TrendingDown className="w-4 h-4 text-emerald-800" /> : <TrendingUp className="w-4 h-4 text-amber-800" />}
            {Math.abs(unit === 'lbs' ? kgToLbs(Math.abs(totalDiffKg)) : totalDiffKg).toFixed(1)} {unit}
          </div>
          <div className="text-[10px] text-[#1A1A1A]/50 font-sans mt-1">
            {totalDiffKg <= 0 ? 'Weight loss achieved' : 'Gain tracked'}
          </div>
        </div>
      </div>

      {/* Interactive Weight Chart */}
      <div className="bg-[#FFFFFF] p-8 border border-[#1A1A1A]/10 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1A1A1A]/10">
          <div>
            <div className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">VISUAL TRAJECTORY</div>
            <h3 className="text-xl font-serif font-light text-[#1A1A1A] mt-0.5">
              Progress Curve ({unit.toUpperCase()})
            </h3>
          </div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/50">
            Target = {targetDisplayVal} {unit}
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="displayDate" stroke="#1A1A1A" opacity={0.4} fontSize={11} tickLine={false} />
              <YAxis stroke="#1A1A1A" opacity={0.4} fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', color: '#F8F5F2', borderRadius: '0px' }}
                labelStyle={{ color: '#F8F5F2', opacity: 0.6, fontSize: '10px', textTransform: 'uppercase' }}
                formatter={(val: any) => [`${val} ${unit}`, 'Weight']}
              />
              <ReferenceLine y={targetDisplayVal} stroke="#1A1A1A" strokeDasharray="3 3" opacity={0.5} />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#1A1A1A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#weightChartGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#1A1A1A]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#1A1A1A]/50">ARCHIVE LOGS</div>
            <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Logged Entries</h3>
          </div>

          <div className="relative font-sans">
            <Search className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search date or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/15 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A] w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#F8F5F2] text-[#1A1A1A]/60 uppercase text-[9px] tracking-[0.2em] font-bold border-b border-[#1A1A1A]/10">
              <tr>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Weight ({unit.toUpperCase()})</th>
                <th className="py-4 px-6">BMI Classification</th>
                <th className="py-4 px-6">Notes</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10 text-[#1A1A1A]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#1A1A1A]/50 font-serif italic">
                    No weight entries match search query.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const entryBmi = calculateBMI(entry.weightKg, userProfile.heightCm);
                  return (
                    <tr key={entry.id} className="hover:bg-[#F8F5F2]/60 transition">
                      <td className="py-4 px-6 font-semibold flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
                        {entry.date}
                      </td>
                      <td className="py-4 px-6 font-serif text-lg font-light">
                        {formatWeight(entry.weightKg, unit)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-[#EAE7E4] text-[#1A1A1A] border border-[#1A1A1A]/10">
                          BMI {entryBmi.bmi} ({entryBmi.category})
                        </span>
                      </td>
                      <td className="py-4 px-6 font-serif italic text-[#1A1A1A]/60 max-w-xs truncate">
                        {entry.notes || '—'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onDeleteWeightEntry(entry.id)}
                          className="p-1.5 text-[#1A1A1A]/40 hover:text-rose-800 transition"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Weight */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F8F5F2] border border-[#1A1A1A]/20 max-w-md w-full p-8 shadow-2xl space-y-6 relative text-[#1A1A1A]">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-[#1A1A1A]/50 hover:text-[#1A1A1A] p-1 border border-[#1A1A1A]/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="text-[9px] font-sans uppercase font-bold tracking-[0.25em] text-[#1A1A1A]/50">NEW ENTRY</div>
              <h3 className="text-2xl font-serif font-light text-[#1A1A1A] mt-1">Log Weight</h3>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 font-sans">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/70 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#1A1A1A]/20 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/70 mb-1">
                  Weight ({unit.toUpperCase()})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    required
                    placeholder={unit === 'lbs' ? 'e.g. 176.5' : 'e.g. 80.2'}
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#1A1A1A]/20 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] pr-12 font-serif font-semibold"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-[#1A1A1A] font-bold uppercase">
                    {unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/70 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Morning fasted weight, post workout"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#1A1A1A]/20 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-serif italic"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border border-[#1A1A1A]/20 text-[#1A1A1A] text-xs font-bold uppercase tracking-wider hover:bg-[#EAE7E4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black text-xs font-bold uppercase tracking-wider"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Start Weight & Height */}
      {showEditStartHeightModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#1A1A1A]/20 max-w-md w-full p-8 shadow-2xl space-y-6 relative text-[#1A1A1A]">
            <button
              onClick={() => setShowEditStartHeightModal(false)}
              className="absolute top-5 right-5 text-[#1A1A1A]/50 hover:text-[#1A1A1A] p-1 border border-[#1A1A1A]/10 bg-[#F8F5F2]"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="text-[9px] font-sans uppercase font-bold tracking-[0.25em] text-[#1A1A1A]/50">PROFILE UPDATE</div>
              <h3 className="text-2xl font-serif font-light text-[#1A1A1A] mt-1">Edit Start Weight & Height</h3>
            </div>

            <form onSubmit={handleSaveStartWeightAndHeight} className="space-y-4 font-sans">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/70 mb-1">
                  Start Weight ({unit.toUpperCase()})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="400"
                    required
                    value={editStartWeightVal}
                    onChange={(e) => setEditStartWeightVal(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] pr-12 font-serif font-semibold"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-[#1A1A1A] font-bold uppercase">
                    {unit}
                  </span>
                </div>
                <p className="text-[11px] font-serif text-[#1A1A1A]/50 mt-1">
                  Your baseline starting weight for net progress calculations.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/70">
                    Height (cm)
                  </label>
                  <span className="text-[10px] font-serif italic text-[#1A1A1A]/60">
                    {cmToFeetInches(editHeightCmVal)}
                  </span>
                </div>
                <input
                  type="number"
                  min="100"
                  max="250"
                  required
                  value={editHeightCmVal}
                  onChange={(e) => setEditHeightCmVal(parseInt(e.target.value) || 170)}
                  className="w-full px-4 py-2.5 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-serif font-semibold"
                />
                <p className="text-[11px] font-serif text-[#1A1A1A]/50 mt-1">
                  Used for BMI and daily energy requirement (TDEE) calculations.
                </p>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditStartHeightModal(false)}
                  className="px-5 py-2.5 border border-[#1A1A1A]/20 text-[#1A1A1A] text-xs font-bold uppercase tracking-wider hover:bg-[#EAE7E4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black text-xs font-bold uppercase tracking-wider"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
