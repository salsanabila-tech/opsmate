import { ArrowLeft } from 'lucide-react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Link, useNavigate } from 'react-router-dom';

import { useState } from 'react';

import { CustomerForm, type CustomerFormValues } from '../components/customer-form';

import { createCustomer } from '../services/customer.service';

export function CreateCustomerPage() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createCustomer,

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['customers'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['dashboard'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['customer-options'],
        }),
      ]);

      navigate(`/app/customers/${response.data.customer.id}`, {
        replace: true,
      });
    },
  });

  async function handleSubmit(values: CustomerFormValues) {
    try {
      setErrorMessage(null);

      await mutation.mutateAsync({
        name: values.name,

        phone: values.phone,

        email: values.email || null,

        address: values.address,

        notes: values.notes || null,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Customer gagal dibuat.');
    }
  }

  return (
    <>
      <Link to="/app/customers" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-950">
        <ArrowLeft className="h-4 w-4" />
        Customers
      </Link>

      <header className="mt-5 mb-8">
        <p className="text-sm font-medium text-gray-400">DIRECTORY</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Customer Baru</h1>

        <p className="mt-2 text-sm text-gray-500">Tambahkan customer baru ke OpsMate.</p>
      </header>

      <div className="max-w-3xl">
        <CustomerForm submitLabel="Buat Customer" isSubmitting={mutation.isPending} errorMessage={errorMessage} onSubmit={handleSubmit} />
      </div>
    </>
  );
}
