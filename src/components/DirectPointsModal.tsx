import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config';

interface DirectPointsModalProps {
  player: {
    id: number;
    name: string;
    currentPoints?: number;
  };
  onClose: () => void;
  onPointsUpdated: () => void;
  onError: (message: string) => void;
}

const DirectPointsModal: React.FC<DirectPointsModalProps> = ({
  player,
  onClose,
  onPointsUpdated,
  onError,
}) => {
  const [points, setPoints] = useState<number>(player.currentPoints || 0);
  const [matchName, setMatchName] = useState<string>('Direct Points Update');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (points === null || points === undefined) {
      setError('Please enter a valid number of points');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ADMIN_UPDATE_PLAYER_POINTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          player_id: player.id,
          points: Number(points),
          match_name: matchName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update player points');
      }

      alert('Player points updated successfully!');
      onPointsUpdated();
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update player points';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          disabled={isSubmitting}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Update Points: {player.name}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="-100"
              max="100"
              step="0.5"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Match/Reason
            </label>
            <input
              type="text"
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="E.g., Direct Points Update, Bonus Points, etc."
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Points'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DirectPointsModal;
