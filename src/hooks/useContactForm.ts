import { useState } from 'react';
import { supabase } from '@/supabaseClient';

export const useContactForm = () => {
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [company, setCompany] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [projectGoals, setProjectGoals] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage('');

    if (!fullName || !workEmail || !projectGoals) {
      setErrorMessage('Please fill in all required fields (Full Name, Work Email, Project Goals).');
      setFormStatus('error');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          full_name: fullName,
          work_email: workEmail,
          company: company,
          project_budget: projectBudget,
          project_goals: projectGoals,
        }])
        .select();

      if (error) throw error;

      console.log('Contact form submitted successfully:', data);
      setFormStatus('success');
      setFullName('');
      setWorkEmail('');
      setCompany('');
      setProjectBudget('');
      setProjectGoals('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred.';
      setErrorMessage(`Failed to submit form: ${message}`);
      setFormStatus('error');
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
    handleSubmit
  };
};
