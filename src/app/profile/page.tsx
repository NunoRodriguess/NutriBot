"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import SearchableMultiSelect from "../../components/SearchableMultiSelect";
import { DISEASES, MEDICATIONS, ALLERGIES } from "../../data/healthData";


export default function ProfilePage() {
  const { user } = useUser();

  const [age, setAge] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [sex, setSex] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<string>("");
  const [workHours, setWorkHours] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<string>("");
  const [other, setOther] = useState<string>("");

  const [physicalActivity, setPhysicalActivity] = useState<string>("");
  const [alcohol, setAlcohol] = useState<string>("");
  const [drugs, setDrugs] = useState<string>("");
  const [smoking, setSmoking] = useState<string>("");

  const [diseases, setDiseases] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);


  const [bmi, setBmi] = useState<number | null>(null);
  const displayName = user?.fullName ?? user?.username ?? "Your Profile";

  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      const calculatedBmi = w / (h * h);
      setBmi(parseFloat(calculatedBmi.toFixed(2)));
    } else {
      setBmi(null);
    }
  }, [weight, height]);

  const handleSave = () => {
    const profileData = {
      age: age.trim() === "" ? null : parseInt(age),
      weight: weight.trim() === "" ? null : parseFloat(weight),
      height: height.trim() === "" ? null : parseFloat(height),
      bmi,
      sex: sex.trim() === "" ? null : sex,
      bodyFat: bodyFat.trim() === "" ? null : parseFloat(bodyFat),
      workHours: workHours.trim() === "" ? null : parseFloat(workHours),
      sleepHours: sleepHours.trim() === "" ? null : parseFloat(sleepHours),
      other: other.trim() === "" ? null : other,
      physicalActivity: physicalActivity || null,
      alcoholConsumption: alcohol || null,
      drugUse: drugs || null,
      smoking: smoking || null,
      diseases: diseases.length > 0 ? diseases : null,
      medications: medications.length > 0 ? medications : null,
      allergies: allergies.length > 0 ? allergies : null,
    };
  
    console.log("Saved profile data:", profileData);
  
    // TODO: Save to backend or database
  };
  
  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <div className="max-w-2xl mx-auto bg-gray-900 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-center text-3xl font-bold text-green-400 mb-6">
        <div>{`${displayName}'s Profile`}</div>
        </h1>

        <Input label="Age" value={age} setValue={setAge} type="number" />
        <Input
          label="Weight (kg)"
          value={weight}
          setValue={setWeight}
          type="number"
          step="0.1"
        />
        <Input
          label="Height (m)"
          value={height}
          setValue={setHeight}
          type="number"
          step="0.01"
        />

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Sex</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select (Optional)</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other / Prefer not to say</option>
          </select>
        </div>

        <Input
          label="Body Fat %"
          value={bodyFat}
          setValue={setBodyFat}
          type="number"
          step="0.1"
        />
        <Input
          label="Average Work Hours (per day)"
          value={workHours}
          setValue={setWorkHours}
          type="number"
          step="0.1"
        />
        <Input
          label="Average Sleep Hours (per night)"
          value={sleepHours}
          setValue={setSleepHours}
          type="number"
          step="0.1"
        />
        <SelectField
          label="Physical Activity"
          value={physicalActivity}
          setValue={setPhysicalActivity}
        />
        <SelectField
          label="Alcohol Consumption"
          value={alcohol}
          setValue={setAlcohol}
        />
        <SelectField label="Drug Use" value={drugs} setValue={setDrugs} />
        <SelectField
          label="Smoking Tobacco"
          value={smoking}
          setValue={setSmoking}
        />

        <SearchableMultiSelect
        label="Chronic Diseases"
        options={DISEASES}
        selected={diseases}
        setSelected={setDiseases}
        />

        <SearchableMultiSelect
        label="Regular Medication"
        options={MEDICATIONS}
        selected={medications}
        setSelected={setMedications}
        />

        <SearchableMultiSelect
        label="Allergies"
        options={ALLERGIES}
        selected={allergies}
        setSelected={setAllergies}
        />


        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Other Notes</label>
          <textarea
            value={other}
            onChange={(e) => setOther(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Optional"
            rows={4}
          />
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <p className="text-lg font-medium">
            BMI:{" "}
            <span className="text-green-400 font-bold">
              {bmi ?? null ? bmi : "N/A"}
            </span>
          </p>
        </div>

        <div className="mt-6 flex justify-center">
            <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition"
            >
                Save
            </button>
        </div>

      </div>
    </div>
  );
}

function Input({
  label,
  value,
  setValue,
  type = "text",
  step,
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Optional"
        step={step}
      />
    </div>
  );
}

const CATEGORY_OPTIONS = [
  "Never",
  "Rarely (1 time per month or less)",
  "Occasionally (2–4 times per month)",
  "Frequently (2–3 times per week)",
  "Daily",
];

function SelectField({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">Select (Optional)</option>
        {CATEGORY_OPTIONS.map((option) => (
          <option key={option} value={option.split(" ")[0]}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
