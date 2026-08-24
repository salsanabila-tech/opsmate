type Props = {
  title: string;

  description: string;
};

export function PlaceholderPage({ title, description }: Props) {
  return (
    <>
      <header>
        <p className="text-sm font-medium text-gray-400">OPSMATE</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">{title}</h1>

        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </header>

      <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-400">Halaman akan dibangun pada tahap berikutnya.</div>
    </>
  );
}
