import React, { useState } from 'react';
import { User, X, Scale, Target, Flame, Activity, Check } from 'lucide-react';
import { UserProfile, DietGoal, ActivityLevel, WeightUnit, DietPreference } from '../types';
import { calculateTDEE, calculateMacroTargets, formatWeight, kgToLbs, lbsToKg, cmToFeetInches } from '../utils/nutrition';

interface UserProfileModalProps {
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userProfile,
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [unit, setUnit] = useState<WeightUnit>(userProfile.unit);

  // Display values depending on active unit
  const [displayStartWeight, setDisplayStartWeight] = useState(
    userProfile.unit === 'lbs' ? kgToLbs(userProfile.startWeightKg).toString() : userProfile.startWeightKg.toString()
  );
  const [displayCurrentWeight, setDisplayCurrentWeight] = useState(
    userProfile.unit === 'lbs' ? kgToLbs(userProfile.currentWeightKg).toString() : userProfile.currentWeightKg.toString()
  );
  const [displayTargetWeight, setDisplayTargetWeight] = useState(
    userProfile.unit === 'lbs' ? kgToLbs(userProfile.targetWeightKg).toString() : userProfile.targetWeightKg.toString()
  );

  const [heightCm, setHeightCm] = useState(userProfile.heightCm);
  const [age, setAge] = useState(userProfile.age);
  const [gender, setGender] = useState(userProfile.gender);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(userProfile.activityLevel);
  const [goal, setGoal] = useState<DietGoal>(userProfile.goal);
  const [dietPreference, setDietPreference] = useState<DietPreference>(userProfile.dietPreference);

  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(userProfile.dailyCalorieTarget);

  if (!isOpen) return null;

  const handleUnitChange = (newUnit: WeightUnit) => {
    if (newUnit === unit) return;

    // Convert current form values to new unit
    const startVal = parseFloat(displayStartWeight) || 70;
    const currentVal = parseFloat(displayCurrentWeight) || 70;
    const targetVal = parseFloat(displayTargetWeight) || 65;

    if (newUnit === 'lbs') {
      setDisplayStartWeight(kgToLbs(startVal).toString());
      setDisplayCurrentWeight(kgToLbs(currentVal).toString());
      setDisplayTargetWeight(kgToLbs(targetVal).toString());
    } else {
      setDisplayStartWeight(lbsToKg(startVal).toString());
      setDisplayCurrentWeight(lbsToKg(currentVal).toString());
      setDisplayTargetWeight(lbsToKg(targetVal).toString());
    }

    setUnit(newUnit);
  };

  const handleRecalculateTDEE = () => {
    const rawCurrentVal = parseFloat(displayCurrentWeight) || 70;
    const currentWeightKg = unit === 'lbs' ? lbsToKg(rawCurrentVal) : rawCurrentVal;

    const calculatedCalories = calculateTDEE({
      gender,
      currentWeightKg,
      heightCm,
      age,
      activityLevel,
      goal,
    });
    setDailyCalorieTarget(calculatedCalories);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const rawStart = parseFloat(displayStartWeight) || 70;
    const rawCurrent = parseFloat(displayCurrentWeight) || 70;
    const rawTarget = parseFloat(displayTargetWeight) || 65;

    const startWeightKg = unit === 'lbs' ? lbsToKg(rawStart) : rawStart;
    const currentWeightKg = unit === 'lbs' ? lbsToKg(rawCurrent) : rawCurrent;
    const targetWeightKg = unit === 'lbs' ? lbsToKg(rawTarget) : rawTarget;

    const macros = calculateMacroTargets(dailyCalorieTarget, goal);

    onSaveProfile({
      name: name.trim() || 'User',
      unit,
      startWeightKg,
      currentWeightKg,
      targetWeightKg,
      heightCm,
      age,
      gender,
      activityLevel,
      goal,
      dietPreference,
      dailyCalorieTarget,
      proteinTargetG: macros.proteinG,
      carbsTargetG: macros.carbsG,
      fatTargetG: macros.fatG,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-[#FFFFFF] border border-[#1A1A1A]/20 max-w-xl w-full p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#1A1A1A]/50 hover:text-[#1A1A1A] p-1 bg-[#F8F5F2] border border-[#1A1A1A]/10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 border-b border-[#1A1A1A]/10 pb-4">
          <div className="w-10 h-10 bg-[#1A1A1A] text-[#F8F5F2] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1A1A1A]/50">ACCOUNT SETTINGS</div>
            <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Edit Diet Profile & Measurements</h3>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">Weight Unit</label>
              <select
                value={unit}
                onChange={(e) => handleUnitChange(e.target.value as WeightUnit)}
                className="w-full px-3.5 py-2.5 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-bold"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                Start Weight ({unit.toUpperCase()})
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={displayStartWeight}
                onChange={(e) => setDisplayStartWeight(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-serif font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                Current Weight ({unit.toUpperCase()})
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={displayCurrentWeight}
                onChange={(e) => setDisplayCurrentWeight(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-serif font-bold text-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">
                Target Weight ({unit.toUpperCase()})
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={displayTargetWeight}
                onChange={(e) => setDisplayTargetWeight(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-serif font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70">
                  Height (cm)
                </label>
                <span className="text-[10px] text-[#1A1A1A]/50 font-serif italic">
                  {cmToFeetInches(heightCm)}
                </span>
              </div>
              <input
                type="number"
                required
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 170)}
                className="w-full px-3 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] font-serif font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">Age</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                className="w-full px-3 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">Primary Diet Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as DietGoal)}
                className="w-full px-3 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              >
                <option value="lose">Weight Loss (Calorie Deficit)</option>
                <option value="maintain">Weight Maintenance</option>
                <option value="gain">Weight / Muscle Gain</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full px-3 py-2 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              >
                <option value="sedentary">Sedentary (Desk Job)</option>
                <option value="light">Light Activity (1-3 days/wk)</option>
                <option value="moderate">Moderate (3-5 days/wk)</option>
                <option value="active">Active (6-7 days/wk)</option>
                <option value="very_active">Very Active / Athlete</option>
              </select>
            </div>
          </div>

          {/* Calorie Calculator Section */}
          <div className="bg-[#F8F5F2] p-4 border border-[#1A1A1A]/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Daily Calorie Allowance Target</span>
              </div>
              <p className="text-[11px] font-serif text-[#1A1A1A]/60 mt-0.5">Calculated based on TDEE formula</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="50"
                value={dailyCalorieTarget}
                onChange={(e) => setDailyCalorieTarget(parseInt(e.target.value) || 2000)}
                className="w-24 px-3 py-1.5 bg-[#FFFFFF] border border-[#1A1A1A]/20 text-sm font-serif font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] text-center"
              />
              <button
                type="button"
                onClick={handleRecalculateTDEE}
                className="px-3 py-2 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black text-[10px] font-bold uppercase tracking-wider transition"
              >
                Auto Calculate
              </button>
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#F8F5F2] border border-[#1A1A1A]/20 text-[#1A1A1A] text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1A1A1A] text-[#F8F5F2] hover:bg-black text-xs font-bold uppercase tracking-widest transition"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
