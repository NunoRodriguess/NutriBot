"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import SearchableMultiSelect from "../../components/SearchableMultiSelect";
import { DISEASES, MEDICATIONS, ALLERGIES, DIET } from "../../data/healthData";
import { IUserInfo,Categorie,categorieEnumValues} from "~/models/model";


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
  const [diet, setDiet] = useState<string[]>([]);


  const [bmi, setBmi] = useState<number | null>(null);
  const displayName = user?.fullName ?? user?.username ?? "Your Profile";

  useEffect(() => {

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
  
        const data = await res.json();
        const profile: IUserInfo = data.profile;
  
        if (profile.age) setAge(profile.age.toString());
        if (profile.weight) setWeight(profile.weight.toString());
        if (profile.height) setHeight(profile.height.toString());
        if (profile.sex) setSex(profile.sex);
        if (profile.body_fat) setBodyFat(profile.body_fat.toString());
        if (profile.avg_working_hours) setWorkHours(profile.avg_working_hours.toString());
        if (profile.avg_sleep_hours) setSleepHours(profile.avg_sleep_hours.toString());
        if (profile.imc) setBmi(profile.imc);
        if (profile.physical_activity) setPhysicalActivity(capitalizeFirstLetter(profile.physical_activity));
        if (profile.smoking) setSmoking(capitalizeFirstLetter(profile.smoking));
        if (profile.alcohol_consumption) setAlcohol(capitalizeFirstLetter(profile.alcohol_consumption));
        if (profile.diseases) setDiseases(profile.diseases);
        if (profile.medication) setMedications(profile.medication);
        if (profile.allergies) setAllergies(profile.allergies);
        if (profile.diet) setDiet(profile.diet);
        if (profile.other) setOther(profile.other);
  
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
  
    fetchProfile();

    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      const calculatedBmi = w / (h * h);
      setBmi(parseFloat(calculatedBmi.toFixed(2)));
    } else {
      setBmi(null);
    }
  }, [weight, height]);


    function capitalizeFirstLetter(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const toCategorie = (value: string): Categorie | undefined => {
    return categorieEnumValues.includes(value as Categorie)
      ? (value as Categorie)
      : undefined;
  };

  const handleSave = async () => {

    const username = user?.username ?? user?.firstName;
        if (!username) {
          console.error("Username is missing.");
          return;
    }
    const profileData: IUserInfo = {
      age: age.trim() === "" ? undefined : parseInt(age),
      weight: weight.trim() === "" ? undefined : parseFloat(weight),
      height: height.trim() === "" ? undefined : parseFloat(height),
      imc: bmi ?? undefined,
      sex: sex.trim() === "" ? undefined : sex,
      body_fat: bodyFat.trim() === "" ? undefined : parseFloat(bodyFat),
      avg_working_hours: workHours.trim() === "" ? undefined : parseFloat(workHours),
      avg_sleep_hours: sleepHours.trim() === "" ? undefined : parseFloat(sleepHours),
      physical_activity: toCategorie(physicalActivity.toLowerCase()),
      alcohol_consumption: toCategorie(alcohol.toLowerCase()),
      smoking: toCategorie(smoking.toLowerCase()),
      diseases: diseases.length > 0 ? diseases : undefined,
      medication: medications.length > 0 ? medications : undefined,
      allergies: allergies.length > 0 ? allergies : undefined,
      diet: diet.length > 0 ? diet : undefined,
      other: other.trim() === "" ? undefined : other,
    };
  
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,  // Include username
          profile: profileData,
        }),
      });
  
      if (!res.ok) {
        throw new Error('Failed to update profile');
      }
  
      const result = await res.json();
      console.log('Profile updated successfully:', result);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
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

        <SearchableMultiSelect
        label="Diet"
        options={DIET}
        selected={diet}
        setSelected={setDiet}
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
  "Rarely",
  "Occasionally",
  "Often",
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
