import React, { useState, useEffect } from 'react';
import {Link, useLocation, useParams, useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const Navigation = ({ onLoginClick }) => {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, currentCommissioner, logout } = useAuth();
    const [leagueLink, setLeagueLink] = useState('/');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Determine the correct league link based on current route
        if (location.pathname.startsWith('/team/') && params.teamId) {
            // On team page - fetch team data to get league ID
            setIsLoading(true);
            fetch(`${API_URL}/api/leagues/teams/${params.teamId}`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch team');
                    return res.json();
                })
                .then(teamData => {
                    console.log('Navigation: Team data fetched:', teamData);
                    if (teamData.league?.id) {
                        const link = `/league/${teamData.league.id}`;
                        console.log('Navigation: Setting league link to:', link);
                        setLeagueLink(link);
                    } else {
                        console.log('Navigation: No league ID found, using dashboard');
                        setLeagueLink('/');
                    }
                })
                .catch((error) => {
                    console.error('Navigation: Error fetching team:', error);
                    setLeagueLink('/');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else if (location.pathname.startsWith('/league/') && params.leagueId) {
            // On league page - link to this league
            const link = `/league/${params.leagueId}`;
            setLeagueLink(link);
        } else {
            // Dashboard or other pages - link to dashboard
            setLeagueLink('/');
        }
    }, [location.pathname, params.teamId, params.leagueId]);

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex items-center justify-between">
                <div className="text-x1 font-bold">Fantasy Playoffs</div>

                <div className="flex space-x-6 items-center">
                    <Link
                    to="/"
                    className={`hover:text-gray-300 transition-colors ${
                        location.pathname === '/' ? 'text-blue-400 font-semibold' : ''
                    }`}
                    >
                        Dashboard
                    </Link>

                    {location.pathname.startsWith('/team/') && params.teamId ? (
                        // On team page - use onClick to fetch and navigate
                        <button
                            onClick={() => {
                                fetch(`${API_URL}/api/leagues/teams/${params.teamId}`)
                                    .then(res => res.json())
                                    .then(teamData => {
                                        if (teamData.league?.id) {
                                            navigate(`/league/${teamData.league.id}`);
                                        } else {
                                            navigate('/');
                                        }
                                    })
                                    .catch(() => {
                                        navigate('/');
                                    });
                            }}
                            className={`hover:text-gray-300 transition-colors ${
                                location.pathname.startsWith('/league') ? 'text-blue-400 font-semibold' : ''
                            }`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit' }}
                        >
                            League Headquarters
                        </button>
                    ) : (
                        // On other pages - use normal Link
                        <Link
                            to={leagueLink}
                            className={`hover:text-gray-300 transition-colors ${
                                location.pathname.startsWith('/league') ? 'text-blue-400 font-semibold' : ''
                            }`}
                        >
                            League Headquarters
                        </Link>
                    )}

                    {/* Authentication Section */}
                    <div className="ml-6 flex items-center space-x-4 border-l border-gray-600 pl-6">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-300">
                                    Commissioner: {currentCommissioner?.username || currentCommissioner?.email}
                                </span>
                                <button
                                    onClick={logout}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                            >
                                Commissioner Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;