import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-16 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Instagram IT News Post Creator. All rights reserved.</p>
          <p className="mt-2">A tool for creating professional Instagram posts from IT news articles.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
