import React from 'react';

const FormModal = ({ title, onClose, children, widthClass = 'max-w-xl' }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className={`relative top-10 mx-auto p-5 border w-full ${widthClass} shadow-lg rounded-md bg-white`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default FormModal;


