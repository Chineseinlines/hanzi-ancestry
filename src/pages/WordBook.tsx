import { Link } from 'react-router-dom';
import { useWordBook } from '../hooks/useWordBook';
import { getCharacter } from '../data/hanziData';

export default function WordBook() {
  const { words, remove } = useWordBook();

  if (words.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">📖</div>
          <h1 className="text-2xl font-display mb-2" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
            Your Word Book
          </h1>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            Browse characters and tap 📖 to add them to your study list.
          </p>
          <Link
            to="/explore"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: '#2D5F8A' }}
          >
            Explore Characters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display mb-1" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
            Word Book
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>{words.length} character{words.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {words.map(char => {
          const entry = getCharacter(char);
          return (
            <div key={char} className="group relative">
              <Link
                to={`/detail?char=${encodeURIComponent(char)}`}
                className="block aspect-square rounded-xl flex flex-col items-center justify-center border transition-all hover:shadow-md"
                style={{ background: '#FDFBF6', borderColor: '#E5E0D8' }}
              >
                <span className="text-2xl font-display-cn" style={{ color: '#1A1A18' }}>{char}</span>
                {entry?.pinyin?.[0] && (
                  <span className="text-[0.6rem] mt-0.5" style={{ color: '#9CA3AF' }}>{entry.pinyin[0]}</span>
                )}
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); remove(char); }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: '#C23B2A' }}
                title="Remove"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
