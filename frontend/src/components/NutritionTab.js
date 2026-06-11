import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';

const emptyPlan = () => ({
  dailyCalories: '', protein: '', carbs: '', fat: '',
  meals: [{ name: 'Breakfast', time: '08:00', foods: [] }],
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
});

const MacroRing = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#2a2a2a" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round" transform="rotate(-90 36 36)" />
        <text x="36" y="40" textAnchor="middle" fill="#f0ede6" fontSize="12" fontFamily="DM Mono">{Math.round(pct)}%</text>
      </svg>
      <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase">{label}</div>
      <div className="font-['Bebas_Neue'] text-[18px]" style={{ color }}>{value}g</div>
    </div>
  );
};

const NutritionTab = ({ clientId }) => {
  const { showToast } = useToast();
  const [plan, setPlan] = useState(null);
  const [form, setForm] = useState(emptyPlan());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/nutrition/plans/${clientId}`);
      setPlan(data);
      setForm({
        dailyCalories: data.dailyCalories || '',
        protein: data.protein || '',
        carbs: data.carbs || '',
        fat: data.fat || '',
        meals: data.meals || [],
        startDate: data.startDate?.slice(0, 10) || '',
        endDate: data.endDate?.slice(0, 10) || '',
      });
    } catch {
      setPlan(null);
      setForm(emptyPlan());
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    try {
      const payload = {
        client: clientId,
        dailyCalories: Number(form.dailyCalories) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
        meals: form.meals,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      };
      if (plan?._id) {
        await api.put(`/api/nutrition/plans/${plan._id}`, payload);
      } else {
        await api.post('/api/nutrition/plans', payload);
      }
      showToast('Nutrition plan saved!', 'success');
      setEditing(false);
      fetchPlan();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const addMeal = () => set('meals', [...form.meals, { name: '', time: '', foods: [] }]);
  const setMeal = (i, k, v) => {
    const meals = [...form.meals];
    meals[i] = { ...meals[i], [k]: v };
    set('meals', meals);
  };
  const removeMeal = (i) => set('meals', form.meals.filter((_, idx) => idx !== i));

  const addFood = (mealIdx) => {
    const meals = [...form.meals];
    meals[mealIdx].foods = [...(meals[mealIdx].foods || []), { name: '', amount: '', unit: 'g', calories: '', protein: '', carbs: '', fat: '' }];
    set('meals', meals);
  };
  const setFood = (mealIdx, foodIdx, k, v) => {
    const meals = [...form.meals];
    meals[mealIdx].foods[foodIdx] = { ...meals[mealIdx].foods[foodIdx], [k]: v };
    set('meals', meals);
  };
  const removeFood = (mealIdx, foodIdx) => {
    const meals = [...form.meals];
    meals[mealIdx].foods = meals[mealIdx].foods.filter((_, i) => i !== foodIdx);
    set('meals', meals);
  };

  const inputClass = "bg-[#1f1f1f] border border-[#383838] text-[#f0ede6] font-['DM_Sans'] text-[13px] px-3 py-2 rounded-[4px] outline-none focus:border-[#c8f135] transition-colors";

  if (loading) return <div className="text-[#555] text-[13px] font-['DM_Sans'] py-8 text-center">Loading...</div>;

  const totalMacroG = (Number(form.protein) || 0) + (Number(form.carbs) || 0) + (Number(form.fat) || 0);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555]">Nutrition Plan</div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="font-['DM_Sans'] text-[13px] px-4 py-2 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">
            {plan ? 'Edit Plan' : 'Create Plan'}
          </button>
        )}
      </div>

      {/* Macro rings display */}
      {(form.protein || form.carbs || form.fat) && (
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-6 mb-6">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="font-['Bebas_Neue'] text-[48px] text-[#c8f135] leading-none">{form.dailyCalories || '—'}</div>
              <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-wide">kcal / day</div>
            </div>
            <MacroRing label="Protein" value={form.protein || 0} total={totalMacroG} color="#5b8af5" />
            <MacroRing label="Carbs"   value={form.carbs   || 0} total={totalMacroG} color="#c8f135" />
            <MacroRing label="Fat"     value={form.fat     || 0} total={totalMacroG} color="#f5a35b" />
          </div>
        </div>
      )}

      {!plan && !editing && (
        <div className="border border-[#2a2a2a] rounded-[4px] p-8 text-center">
          <p className="text-[#555] text-[13px] font-['DM_Sans']">No nutrition plan yet. Click <span className="text-[#c8f135]">Create Plan</span> to add one.</p>
        </div>
      )}

      {editing && (
        <div>
          {/* Macros */}
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-5 mb-5">
            <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.08em] mb-4">Daily Targets</div>
            <div className="grid grid-cols-2 gap-4">
              {[['dailyCalories','Calories (kcal)'],['protein','Protein (g)'],['carbs','Carbs (g)'],['fat','Fat (g)']].map(([k,lbl]) => (
                <div key={k}>
                  <label className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-wide block mb-1">{lbl}</label>
                  <input type="number" value={form[k]} onChange={e => set(k, e.target.value)} placeholder="0" className={inputClass + ' w-full'} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[['startDate','Start Date','date'],['endDate','End Date','date']].map(([k,lbl,type]) => (
                <div key={k}>
                  <label className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-wide block mb-1">{lbl}</label>
                  <input type={type} value={form[k]} onChange={e => set(k, e.target.value)} className={inputClass + ' w-full'} />
                </div>
              ))}
            </div>
          </div>

          {/* Meals */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-['DM_Mono'] text-[10px] text-[#555] uppercase tracking-[0.08em]">Meals</div>
              <button onClick={addMeal} className="font-['DM_Sans'] text-[12px] text-[#c8f135] hover:underline">+ Add Meal</button>
            </div>
            {form.meals.map((meal, mi) => (
              <div key={mi} className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-4 mb-3">
                <div className="flex gap-3 mb-3">
                  <input type="text" value={meal.name} onChange={e => setMeal(mi, 'name', e.target.value)} placeholder="Meal name" className={inputClass + ' flex-1'} />
                  <input type="time" value={meal.time} onChange={e => setMeal(mi, 'time', e.target.value)} className={inputClass + ' w-28'} />
                  <button onClick={() => removeMeal(mi)} className="text-[#e85d4a] text-[13px] hover:opacity-80">✕</button>
                </div>
                {/* Foods */}
                {(meal.foods || []).map((food, fi) => (
                  <div key={fi} className="grid grid-cols-7 gap-2 mb-2 items-center">
                    <input type="text" value={food.name} onChange={e => setFood(mi, fi, 'name', e.target.value)} placeholder="Food" className={inputClass + ' col-span-2'} />
                    <input type="number" value={food.amount} onChange={e => setFood(mi, fi, 'amount', e.target.value)} placeholder="Amt" className={inputClass} />
                    <input type="text" value={food.unit} onChange={e => setFood(mi, fi, 'unit', e.target.value)} placeholder="g" className={inputClass} />
                    <input type="number" value={food.calories} onChange={e => setFood(mi, fi, 'calories', e.target.value)} placeholder="kcal" className={inputClass} />
                    <input type="number" value={food.protein} onChange={e => setFood(mi, fi, 'protein', e.target.value)} placeholder="P(g)" className={inputClass} />
                    <button onClick={() => removeFood(mi, fi)} className="text-[#555] hover:text-[#e85d4a] text-[12px]">✕</button>
                  </div>
                ))}
                <button onClick={() => addFood(mi)} className="font-['DM_Sans'] text-[11px] text-[#555] hover:text-[#c8f135] mt-1">+ Add food</button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="font-['DM_Sans'] text-[13px] font-medium px-5 py-2.5 rounded-[4px] bg-[#c8f135] text-[#0e0e0e] hover:opacity-90 transition-opacity">
              Save Plan
            </button>
            <button onClick={() => { setEditing(false); fetchPlan(); }} className="font-['DM_Sans'] text-[13px] px-5 py-2.5 rounded-[4px] border border-[#383838] text-[#888] hover:text-[#f0ede6] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Read-only meal display */}
      {!editing && plan && (form.meals || []).map((meal, mi) => (
        <div key={mi} className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-4 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-['Bebas_Neue'] text-[18px] text-[#f0ede6]">{meal.name}</span>
            <span className="font-['DM_Mono'] text-[11px] text-[#555]">{meal.time}</span>
          </div>
          {(meal.foods || []).map((food, fi) => (
            <div key={fi} className="flex items-center gap-4 py-1.5 border-b border-[#2a2a2a] last:border-0">
              <span className="text-[13px] text-[#f0ede6] font-['DM_Sans'] flex-1">{food.name}</span>
              <span className="font-['DM_Mono'] text-[11px] text-[#555]">{food.amount}{food.unit}</span>
              <span className="font-['DM_Mono'] text-[11px] text-[#888]">{food.calories} kcal</span>
              <span className="font-['DM_Mono'] text-[11px] text-[#555]">P:{food.protein}g</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default NutritionTab;
