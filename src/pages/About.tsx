import PageHeader from '../components/about/PageHeader';
import BuildingBlocks from '../components/about/BuildingBlocks';
import IDSReferenceTable from '../components/about/IDSReferenceTable';
import EtymologicalConnections from '../components/about/EtymologicalConnections';
import DataAttribution from '../components/about/DataAttribution';
import CTABanner from '../components/about/CTABanner';

export default function About() {
  return (
    <>
      {/* Section 1: Page Header */}
      <PageHeader />

      {/* Ink wash divider */}
      <div className="bg-rice-paper">
        <img
          src="./ink-wash-divider.svg"
          alt=""
          className="mx-auto w-[200px] opacity-40"
        />
      </div>

      {/* Section 2: Building Blocks */}
      <BuildingBlocks />

      {/* Ink wash divider */}
      <div className="bg-bg-warm">
        <img
          src="./ink-wash-divider.svg"
          alt=""
          className="mx-auto w-[200px] opacity-40"
        />
      </div>

      {/* Section 3: IDS Reference Table */}
      <IDSReferenceTable />

      {/* Ink wash divider */}
      <div className="bg-rice-paper">
        <img
          src="./ink-wash-divider.svg"
          alt=""
          className="mx-auto w-[200px] opacity-40"
        />
      </div>

      {/* Section 4: Etymological Connections */}
      <EtymologicalConnections />

      {/* Ink wash divider */}
      <div className="bg-bg-warm">
        <img
          src="./ink-wash-divider.svg"
          alt=""
          className="mx-auto w-[200px] opacity-40"
        />
      </div>

      {/* Section 5: Data Attribution */}
      <DataAttribution />

      {/* Section 6: CTA Banner */}
      <CTABanner />
    </>
  );
}
