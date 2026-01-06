import React, { useState, useEffect } from 'react';
import {Link, useLocation, useParams, useNavigate} from 'react-router-dom';

const Navigation = () => {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    const [leagueLink, setLeagueLink] = useState('/');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Determine the correct league link based on current route
        if (location.pathname.startsWith('/team/') && params.teamId) {
            // On team page - fetch team data to get league ID
            setIsLoading(true);
            fetch(`http://localhost:3001/api/leagues/teams/${params.teamId}`)
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

                <div className="flex space-x-6">
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
                                fetch(`http://localhost:3001/api/leagues/teams/${params.teamId}`)
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
                </div>
            </div>
        </nav>
    );
};

export default Navigation;