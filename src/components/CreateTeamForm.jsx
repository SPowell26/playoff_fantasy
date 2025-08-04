import React, {useState} from 'react';

const CreateTeamForm = ({onSubmit, onCancel}) => {
    const [teamName, setTeamName] = useState('');
    const [owner, setOwner] = useState('');
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!teamName.trim()) {
            newErrors.teamName = 'Team name is required';
        } else if (teamName.trim().length < 2) {
            newErrors.teamName = 'Team name must be at least 2 characters';
        }
        
        if (!owner.trim()) {
            newErrors.owner = 'Owner name is required';
        } else if (owner.trim().length < 2) {
            newErrors.owner = 'Owner name must be at least 2 characters';
        }
        
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        
        if (Object.keys(newErrors).length === 0) {
            try {
                onSubmit(teamName.trim(), owner.trim());
                setTeamName('');
                setOwner('');
                setErrors({});
            } catch (error) {
                console.error('Failed to create team:', error);
                setErrors({ submit: 'Failed to create team. Please try again.' });
            }
        } else {
            setErrors(newErrors);
        }
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Create New Team</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.teamName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter team name"
              required
            />
            {errors.teamName && (
              <p className="text-red-500 text-sm mt-1">{errors.teamName}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Owner
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.owner ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter owner name"
              required
            />
            {errors.owner && (
              <p className="text-red-500 text-sm mt-1">{errors.owner}</p>
            )}
          </div>
          
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.submit}
            </div>
          )}
          
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
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamForm;