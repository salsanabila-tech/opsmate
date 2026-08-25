import { ArrowLeft } from 'lucide-react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Link, useNavigate, useParams } from 'react-router-dom';

import { useState } from 'react';

import { CustomerForm, type CustomerFormValues } from '../components/customer-form';

import { fetchCustomerDetail, updateCustomer } from '../services/customer.service';

export function EditCustomerPage() {
  const { customerId } = useParams<{
    customerId: string;
  }>();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const customerQuery = useQuery({
    queryKey: ['customer', customerId],

    queryFn: () => {
      if (!customerId) {
        throw new Error('Customer ID tidak valid');
      }

      return fetchCustomerDetail(customerId);
    },

    enabled: Boolean(customerId),
  });

  const mutation = useMutation({
    mutationFn: (values: CustomerFormValues) => {
      if (!customerId) {
        throw new Error('Customer ID tidak valid');
      }

      return updateCustomer(customerId, {
        name: values.name,

        phone: values.phone,

        email: values.email || null,

        address: values.address,

        notes: values.notes || null,
      });
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['customers'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['customer', customerId],
        }),

        queryClient.invalidateQueries({
          queryKey: ['customer-options'],
        }),
      ]);

      navigate(`/app/customers/${customerId}`, {
        replace: true,
      });
    },
  });

  async function handleSubmit(values: CustomerFormValues) {
    try {
      setErrorMessage(null);

      await mutation.mutateAsync(values);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Customer gagal diperbarui.');
    }
  }

  if (customerQuery.isPending) {
    return <div className="p-20 text-center text-sm text-gray-400">Memuat customer...</div>;
  }

  if (customerQuery.isError || !customerQuery.data) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-700">Customer gagal dimuat.</div>;
  }

  const customer = customerQuery.data.data.customer;

  return (
    <>
      <Link to={`/app/customers/${customer.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-950">
        <ArrowLeft className="h-4 w-4" />

        {customer.name}
      </Link>

      <header className="mt-5 mb-8">
        <p className="text-sm font-medium text-gray-400">DIRECTORY</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Edit Customer</h1>
      </header>

      <div className="max-w-3xl">
        <CustomerForm
          initialValues={{
            name: customer.name,

            phone: customer.phone,

            email: customer.email ?? '',

            address: customer.address,

            notes: customer.notes ?? '',
          }}
          submitLabel="Simpan Perubahan"
          isSubmitting={mutation.isPending}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
}
