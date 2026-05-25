import PageHeader from '../components/about/PageHeader';
import DataAttribution from '../components/about/DataAttribution';

export default function About() {
  return (
    <>
      <PageHeader />

      <div className="bg-rice-paper">
        <img
          src="./ink-wash-divider.svg"
          alt=""
          className="mx-auto w-[200px] opacity-40"
        />
      </div>

      <DataAttribution />
    </>
  );
}
