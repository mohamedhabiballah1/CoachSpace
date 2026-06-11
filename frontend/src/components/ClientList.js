import React from 'react';

const ClientList = ({ clients, selectedClient, onSelectClient }) => {
  const daysSince = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.floor((now - d) / 86400000);
  };

  if (clients.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-2">
        <div className="py-8 text-center text-[#555] text-[13px]">
          No clients yet.
          <br />
          Add your first one!
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {clients.map((client) => (
        <div
          key={client._id}
          onClick={() => onSelectClient(client)}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[4px] cursor-pointer mb-0.5 transition-all ${
            selectedClient?._id === client._id
              ? 'bg-[#1f1f1f] border-l-2 border-[#c8f135] pl-2.5'
              : 'hover:bg-[#1f1f1f]'
          }`}
        >
          <div className="w-[34px] h-[34px] rounded-full bg-[#1f1f1f] border border-[#383838] flex items-center justify-center font-['DM_Mono'] text-[12px] text-[#888] flex-shrink-0">
            {client.firstName[0]}
            {client.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[#f0ede6] truncate">
              {client.firstName} {client.lastName}
            </div>
            <div className="text-[11px] text-[#555] mt-0.5 font-['DM_Mono']">
              {client.goalType} · {daysSince(client.startDate)}d
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientList;
