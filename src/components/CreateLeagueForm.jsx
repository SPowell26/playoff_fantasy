import React, {useState} from 'react';

const CreateLeagueForm = ({onSubmit, onCancel}) => {
    const [leagueName, setLeagueName] = useState('');
    const [commissioner, setCommissioner] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if ( leagueName.trim() && commissioner.trim()) {
            onSubmit(leagueName.trim(), commissioner.trim());
            setLeagueName('');
            setCommissioner('');
        }
    };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Create New League</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              League Name
            </label>
            <input
              type="text"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter league name"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commissioner
            </label>
            <input
              type="text"
              value={commissioner}
              onChange={(e) => setCommissioner(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter commissioner name"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create League
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeagueForm; 