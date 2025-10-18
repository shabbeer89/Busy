"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateUserData } from "@/types";
import { ChevronLeft, ChevronRight, Mail, User, Phone, Shield } from "lucide-react";

interface ProgressiveSignupFormProps {
  onSubmit: (data: CreateUserData) => Promise<void>;
  isLoading?: boolean;
}

interface SignupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: SignupStep[] = [
  {
    id: 1,
    title: "Basic Information",
    description: "Let's start with your essential details",
    icon: <User className="w-5 h-5" />,
  },
  {
    id: 2,
    title: "Contact Details",
    description: "Add your email and phone number",
    icon: <Mail className="w-5 h-5" />,
  },
  {
    id: 3,
    title: "Account Type",
    description: "Tell us if you're a creator or investor",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: 4,
    title: "Secure Password",
    description: "Create a strong password for your account",
    icon: <Shield className="w-5 h-5" />,
  },
];

export function ProgressiveSignupForm({ onSubmit, isLoading = false }: ProgressiveSignupFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    name: "",
    phoneNumber: "",
    userType: "creator",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = "Full name is required";
        }
        break;
      case 2:
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
        }
        if (!formData.phoneNumber?.trim()) {
          newErrors.phoneNumber = "Phone number is required";
        } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = "Please enter a valid phone number";
        }
        break;
      case 3:
        if (!formData.userType) {
          newErrors.userType = "Please select your account type";
        }
        break;
      case 4:
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      await onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 ${errors.phoneNumber ? "border-red-500" : ""}`}
              />
              {errors.phoneNumber && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                I am a: *
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-700/50 border-slate-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.userType ? "border-red-500" : ""}`}
              >
                <option value="">Select your account type</option>
                <option value="creator">Business Idea Creator</option>
                <option value="investor">Investor</option>
              </select>
              {errors.userType && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.userType}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isLastStep = currentStep === steps.length;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id < currentStep
                    ? "bg-green-500 text-white"
                    : step.id === currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-slate-600 text-slate-300"
                }`}
              >
                {step.id < currentStep ? "✓" : step.id}
              </div>
              {step.id < steps.length && (
                <div
                  className={`w-8 h-1 mx-2 ${
                    step.id < currentStep ? "bg-green-500" : "bg-slate-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{steps[currentStep - 1].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderStepContent()}

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {isLastStep ? (
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext} className="flex items-center gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
