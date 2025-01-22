import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">页面不存在</p>
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 