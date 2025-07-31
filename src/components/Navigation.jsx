import React from 'react';
import {Link, useLocation} from 'react-router-dom';

const Navigation = () => {
    const location = useLocation();

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex items-center justify-between">
                <div className="text-x1 font-bold">Fantasy Playoffs</div>

                <div className="flex space-x-6">
                    <Link
                    to="/"
                    className={`hover:text-gray-300 transition-colors ${
                        location.pathname === '/' ? 'text-blue-400 font-semibold' : ''
                    }`}
                    >
                        Dashboard
                    </Link>

                    <Link
                    to="/league"
                    className={`hover:text-gray-300 transition-colors ${
                        location.pathname.startsWith('/league') ? 'text-blue-400 font-semibold' : ''
                    }`}
                    >
                        League Headquarters
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;