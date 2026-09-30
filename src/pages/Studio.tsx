export default function Studio() {
  const studioUrl = 'https://cninlines.github.io/chineseinlines-hanzi-ai-studio/';

  return (
    <div className="relative min-h-[100dvh] pt-16">
      <iframe
        src={studioUrl}
        title="AI 创编"
        className="h-[calc(100dvh-4rem)] w-full border-0 bg-bg-primary"
        allow="clipboard-read; clipboard-write; autoplay"
      />
    </div>
  );
}