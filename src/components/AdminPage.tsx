import React, { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config';
import { useNavigate } from 'react-router-dom';
import TeamUpdatesLock from './TeamUpdatesLock';
import UserCard from './UserCard';
import UserDetailModal from './UserDetailModal';

interface LatestPerformance {
  goals: number;
  assists: number;
  clean_sheet: boolean;
  goals_conceded: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
  bonus_points: number;
  match_name: string | null;
  match_date: string | null;
  match_id: number | null;
}

interface Player {
  id: number;
  name: string;
  position: string;
  price: number;
  house?: string;
  total_points?: number;
  latest_performance?: LatestPerformance | null;
}

interface Game {
  id: number;
  name: string;
  date: string;
}

interface PlayerStatsModalProps {
  player: Player;
  games: Game[];
  selectedGameId: number | null;
  onClose: () => void;
  onSaveStats: (playerId: number, gameId: number, stats: Omit<LatestPerformance, 'match_name' | 'match_date' | 'match_id'>) => Promise<void>;
  onResetPoints: (playerId: number) => Promise<void>;
  onGameChange: (gameId: number) => void;
  onCreateNewGame: (name: string, date: string) => Promise<void>;
  onError: (message: string) => void;
}

interface GameCreationFormProps {
  onCreateNewGame: (name: string, date: string) => Promise<void>;
}

const GameCreationForm: React.FC<GameCreationFormProps> = ({ onCreateNewGame }) => {
  const [newGameName, setNewGameName] = useState('');
  const [newGameDate, setNewGameDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmitNewGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGameName && newGameDate) {
      await onCreateNewGame(newGameName, newGameDate + 'T00:00:00Z');
      setNewGameName('');
      setNewGameDate(new Date().toISOString().slice(0, 10));
    }
  };

  return (
    <form onSubmit={handleSubmitNewGame} className="flex flex-col md:flex-row gap-4">
      <input
        type="text"
        placeholder="New Game Name (e.g., Game 2)"
        value={newGameName}
        onChange={(e) => setNewGameName(e.target.value)}
        className="flex-grow mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        required
      />
      <input
        type="date"
        value={newGameDate}
        onChange={(e) => setNewGameDate(e.target.value)}
        className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        required
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700"
      >
        Create Game
      </button>
    </form>
  );
};

const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({
  player,
  games,
  selectedGameId,
  onClose,
  onSaveStats,
  onResetPoints,
  onGameChange,
  onCreateNewGame,
  onError,
}) => {
  const [form, setForm] = useState({
    goals: player.latest_performance?.goals || 0,
    assists: player.latest_performance?.assists || 0,
    clean_sheet: player.latest_performance?.clean_sheet || false,
    goals_conceded: player.latest_performance?.goals_conceded || 0,
    yellow_cards: player.latest_performance?.yellow_cards || 0,
    red_cards: player.latest_performance?.red_cards || 0,
    minutes_played: player.latest_performance?.minutes_played || 0,
    bonus_points: player.latest_performance?.bonus_points || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when player or selectedGameId changes
    setForm({
      goals: player.latest_performance?.goals || 0,
      assists: player.latest_performance?.assists || 0,
      clean_sheet: player.latest_performance?.clean_sheet || false,
      goals_conceded: player.latest_performance?.goals_conceded || 0,
      yellow_cards: player.latest_performance?.yellow_cards || 0,
      red_cards: player.latest_performance?.red_cards || 0,
      minutes_played: player.latest_performance?.minutes_played || 0,
      bonus_points: player.latest_performance?.bonus_points || 0,
    });
  }, [player, selectedGameId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name } = target;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setForm(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: Number(target.value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId) {
      setError('Please select a game.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSaveStats(player.id, selectedGameId, form);
    } catch (err: any) {
      setError(err.message || 'Failed to save stats.');
      onError(err.message || 'Failed to save stats.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-2">Assign Points: {player.name}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Game</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedGameId || ''}
            onChange={e => onGameChange(Number(e.target.value))}
          >
            <option value="">-- Select a Game --</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.name} ({new Date(game.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col text-sm">Goals
              <input type="number" name="goals" min="0" value={form.goals} onChange={handleChange} className="border rounded px-2 py-1" />
            </label>
            <label className="flex flex-col text-sm">Assists
              <input type="number" name="assists" min="0" value={form.assists} onChange={handleChange} className="border rounded px-2 py-1" />
            </label>
            <label className="flex flex-col text-sm">Clean Sheet
              <input type="checkbox" name="clean_sheet" checked={form.clean_sheet} onChange={handleChange} className="mt-2" />
            </label>
            <label className="flex flex-col text-sm">Goals Conceded
              <input type="number" name="goals_conceded" min="0" value={form.goals_conceded} onChange={handleChange} className="border rounded px-2 py-1" />
            </label>
            <label className="flex flex-col text-sm">Yellow Cards
              <input type="number" name="yellow_cards" min="0" value={form.yellow_cards} onChange={handleChange} className="border rounded px-2 py-1" />
            </label>
            <label className="flex flex-col text-sm">Red Cards
              <input type="number" name="red_cards" min="0" value={form.red_cards} onChange={handleChange} className="border rounded px-2 py-1" />
            </label>
            <label className="flex flex-col text-sm">Minutes Played
              <input type="number" name="minutes_played" min="0" value={form.minutes_played} onChange={handleChange} className="border rounded px-2 py-1" />
            </label>
            <label className="flex flex-col text-sm">Bonus Points
              <input type="number" name="bonus_points" min="0" value={form.bonus_points} onChange={handleChange} className="border rounded px-2 py-1" />
            </label>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Stats'}
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-auto"
              onClick={() => onResetPoints(player.id)}
            >
              Reset Player Points
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleError = useCallback((message: string) => {
    setError(message);
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  // State for sorting
  const [sortByHouse, setSortByHouse] = useState<string | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUserTeam, setSelectedUserTeam] = useState<any | null>(null);
  const [userFilter, setUserFilter] = useState<'all' | 'students' | 'teachers'>('all');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  });

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch players
      const playersResponse = await fetch(API_ENDPOINTS.ADMIN_PLAYERS, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!playersResponse.ok) {
        throw new Error(`HTTP error! status: ${playersResponse.status} from players API`);
      }
      const playersData: Player[] = await playersResponse.json();
      setAllPlayers(playersData);

      // Fetch games
      const gamesResponse = await fetch(API_ENDPOINTS.ADMIN_GAMES, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!gamesResponse.ok) {
        throw new Error(`HTTP error! status: ${gamesResponse.status} from games API`);
      }
      const gamesData: Game[] = await gamesResponse.json();
      setGames(gamesData);

      // Set the latest game as default selected
      if (gamesData.length > 0) {
        setSelectedGameId(gamesData[0].id);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load initial admin data.');
      console.error("Error fetching initial admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const sortedPlayers = React.useMemo(() => {
    let playersToSort = [...allPlayers];
    if (sortByHouse) {
      playersToSort.sort((a, b) => {
        if (a.house === sortByHouse && b.house !== sortByHouse) return -1;
        if (a.house !== sortByHouse && b.house === sortByHouse) return 1;
        return a.name.localeCompare(b.name);
      });
    }
    return playersToSort;
  }, [allPlayers, sortByHouse]);

  const handleOpenModal = (player: Player) => {
    setSelectedPlayerForModal(player);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlayerForModal(null);
    fetchInitialData();
  };

  const handleSaveStats = async (playerId: number, gameId: number, stats: Omit<LatestPerformance, 'match_name' | 'match_date' | 'match_id'>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ADD_MATCH_PERFORMANCE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          match_id: gameId,
          players_performance: [{ player_id: playerId, ...stats }]
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      alert('Stats saved successfully!');
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save stats.');
      console.error("Error saving stats:", err);
      throw err;
    }
  };

  const handleResetPoints = async (playerId: number) => {
    if (!window.confirm(`Are you sure you want to reset all points for player ${allPlayers.find(p => p.id === playerId)?.name}?`)) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.ADMIN_RESET_PLAYER_POINTS}/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      alert('Player points reset successfully!');
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Failed to reset player points.');
      console.error("Error resetting player points:", err);
      throw err;
    }
  };

  const handleCreateNewGame = async (name: string, date: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ADMIN_GAMES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, date }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const newGame = await response.json();
      alert(`Game ${newGame.game.name} created successfully!`);
      fetchInitialData();
      setSelectedGameId(newGame.game.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create new game.');
      console.error("Error creating game:", err);
      throw err;
    }
  };

  const handleDeleteGame = async (gameId: number) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.ADMIN_GAMES}/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      alert('Game deleted successfully!');
      fetchInitialData();
      setSelectedGameId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete game.');
      console.error("Error deleting game:", err);
      throw err;
    }
  };

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching users with token:', token ? 'Token exists' : 'No token');
      console.log('Fetching from URL:', API_ENDPOINTS.ADMIN_USERS);
      
      const response = await fetch(API_ENDPOINTS.ADMIN_USERS, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      
      const data = await response.json();
      console.log('Received users data:', data);
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (err: any) {
      console.error('Error in fetchUsers:', err);
      setError(err.message || 'Failed to fetch users.');
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Add effect to filter users when userFilter changes
  useEffect(() => {
    if (userFilter === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.user_type === userFilter));
    }
  }, [userFilter, users]);

  // Fetch team for selected user
  const handleUserCardClick = async (user: any) => {
    setSelectedUser(user);
    setUserModalOpen(true);
    setSelectedUserTeam(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.ADMIN_USER_TEAM}/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedUserTeam(data);
      }
    } catch {}
  };

  // News content state
  const [newsScout, setNewsScout] = useState('');
  const [newsDay, setNewsDay] = useState('');
  const [newsTeam, setNewsTeam] = useState('');
  const [newsPlayer, setNewsPlayer] = useState('');
  const [newsFixtures, setNewsFixtures] = useState('');
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsMsg, setNewsMsg] = useState<string|null>(null);
  const [newsError, setNewsError] = useState<string|null>(null);

  // Simulate fetch on mount (replace with real API call later)
  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsError(null);
      try {
        const res = await fetch('/api/admin/news');
        const data = await res.json();
        if (data.content) {
          const parsed = JSON.parse(data.content);
          setNewsScout(parsed.scout || '');
          setNewsDay(parsed.day || '');
          setNewsTeam(parsed.team || '');
          setNewsPlayer(parsed.player || '');
          setNewsFixtures(parsed.fixtures || '');
        }
      } catch (e) {
        setNewsError('Failed to load news content.');
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleSaveNews = async () => {
    setNewsLoading(true);
    setNewsMsg(null);
    setNewsError(null);
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          scout: newsScout,
          day: newsDay,
          team: newsTeam,
          player: newsPlayer,
          fixtures: newsFixtures
        })
      });
      if (!res.ok) throw new Error('Failed to save');
      setNewsMsg('News content saved!');
    } catch (e) {
      setNewsError('Failed to save news content.');
    } finally {
      setNewsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-600 ml-4">Loading admin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => { setError(null); fetchInitialData(); }}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">Admin: Player Performance Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* News Page Content Editor */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Update News Page Content</h2>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSaveNews(); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scout's Report</label>
            <textarea className="w-full border rounded px-3 py-2 min-h-[60px]" placeholder="Enter scout's report..." value={newsScout} onChange={e => setNewsScout(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day Report</label>
            <textarea className="w-full border rounded px-3 py-2 min-h-[60px]" placeholder="Enter day report..." value={newsDay} onChange={e => setNewsDay(e.target.value)} />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Team of the Day</label>
              <input className="w-full border rounded px-3 py-2" placeholder="Enter team name..." value={newsTeam} onChange={e => setNewsTeam(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Player of the Day</label>
              <input className="w-full border rounded px-3 py-2" placeholder="Enter player name..." value={newsPlayer} onChange={e => setNewsPlayer(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fixtures (one per line, format: Time | Match | Venue)</label>
            <textarea className="w-full border rounded px-3 py-2 min-h-[60px] font-mono" placeholder="09:00 | Hyderabad FC vs Oberoi United | Main Ground\n11:00 | Kashmir Kings vs Tata Titans | Main Ground" value={newsFixtures} onChange={e => setNewsFixtures(e.target.value)} />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow mt-2 disabled:opacity-60" disabled={newsLoading}>{newsLoading ? 'Saving...' : 'Save News Content'}</button>
          {newsMsg && <div className="text-green-600 font-medium mt-2">{newsMsg}</div>}
          {newsError && <div className="text-red-600 font-medium mt-2">{newsError}</div>}
        </form>
      </div>

      {/* Game Selection/Creation */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Manage Games</h2>
        
        <div className="mb-4">
          <label htmlFor="selectGame" className="block text-sm font-medium text-gray-700">Select Game</label>
          <div className="flex items-center gap-2">
            <select
              id="selectGame"
              value={selectedGameId || ''}
              onChange={(e) => setSelectedGameId(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            >
              <option value="">-- Select a Game --</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>
                  {game.name} ({new Date(game.date).toLocaleDateString()})
                </option>
              ))}
            </select>
            {selectedGameId && (
              <button
                onClick={() => handleDeleteGame(selectedGameId)}
                className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors text-sm"
                title="Delete selected game"
              >
                Delete Selected
              </button>
            )}
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Create New Game</h3>
          <GameCreationForm onCreateNewGame={handleCreateNewGame} />
        </div>
      </div>

      {/* Team Updates Lock Toggle */}
      <div className="mb-6">
        <TeamUpdatesLock onError={handleError} />
      </div>

      {/* Player Grid with Sorting */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Players Overview</h2>
        <div className="mb-4">
          <label htmlFor="sortByHouse" className="block text-sm font-medium text-gray-700">Sort by House</label>
          <select
            id="sortByHouse"
            value={sortByHouse || 'All'}
            onChange={(e) => setSortByHouse(e.target.value === 'All' ? null : e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          >
            <option value="All">All Houses</option>
            {Array.from(new Set(allPlayers.map(p => p.house))).filter(Boolean).map(house => (
              <option key={house} value={house}>{house}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedPlayers.map(player => (
            <div
              key={player.id}
              className="bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleOpenModal(player)}
            >
              <h3 className="text-lg font-semibold text-gray-800">{player.name}</h3>
              <p className="text-sm text-gray-600">{player.position} - {player.house}</p>
              <p className="text-sm text-gray-600">Total Points: <span className="font-bold">{player.total_points || 0}</span></p>
              {player.latest_performance && (
                <p className="text-xs text-gray-500 mt-1">
                  Latest: {player.latest_performance.goals}G {player.latest_performance.assists}A ({player.latest_performance.match_name})
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Player Stats Entry Modal */}
      {isModalOpen && selectedPlayerForModal && selectedGameId && (
        <PlayerStatsModal
          player={selectedPlayerForModal}
          games={games}
          selectedGameId={selectedGameId}
          onClose={handleCloseModal}
          onSaveStats={handleSaveStats}
          onResetPoints={handleResetPoints}
          onGameChange={setSelectedGameId}
          onCreateNewGame={handleCreateNewGame}
          onError={handleError}
        />
      )}

      {/* Users Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-700">Users</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setUserFilter('all')}
              className={`px-4 py-2 rounded-md ${
                userFilter === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setUserFilter('students')}
              className={`px-4 py-2 rounded-md ${
                userFilter === 'students'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setUserFilter('teachers')}
              className={`px-4 py-2 rounded-md ${
                userFilter === 'teachers'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Teachers
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredUsers.map(user => (
            <UserCard key={user.id} user={user} onClick={() => handleUserCardClick(user)} />
          ))}
        </div>
      </div>

      {userModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          team={selectedUserTeam}
          onClose={() => setUserModalOpen(false)}
          onUserDeleted={fetchUsers}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default AdminPage;


