import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-gray-900">
          情人节贺卡生成器
        </a>
        <nav className="flex gap-4">
          <a 
            href="/templates"
            className="px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
          >
            模板管理
          </a>
        </nav>
      </div>
    </header>
  );
} 