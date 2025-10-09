import { useState } from "react";

type ContactFormStatus = "idle" | "submitting" | "success" | "error";

export const useContactForm = () => {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [company, setCompany] = useState("");
  const [projectBudget, setProjectBudget] = useState("");
  const [projectGoals, setProjectGoals] = useState("");
  const [formStatus, setFormStatus] = useState<ContactFormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setErrorMessage("");

    if (!fullName || !workEmail || !projectGoals) {
      setErrorMessage(
        "Please fill in all required fields (Full Name, Work Email, Project Goals)."
      );
      setFormStatus("error");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          work_email: workEmail,
          company,
          project_budget: projectBudget,
          project_goals: projectGoals,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Unable to submit contact form.");
      }

      setFormStatus("success");
      setFullName("");
      setWorkEmail("");
      setCompany("");
      setProjectBudget("");
      setProjectGoals("");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred.";
      setErrorMessage(`Failed to submit form: ${message}`);
      setFormStatus("error");
    }
  };

  return {
    fullName,
    setFullName,
    workEmail,
    setWorkEmail,
    company,
    setCompany,
    projectBudget,
    setProjectBudget,
    projectGoals,
    setProjectGoals,
    formStatus,
    errorMessage,
    handleSubmit,
  };
};
