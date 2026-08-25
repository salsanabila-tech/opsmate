import { ArrowLeft } from 'lucide-react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Link, useNavigate, useParams } from 'react-router-dom';

import { useState } from 'react';

import { TechnicianForm, type TechnicianFormValues } from '../components/technician-form';

import { fetchTechnicianDetail, updateTechnician } from '../services/technician.service';

export function EditTechnicianPage() {
  const { technicianId } = useParams<{
    technicianId: string;
  }>();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const technicianQuery = useQuery({
    queryKey: ['technician', technicianId],

    queryFn: () => {
      if (!technicianId) {
        throw new Error('Technician ID tidak valid');
      }

      return fetchTechnicianDetail(technicianId);
    },

    enabled: Boolean(technicianId),
  });

  const mutation = useMutation({
    mutationFn: (values: TechnicianFormValues) => {
      if (!technicianId) {
        throw new Error('Technician ID tidak valid');
      }

      return updateTechnician(technicianId, {
        name: values.name,

        email: values.email,

        phone: values.phone || null,
      });
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['technicians'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['technician', technicianId],
        }),

        queryClient.invalidateQueries({
          queryKey: ['technician-options'],
        }),
      ]);

      navigate(`/app/technicians/${technicianId}`, {
        replace: true,
      });
    },
  });

  async function handleSubmit(values: TechnicianFormValues) {
    try {
      setErrorMessage(null);

      await mutation.mutateAsync(values);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Technician gagal diperbarui.');
    }
  }

  if (technicianQuery.isPending) {
    return <div className="p-20 text-center text-sm text-gray-400">Memuat technician...</div>;
  }

  if (technicianQuery.isError || !technicianQuery.data) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-700">Technician gagal dimuat.</div>;
  }

  const technician = technicianQuery.data.data.technician;

  return (
    <>
      <Link to={`/app/technicians/${technician.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-950">
        <ArrowLeft className="h-4 w-4" />

        {technician.name}
      </Link>

      <header className="mt-5 mb-8">
        <p className="text-sm font-medium text-gray-400">TEAM</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Edit Technician</h1>

        <p className="mt-2 text-sm text-gray-500">Perbarui profil technician.</p>
      </header>

      <div className="max-w-3xl">
        <TechnicianForm
          mode="edit"
          initialValues={{
            name: technician.name,

            email: technician.email,

            phone: technician.phone ?? '',

            password: '',
          }}
          isSubmitting={mutation.isPending}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
}
