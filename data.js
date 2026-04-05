import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Schedule ────────────────────────────────────────────────────
export const SCHEDULE = {
  0: { day: 'Sunday',    type: 'cardio',  label: 'Cardio Day',        color: '#6C63FF' },
  1: { day: 'Monday',    type: 'rest',    label: 'Rest Day',          color: '#444' },
  2: { day: 'Tuesday',   type: 'workout', label: 'Push Day',          color: '#E94560' },
  3: { day: 'Wednesday', type: 'workout', label: 'Back + Biceps',     color: '#E94560' },
  4: { day: 'Thursday',  type: 'workout', label: 'Leg Day',           color: '#E94560' },
  5: { day: 'Friday',    type: 'rest',    label: 'Rest Day',          color: '#444' },
  6: { day: 'Saturday',  type: 'workout', label: 'Arms & Shoulders',  color: '#E94560' },
};

// ─── Workouts ────────────────────────────────────────────────────
export const WORKOUTS = {
  tuesday: {
    label: 'Push Day', muscles: 'Chest · Shoulders · Triceps',
    exercises: [
      { id: 'db-bench-press',    name: 'Dumbbell Bench Press',            sets: 4, reps: '8–10',     rest: '90s', notes: 'Flat bench, full range of motion',            img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-bench-press.jpg',            url: 'https://liftmanual.com/dumbbell-bench-press/',            muscles: 'Chest, Shoulders, Triceps' },
      { id: 'db-incline-press',  name: 'Dumbbell Incline Bench Press',    sets: 3, reps: '10–12',    rest: '75s', notes: 'Set bench to ~45°, upper chest focus',        img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-incline-bench-press.jpg',    url: 'https://liftmanual.com/dumbbell-incline-bench-press/',    muscles: 'Upper Chest, Front Delts' },
      { id: 'db-fly',            name: 'Dumbbell Fly',                    sets: 3, reps: '12–15',    rest: '60s', notes: 'Slight bend in elbows, stretch at bottom',    img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-fly.jpg',                    url: 'https://liftmanual.com/dumbbell-fly/',                    muscles: 'Chest' },
      { id: 'db-shoulder-press', name: 'Dumbbell Seated Shoulder Press',  sets: 4, reps: '8–10',     rest: '90s', notes: 'Controlled descent, don\'t lock out',          img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-seated-shoulder-press.jpg',  url: 'https://liftmanual.com/dumbbell-seated-shoulder-press/',  muscles: 'Shoulders, Triceps' },
      { id: 'db-lateral-raise',  name: 'Dumbbell Lateral Raise',          sets: 3, reps: '12–15',    rest: '60s', notes: 'Lead with elbows, slight lean forward',        img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-lateral-raise.jpg',          url: 'https://liftmanual.com/dumbbell-lateral-raise/',          muscles: 'Side Delts' },
      { id: 'db-skull-crusher',  name: 'Dumbbell Lying Triceps Extension', sets: 3, reps: '10–12',   rest: '60s', notes: 'Skull crusher on flat bench',                 img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-lying-triceps-extension.jpg', url: 'https://liftmanual.com/dumbbell-lying-triceps-extension/', muscles: 'Triceps' },
      { id: 'db-kickback',       name: 'Dumbbell Kickback',               sets: 3, reps: '12–15',    rest: '45s', notes: 'Pause & squeeze at full extension',            img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-kickback.jpg',               url: 'https://liftmanual.com/dumbbell-kickback/',               muscles: 'Triceps' },
    ]
  },
  wednesday: {
    label: 'Back + Bicep Pump', muscles: 'Back · Biceps',
    exercises: [
      { id: 'db-one-arm-row',       name: 'Dumbbell One Arm Bent Over Row', sets: 4, reps: '8–10',   rest: '75s', notes: 'Chest on bench for support, pull elbow back', img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-one-arm-bent-over-row.jpg', url: 'https://liftmanual.com/dumbbell-one-arm-bent-over-row/', muscles: 'Back, Biceps' },
      { id: 'db-bent-over-row',     name: 'Dumbbell Bent Over Row',         sets: 3, reps: '10–12',  rest: '75s', notes: 'Hinge at hip, flat back, both arms',          img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-bent-over-row.jpg',         url: 'https://liftmanual.com/dumbbell-bent-over-row/',         muscles: 'Back, Biceps' },
      { id: 'db-incline-row',       name: 'Dumbbell Incline Row',           sets: 3, reps: '10–12',  rest: '60s', notes: 'Chest on incline bench, elbows wide',         img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-incline-row.jpg',           url: 'https://liftmanual.com/dumbbell-incline-row/',           muscles: 'Upper Back' },
      { id: 'db-rear-delt-fly',     name: 'Dumbbell Rear Delt Fly',         sets: 3, reps: '12–15',  rest: '60s', notes: 'Bent over, arms out to sides',               img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-rear-delt-fly.jpg',         url: 'https://liftmanual.com/dumbbell-rear-delt-fly/',         muscles: 'Rear Delts' },
      { id: 'db-pullover',          name: 'Dumbbell Pullover',              sets: 3, reps: '12–15',  rest: '60s', notes: 'Across flat bench, lats & serratus',          img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-pullover.jpg',              url: 'https://liftmanual.com/dumbbell-pullover/',              muscles: 'Lats, Serratus' },
      { id: 'db-bicep-curl',        name: 'Dumbbell Biceps Curl',           sets: 3, reps: '10–12',  rest: '60s', notes: 'Alternate arms, no swing',                   img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-biceps-curl.jpg',           url: 'https://liftmanual.com/dumbbell-biceps-curl/',           muscles: 'Biceps' },
      { id: 'db-hammer-curl',       name: 'Dumbbell Hammer Curl',           sets: 3, reps: '12–15',  rest: '45s', notes: 'Neutral grip, targets brachialis',            img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-hammer-curl.jpg',           url: 'https://liftmanual.com/dumbbell-hammer-curl/',           muscles: 'Biceps, Brachialis' },
      { id: 'db-concentration-curl',name: 'Dumbbell Concentration Curl',    sets: 2, reps: '12–15',  rest: '45s', notes: 'Seated, elbow on inner thigh, peak squeeze',  img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-concentration-curl.jpg',    url: 'https://liftmanual.com/dumbbell-concentration-curl/',    muscles: 'Biceps Peak' },
    ]
  },
  thursday: {
    label: 'Leg Day', muscles: 'Quads · Hamstrings · Glutes · Calves',
    exercises: [
      { id: 'db-goblet-squat',  name: 'Dumbbell Goblet Squat',         sets: 4, reps: '10–12',   rest: '90s', notes: 'Hold 1 DB at chest, squat deep',              img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-goblet-squat.jpg',         url: 'https://liftmanual.com/dumbbell-goblet-squat/',         muscles: 'Quads, Glutes' },
      { id: 'db-rdl',           name: 'Dumbbell Romanian Deadlift',    sets: 4, reps: '10–12',   rest: '90s', notes: 'Hinge at hips, feel hamstring stretch',         img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-romanian-deadlift.jpg',    url: 'https://liftmanual.com/dumbbell-romanian-deadlift/',    muscles: 'Hamstrings, Glutes' },
      { id: 'db-bulgarian',     name: 'Dumbbell Bulgarian Split Squat', sets: 3, reps: '10 each', rest: '90s', notes: 'Rear foot elevated on bench',                  img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-bulgarian-split-squat.jpg', url: 'https://liftmanual.com/dumbbell-bulgarian-split-squat/', muscles: 'Quads, Glutes' },
      { id: 'leg-extension',    name: 'Leg Extension (Machine)',       sets: 4, reps: '12–15',   rest: '60s', notes: 'Full extension, squeeze quads at top',          img: 'https://liftmanual.com/wp-content/uploads/2023/04/lever-leg-extension.jpg',           url: 'https://liftmanual.com/lever-leg-extension/',           muscles: 'Quadriceps' },
      { id: 'leg-curl',         name: 'Lying Leg Curl (Machine)',      sets: 4, reps: '10–12',   rest: '60s', notes: 'Slow eccentric on the way down',               img: 'https://liftmanual.com/wp-content/uploads/2023/04/lever-lying-leg-curl.jpg',           url: 'https://liftmanual.com/lever-lying-leg-curl/',           muscles: 'Hamstrings' },
      { id: 'db-hip-thrust',    name: 'Dumbbell Hip Thrust',           sets: 3, reps: '12–15',   rest: '60s', notes: 'Upper back on bench, drive hips up',            img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-hip-thrust.jpg',            url: 'https://liftmanual.com/dumbbell-hip-thrust/',            muscles: 'Glutes' },
      { id: 'db-calf-raise',    name: 'Dumbbell Standing Calf Raise',  sets: 4, reps: '15–20',   rest: '45s', notes: 'Full range, pause at stretch & peak',           img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-standing-calf-raise.jpg',   url: 'https://liftmanual.com/dumbbell-standing-calf-raise/',   muscles: 'Calves' },
    ]
  },
  saturday: {
    label: 'Arms & Shoulders', muscles: 'Biceps · Triceps · Delts · Traps',
    exercises: [
      { id: 'db-arnold-press',      name: 'Dumbbell Arnold Press',            sets: 4, reps: '10–12', rest: '75s', notes: 'Rotate wrists through full arc',                img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-arnold-press.jpg',            url: 'https://liftmanual.com/dumbbell-arnold-press/',            muscles: 'All Deltoid Heads' },
      { id: 'db-lateral-raise-2',   name: 'Dumbbell Lateral Raise (Pump)',    sets: 3, reps: '15–20', rest: '45s', notes: 'Drop the weight, chase the burn',               img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-lateral-raise.jpg',          url: 'https://liftmanual.com/dumbbell-lateral-raise/',          muscles: 'Side Delts' },
      { id: 'db-rear-delt-raise',   name: 'Dumbbell Rear Delt Raise',         sets: 3, reps: '15',    rest: '45s', notes: 'Bent over, rear delt isolation',                img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-rear-delt-raise.jpg',         url: 'https://liftmanual.com/dumbbell-rear-delt-raise/',         muscles: 'Rear Delts' },
      { id: 'db-seated-curl',       name: 'Dumbbell Seated Bicep Curl',       sets: 4, reps: '10–12', rest: '60s', notes: 'Full supination at top of curl',                img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-seated-bicep-curl.jpg',       url: 'https://liftmanual.com/dumbbell-seated-bicep-curl/',       muscles: 'Biceps' },
      { id: 'db-incline-curl',      name: 'Dumbbell Incline Curl',            sets: 3, reps: '10–12', rest: '60s', notes: 'Arms hang behind body for deeper stretch',      img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-incline-curl.jpg',            url: 'https://liftmanual.com/dumbbell-incline-curl/',            muscles: 'Biceps Peak' },
      { id: 'db-overhead-tri-ext',  name: 'Dumbbell Seated Triceps Extension', sets: 4, reps: '10–12', rest: '60s', notes: 'Overhead, both hands on 1 DB',                img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-seated-triceps-extension.jpg', url: 'https://liftmanual.com/dumbbell-seated-triceps-extension/', muscles: 'Triceps' },
      { id: 'bench-dip',            name: 'Bench Dip',                        sets: 3, reps: '12–15', rest: '60s', notes: 'Hands on bench edge, elbows tucked',            img: 'https://liftmanual.com/wp-content/uploads/2023/04/bench-dip-on-floor.jpg',               url: 'https://liftmanual.com/bench-dip-on-floor/',               muscles: 'Triceps, Chest' },
      { id: 'db-shrug',             name: 'Dumbbell Shrug',                   sets: 3, reps: '15–20', rest: '45s', notes: 'Slow & hold at top for trap activation',        img: 'https://liftmanual.com/wp-content/uploads/2023/04/dumbbell-shrug.jpg',                   url: 'https://liftmanual.com/dumbbell-shrug/',                   muscles: 'Traps' },
    ]
  },
  sunday: {
    label: 'Cardio Day', muscles: 'Treadmill · Active Recovery',
    exercises: [
      { id: 'treadmill', name: 'Treadmill Incline Walk', sets: 1, reps: '45 min', rest: '—', notes: 'Incline 8.0 / Speed 2.0 — mandatory', img: 'https://liftmanual.com/wp-content/uploads/2023/04/walking-on-treadmill.jpg', url: 'https://liftmanual.com/cardio/', muscles: 'Full Body Fat Burn' },
    ]
  }
};

export const ALL_EXERCISES = Object.values(WORKOUTS).flatMap(w => w.exercises);

// ─── Meals ───────────────────────────────────────────────────────
export const MEALS = {
  workout: {
    label: 'Workout Day', macros: { carbs: 175, protein: 175, fats: 70 },
    meals: {
      breakfast: [
        { id: 'b1', item: '4 Whole Eggs', note: 'Can add mushrooms, spinach, onions & peppers', cal: 280, carbs: 2, protein: 24, fats: 20 },
        { id: 'b2', item: '45g Quaker Whole Grain Oats', note: 'Old Fashioned — add Stevia to taste', cal: 170, carbs: 30, protein: 6, fats: 3 },
      ],
      lunch: [
        { id: 'l1', item: '170g Ground Beef 93% lean', note: 'Or top sirloin steak or salmon', cal: 265, carbs: 0, protein: 38, fats: 12 },
        { id: 'l2', item: '220g White Rice', note: 'Or 300g White Potatoes', cal: 286, carbs: 63, protein: 5, fats: 0 },
        { id: 'l3', item: '1–2 Cups Green Vegetables', note: '', cal: 40, carbs: 8, protein: 3, fats: 0 },
      ],
      dinner: [
        { id: 'd1', item: '190g Chicken Breast', note: '', cal: 295, carbs: 0, protein: 56, fats: 6 },
        { id: 'd2', item: '340g Sweet Potatoes', note: '', cal: 309, carbs: 72, protein: 6, fats: 0 },
        { id: 'd3', item: '½ Avocado', note: '', cal: 120, carbs: 6, protein: 1, fats: 11 },
        { id: 'd4', item: '1–2 Cups Green Vegetables', note: '', cal: 40, carbs: 8, protein: 3, fats: 0 },
      ],
      lateSnack: [
        { id: 's1', item: '315g Fage Total Plain 2% Greek Yogurt', note: '', cal: 220, carbs: 14, protein: 32, fats: 5 },
        { id: 's2', item: '350g Strawberries', note: 'Or 455g Blackberries', cal: 112, carbs: 27, protein: 2, fats: 1 },
        { id: 's3', item: 'Stevia to taste', note: '', cal: 0, carbs: 0, protein: 0, fats: 0 },
      ]
    }
  },
  rest: {
    label: 'Rest Day', macros: { carbs: 120, protein: 175, fats: 70 },
    meals: {
      breakfast: [
        { id: 'rb1', item: '4 Whole Eggs', note: 'Can add mushrooms, spinach, onions & peppers', cal: 280, carbs: 2, protein: 24, fats: 20 },
        { id: 'rb2', item: '45g Quaker Whole Grain Oats', note: 'Old Fashioned — add Stevia to taste', cal: 170, carbs: 30, protein: 6, fats: 3 },
      ],
      lunch: [
        { id: 'rl1', item: '170g Ground Beef 93% lean', note: 'Or top sirloin steak or salmon', cal: 265, carbs: 0, protein: 38, fats: 12 },
        { id: 'rl2', item: '1–2 Cups Green Vegetables', note: 'No rice or potatoes on rest days', cal: 40, carbs: 8, protein: 3, fats: 0 },
      ],
      dinner: [
        { id: 'rd1', item: '190g Chicken Breast', note: '', cal: 295, carbs: 0, protein: 56, fats: 6 },
        { id: 'rd2', item: '380g Sweet Potatoes', note: '', cal: 345, carbs: 80, protein: 6, fats: 0 },
        { id: 'rd3', item: '½ Avocado', note: '', cal: 120, carbs: 6, protein: 1, fats: 11 },
        { id: 'rd4', item: '1–2 Cups Green Vegetables', note: '', cal: 40, carbs: 8, protein: 3, fats: 0 },
      ],
      lateSnack: [
        { id: 'rs1', item: '315g Fage Total Plain 2% Greek Yogurt', note: '', cal: 220, carbs: 14, protein: 32, fats: 5 },
        { id: 'rs2', item: '350g Strawberries', note: 'Or 455g Blackberries', cal: 112, carbs: 27, protein: 2, fats: 1 },
        { id: 'rs3', item: 'Stevia to taste', note: '', cal: 0, carbs: 0, protein: 0, fats: 0 },
      ]
    }
  }
};

export const SUPPLEMENTS = {
  morning:    { label: 'Morning — With First Meal',      icon: '🌅', items: [
    { id: 'sup-m1', name: 'Thyroid Energy',        dose: '1 serving' },
    { id: 'sup-m2', name: 'Multivitamin',           dose: '1 serving' },
    { id: 'sup-m3', name: 'Vitamin D3',             dose: '15,000 IU' },
    { id: 'sup-m4', name: 'Vitamin C',              dose: '2,000 mg' },
    { id: 'sup-m5', name: 'Creatine Monohydrate',   dose: '5 grams' },
  ]},
  preWorkout: { label: 'Pre-Workout — 30 Min Before',    icon: '⚡', items: [
    { id: 'sup-p1', name: 'L-Carnitine Tartrate',   dose: '2,000 mg' },
  ]},
  night:      { label: 'Night — With Last Meal',         icon: '🌙', items: [
    { id: 'sup-n1', name: 'Zinc Picolinate',         dose: '50 mg' },
    { id: 'sup-n2', name: 'Vitamin D3',              dose: '15,000 IU' },
    { id: 'sup-n3', name: 'Magnesium Glycinate',     dose: '800 mg' },
    { id: 'sup-n4', name: 'Magnesium Calm Powder',   dose: '1–2 scoops before bed' },
  ]}
};

export const MEAL_LABELS = {
  breakfast: { label: 'Breakfast',        emoji: '🌅' },
  lunch:     { label: 'Lunch',            emoji: '☀️' },
  dinner:    { label: 'Dinner',           emoji: '🌆' },
  lateSnack: { label: 'Late Night Snack', emoji: '🌙' },
};

// ─── Helpers ─────────────────────────────────────────────────────
export const todayKey  = () => new Date().toISOString().split('T')[0];
export const getDayKey = (date) => {
  const day = new Date(date + 'T12:00:00').getDay();
  return { 2:'tuesday', 3:'wednesday', 4:'thursday', 6:'saturday', 0:'sunday' }[day] || null;
};
export const getMealType = (date) => {
  const day = new Date(date + 'T12:00:00').getDay();
  return (day === 1 || day === 5) ? 'rest' : 'workout';
};
export const isRestDay = (date) => {
  const day = new Date(date + 'T12:00:00').getDay();
  return day === 1 || day === 5;
};
