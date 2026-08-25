import { ArrowLeft } from 'lucide-react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Link, useNavigate } from 'react-router-dom';

import { useState } from 'react';

import { TechnicianForm, type TechnicianFormValues } from '../components/technician-form';

import { createTechnician } from '../services/technician.service';

export function CreateTechnicianPage() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createTechnician,

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['technicians'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['technician-options'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['dashboard'],
        }),
      ]);

      navigate(`/app/technicians/${response.data.technician.id}`, {
        replace: true,
      });
    },
  });

  async function handleSubmit(values: TechnicianFormValues) {
    try {
      setErrorMessage(null);

      await mutation.mutateAsync({
        name: values.name,

        email: values.email,

        phone: values.phone || undefined,

        password: values.password,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Technician gagal dibuat.');
    }
  }

  return (
    <>
      <Link to="/app/technicians" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-950">
        <ArrowLeft className="h-4 w-4" />
        Technicians
      </Link>

      <header className="mt-5 mb-8">
        <p className="text-sm font-medium text-gray-400">TEAM</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Technician Baru</h1>

        <p className="mt-2 text-sm text-gray-500">Buat akun baru untuk technician OpsMate Mobile.</p>
      </header>

      <div className="max-w-3xl">
        <TechnicianForm mode="create" isSubmitting={mutation.isPending} errorMessage={errorMessage} onSubmit={handleSubmit} />
      </div>
    </>
  );
}
