interface FeaturePageProps {
  title: string;
  eyebrow: string;
  description: string;
  cards: [string, string, string];
}

export const FeaturePage = ({ title, eyebrow, description, cards }: FeaturePageProps): JSX.Element => {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="rounded-[28px] border border-[#E8E3DD] bg-white p-6 shadow-soft md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-veda-red">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-veda-dark md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-veda-label md:text-base">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((item) => (
          <div key={item} className="rounded-3xl border border-[#E8E3DD] bg-white p-5 text-sm leading-6 text-veda-label shadow-soft">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};