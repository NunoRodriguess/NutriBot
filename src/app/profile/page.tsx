"use client"

import type React from "react"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import SearchableMultiSelect from "../../components/SearchableMultiSelect"
import { DISEASES, MEDICATIONS, ALLERGIES, DIET } from "../../data/healthData"
import { type IUserInfo, type Categorie, categorieEnumValues } from "~/models/model"
import {
  User,
  Clock,
  Activity,
  Droplet,
  Heart,
  Coffee,
  Moon,
  Wine,
  Cigarette,
  Pill,
  AlertTriangle,
  Apple,
  FileText,
  Save,
  ArrowRight,
  ChevronDown,
} from "lucide-react"

interface Particle {
  width: number
  height: number
  top: number
  left: number
  opacity: number
}

export default function ProfilePage() {
  const { user } = useUser()
  const [profileLoaded, setProfileLoaded] = useState(false)

  const [age, setAge] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const [height, setHeight] = useState<string>("")
  const [sex, setSex] = useState<string>("")
  const [bodyFat, setBodyFat] = useState<string>("")
  const [workHours, setWorkHours] = useState<string>("")
  const [sleepHours, setSleepHours] = useState<string>("")
  const [other, setOther] = useState<string>("")

  const [physicalActivity, setPhysicalActivity] = useState<string>("")
  const [alcohol, setAlcohol] = useState<string>("")
  const [drugs, setDrugs] = useState<string>("")
  const [smoking, setSmoking] = useState<string>("")

  const [diseases, setDiseases] = useState<string[]>([])
  const [medications, setMedications] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [diet, setDiet] = useState<string[]>([])

  const [bmi, setBmi] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<string>("basic")
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  // State for background particles to prevent hydration mismatch
  const [particles, setParticles] = useState<Particle[]>([])

  const displayName = user?.fullName ?? user?.username ?? "Your Profile"

  // Generate particles on client side only
  useEffect(() => {
    const generatedParticles: Particle[] = Array.from({ length: 20 }).map(() => ({
      width: Math.random() * 10 + 5,
      height: Math.random() * 10 + 5,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.2,
    }))
    setParticles(generatedParticles)
  }, [])

  // Effect for fetching profile data (only depends on user)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user.username) {
        return;
      }
      const username = user.username ?? user.firstName;
      if (!username) {
        console.error("No username available");
        console.log("Set to loaded ... no good")
        setProfileLoaded(true); // Still set to true to stop loading
        return;
      }
      try {
        console.log("Fetching the user with username: ", user.username)
        const res = await fetch(`/api/profile?username=${encodeURIComponent(user.username)}`);
        if (!res.ok) {
          // Handle different status codes
          if (res.status === 404) {
            console.log("Profile not found - this might be a new user");
            return; // Don't throw error for new users
          }
          throw new Error(`Failed to fetch profile: ${res.status}`);
        }
        const data = await res.json()
        console.log(data)
        const profile: IUserInfo = data.profile.personal_info

        if (profile.age) setAge(profile.age.toString())
        if (profile.weight) setWeight(profile.weight.toString())
        if (profile.height) setHeight(profile.height.toString())
        if (profile.sex) setSex(profile.sex)
        if (profile.body_fat) setBodyFat(profile.body_fat.toString())
        if (profile.avg_working_hours) setWorkHours(profile.avg_working_hours.toString())
        if (profile.avg_sleep_hours) setSleepHours(profile.avg_sleep_hours.toString())
        if (profile.imc) setBmi(profile.imc)
        if (profile.physical_activity) setPhysicalActivity(capitalizeFirstLetter(profile.physical_activity))
        if (profile.smoking) setSmoking(capitalizeFirstLetter(profile.smoking))
        if (profile.alcohol_consumption) setAlcohol(capitalizeFirstLetter(profile.alcohol_consumption))
        if (profile.diseases) setDiseases(profile.diseases)
        if (profile.medication) setMedications(profile.medication)
        if (profile.allergies) setAllergies(profile.allergies)
        if (profile.diet) setDiet(profile.diet)
        if (profile.other) setOther(profile.other)
      } catch (err) {
        console.error("Error loading profile:", err)
      } finally {
        console.log("Set to loaded")
        setProfileLoaded(true);
      }
    }

    fetchProfile()
  }, [user]) // Only depends on user, not weight/height

  // Separate effect for BMI calculation (only depends on weight and height)
  useEffect(() => {
    const w = Number.parseFloat(weight)
    const h = Number.parseFloat(height)
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      const calculatedBmi = w / (h * h)
      setBmi(Number.parseFloat(calculatedBmi.toFixed(2)))
    } else {
      setBmi(null)
    }
  }, [weight, height]) // Only depends on weight and height

  function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const toCategorie = (value: string): Categorie | undefined => {
    return categorieEnumValues.includes(value as Categorie) ? (value as Categorie) : undefined
  }

  const handleSave = async () => {
    const username = user?.username ?? user?.firstName
    if (!username) {
      console.error("Username is missing.")
      return
    }

    setIsSaving(true)

    const profileData: IUserInfo = {
      age: age.trim() === "" ? undefined : Number.parseInt(age),
      weight: weight.trim() === "" ? undefined : Number.parseFloat(weight),
      height: height.trim() === "" ? undefined : Number.parseFloat(height),
      imc: bmi ?? undefined,
      sex: sex.trim() === "" ? undefined : sex,
      body_fat: bodyFat.trim() === "" ? undefined : Number.parseFloat(bodyFat),
      avg_working_hours: workHours.trim() === "" ? undefined : Number.parseFloat(workHours),
      avg_sleep_hours: sleepHours.trim() === "" ? undefined : Number.parseFloat(sleepHours),
      physical_activity: toCategorie(physicalActivity.toLowerCase()),
      alcohol_consumption: toCategorie(alcohol.toLowerCase()),
      smoking: toCategorie(smoking.toLowerCase()),
      diseases: diseases.length > 0 ? diseases : undefined,
      medication: medications.length > 0 ? medications : undefined,
      allergies: allergies.length > 0 ? allergies : undefined,
      diet: diet.length > 0 ? diet : undefined,
      other: other.trim() === "" ? undefined : other,
    }

    try {
      if (!user || !user.username) {
        return;
      }
      const res = await fetch(`/api/profile?username=${encodeURIComponent(user.username)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: profileData,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update profile")
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const sections = [
    { id: "basic", label: "Basic Info", icon: <User className="h-5 w-5" /> },
    { id: "lifestyle", label: "Lifestyle", icon: <Activity className="h-5 w-5" /> },
    { id: "health", label: "Health", icon: <Heart className="h-5 w-5" /> },
    { id: "diet", label: "Diet", icon: <Apple className="h-5 w-5" /> },
    { id: "notes", label: "Notes", icon: <FileText className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#023535] to-[#015958] text-[#D8FFDB] pb-20">
      {/* Header */}
      <div className="relative mb-8 overflow-hidden bg-[#008F8C] py-12">
        <div className="absolute inset-0 opacity-10">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                top: `${particle.top}%`,
                left: `${particle.left}%`,
                opacity: particle.opacity,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4">
          <h1 className="text-center text-3xl font-bold text-white">{displayName}'s Nutrition Profile</h1>
          <p className="mt-2 text-center text-[#C7FFED]/80">
            Complete your profile to get personalized nutrition recommendations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-xl bg-[#023535]/80 shadow-xl backdrop-blur-sm">
          {/* Section Tabs */}
          <div className="flex flex-wrap border-b border-[#015958]/30 px-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "border-b-2 border-[#C7FFED] text-[#C7FFED]"
                    : "text-[#D8FFDB]/70 hover:text-[#D8FFDB]"
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Basic Info Section */}
            {activeSection === "basic" && (
              <div className="space-y-6">
                <h2 className="flex items-center text-xl font-semibold text-[#C7FFED]">
                  <User className="mr-2 h-5 w-5" />
                  Basic Information
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormInput
                    label="Age"
                    value={age}
                    onChange={setAge}
                    type="number"
                    icon={<Clock className="h-5 w-5 text-[#C7FFED]" />}
                    disabled={!profileLoaded}
                  />

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-[#D8FFDB]">
                      <User className="mr-2 h-5 w-5 text-[#C7FFED]" />
                      Sex
                    </label>
                    <div className="relative">
                      <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        disabled={!profileLoaded}
                        className="w-full appearance-none rounded-lg border border-[#008F8C]/30 bg-[#015958]/30 px-4 py-3 pr-10 text-[#D8FFDB] focus:border-[#008F8C] focus:outline-none focus:ring-1 focus:ring-[#008F8C] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select (Optional)</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other / Prefer not to say</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C7FFED]" />
                    </div>
                  </div>

                  <FormInput
                    label="Weight (kg)"
                    value={weight}
                    onChange={setWeight}
                    type="number"
                    step="0.1"
                    icon={<Activity className="h-5 w-5 text-[#C7FFED]" />}
                    disabled={!profileLoaded}
                  />

                  <FormInput
                    label="Height (m)"
                    value={height}
                    onChange={setHeight}
                    type="number"
                    step="0.01"
                    icon={<ArrowRight className="h-5 w-5 text-[#C7FFED] rotate-90" />}
                    disabled={!profileLoaded}
                  />

                  <FormInput
                    label="Body Fat %"
                    value={bodyFat}
                    onChange={setBodyFat}
                    type="number"
                    step="0.1"
                    icon={<Droplet className="h-5 w-5 text-[#C7FFED]" />}
                    disabled={!profileLoaded}
                  />

                  {/* BMI Card */}
                  <div className="rounded-lg border border-[#008F8C]/30 bg-[#015958]/30 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-[#D8FFDB]">Body Mass Index (BMI)</h3>
                        <p className="text-xs text-[#D8FFDB]/70">Based on your height and weight</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#C7FFED]">{bmi ? bmi.toFixed(1) : "—"}</p>
                        <p className="text-xs text-[#D8FFDB]/70">
                          {bmi
                            ? bmi < 18.5
                              ? "Underweight"
                              : bmi < 25
                                ? "Normal weight"
                                : bmi < 30
                                  ? "Overweight"
                                  : "Obese"
                            : "Enter height & weight"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lifestyle Section */}
            {activeSection === "lifestyle" && (
              <div className="space-y-6">
                <h2 className="flex items-center text-xl font-semibold text-[#C7FFED]">
                  <Activity className="mr-2 h-5 w-5" />
                  Lifestyle Information
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormInput
                    label="Average Work Hours (per day)"
                    value={workHours}
                    onChange={setWorkHours}
                    type="number"
                    step="0.1"
                    icon={<Coffee className="h-5 w-5 text-[#C7FFED]" />}
                    disabled={!profileLoaded}
                  />

                  <FormInput
                    label="Average Sleep Hours (per night)"
                    value={sleepHours}
                    onChange={setSleepHours}
                    type="number"
                    step="0.1"
                    icon={<Moon className="h-5 w-5 text-[#C7FFED]" />}
                    disabled={!profileLoaded}
                  />

                  <FormSelect
                    label="Physical Activity"
                    value={physicalActivity}
                    onChange={setPhysicalActivity}
                    icon={<Activity className="h-5 w-5 text-[#C7FFED]" />}
                    disabled={!profileLoaded}
                  />

                  <FormSelect
                    label="Alcohol Consumption"
                    value={alcohol}
                    onChange={setAlcohol}
                    icon={<Wine className="h-5 w-5 text-[#C7FFED]" />}
                    disabled={!profileLoaded}
                  />

                  <FormSelect
                    label="Drug Use"
                    value={drugs}
                    onChange={setDrugs}
                    icon={<Pill className="h-5 w-5 text-[#C7FFED]" />}
                    disabled={!profileLoaded}
                  />

                  <FormSelect
                    label="Smoking Tobacco"
                    value={smoking}
                    onChange={setSmoking}
                    icon={<Cigarette className="h-5 w-5 text-[#C7FFED]" />}
                    disabled={!profileLoaded}
                  />
                </div>
              </div>
            )}

            {/* Health Section */}
            {activeSection === "health" && (
              <div className="space-y-6">
                <h2 className="flex items-center text-xl font-semibold text-[#C7FFED]">
                  <Heart className="mr-2 h-5 w-5" />
                  Health Information
                </h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-[#D8FFDB]">
                      <Heart className="mr-2 h-5 w-5 text-[#C7FFED]" />
                      Chronic Diseases
                    </label>
                    <SearchableMultiSelect
                      label="Chronic Diseases"
                      options={DISEASES}
                      selected={diseases}
                      setSelected={setDiseases}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-[#D8FFDB]">
                      <Pill className="mr-2 h-5 w-5 text-[#C7FFED]" />
                      Regular Medication
                    </label>
                    <SearchableMultiSelect
                      label="Regular Medication"
                      options={MEDICATIONS}
                      selected={medications}
                      setSelected={setMedications}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-[#D8FFDB]">
                      <AlertTriangle className="mr-2 h-5 w-5 text-[#C7FFED]" />
                      Allergies
                    </label>
                    <SearchableMultiSelect
                      label="Allergies"
                      options={ALLERGIES}
                      selected={allergies}
                      setSelected={setAllergies}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Diet Section */}
            {activeSection === "diet" && (
              <div className="space-y-6">
                <h2 className="flex items-center text-xl font-semibold text-[#C7FFED]">
                  <Apple className="mr-2 h-5 w-5" />
                  Diet Information
                </h2>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-[#D8FFDB]">
                    <Apple className="mr-2 h-5 w-5 text-[#C7FFED]" />
                    Diet Preferences
                  </label>
                  <SearchableMultiSelect label="Diet" options={DIET} selected={diet} setSelected={setDiet} />
                </div>
              </div>
            )}

            {/* Notes Section */}
            {activeSection === "notes" && (
              <div className="space-y-6">
                <h2 className="flex items-center text-xl font-semibold text-[#C7FFED]">
                  <FileText className="mr-2 h-5 w-5" />
                  Additional Notes
                </h2>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-[#D8FFDB]">
                    <FileText className="mr-2 h-5 w-5 text-[#C7FFED]" />
                    Other Health Information
                  </label>
                  <textarea
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    disabled={!profileLoaded}
                    className="w-full rounded-lg border border-[#008F8C]/30 bg-[#015958]/30 px-4 py-3 text-[#D8FFDB] placeholder-[#D8FFDB]/50 focus:border-[#008F8C] focus:outline-none focus:ring-1 focus:ring-[#008F8C] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Any other health information you'd like to share..."
                    rows={6}
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex items-center justify-between">
              <div>{saveSuccess && <p className="text-sm text-[#C7FFED]">Profile saved successfully!</p>}</div>
              <button
                onClick={handleSave}
                disabled={isSaving || !profileLoaded}
                className="flex items-center rounded-lg bg-[#008F8C] px-6 py-3 font-medium text-white transition-colors hover:bg-[#008F8C]/80 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  step,
  icon,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (val: string) => void
  type?: string
  step?: string
  icon?: React.ReactNode
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-[#D8FFDB]">
        {icon}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-[#008F8C]/30 bg-[#015958]/30 px-4 py-3 text-[#D8FFDB] placeholder-[#D8FFDB]/50 focus:border-[#008F8C] focus:outline-none focus:ring-1 focus:ring-[#008F8C] disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder="Optional"
        step={step}
      />
    </div>
  )
}

const CATEGORY_OPTIONS = ["Never", "Rarely", "Occasionally", "Often", "Daily"]

function FormSelect({
  label,
  value,
  onChange,
  icon,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (val: string) => void
  icon?: React.ReactNode
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-[#D8FFDB]">
        {icon}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-lg border border-[#008F8C]/30 bg-[#015958]/30 px-4 py-3 pr-10 text-[#D8FFDB] focus:border-[#008F8C] focus:outline-none focus:ring-1 focus:ring-[#008F8C] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select (Optional)</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C7FFED]" />
      </div>
    </div>
  )
}